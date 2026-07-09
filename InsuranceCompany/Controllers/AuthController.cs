using Microsoft.AspNetCore.Mvc;
using InsuranceCompany.Models.Authentication;
using InsuranceCompany.Data;
using InsuranceCompany.DTOs.Authentication;
using InsuranceCompany.Services.Authentication;
using InsuranceCompany.Services.Communications;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using log4net; 
using System;
using System.Linq;
using System.Threading.Tasks;

namespace InsuranceCompany.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private static readonly ILog _log = LogManager.GetLogger(typeof(AuthController));

        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IValidator<UserRegisterDto> _registerValidator;
        private readonly IEmailService _emailService;

        public AuthController(
            AppDbContext context, 
            ITokenService tokenService, 
            IPasswordHasher passwordHasher, 
            IValidator<UserRegisterDto> registerValidator,
            IEmailService emailService)
        {
            _context = context;
            _tokenService = tokenService;
            _passwordHasher = passwordHasher;
            _registerValidator = registerValidator;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
        {
            _log.Info("Registering new user.");

            var validationResult = await _registerValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                _log.Warn("Invalid Email Format.");
                return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
            }

            try
            {
                if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                {
                    _log.Warn("Email already exists.");
                    return BadRequest("Email already exists");
                }

                if (await _context.Users.AnyAsync(u => u.Phone == dto.Phone))
                {
                    _log.Warn($"Phone number already exist");
                    return BadRequest("Phone number already exists");
                }

                var assignedRole = await _context.Roles.FindAsync(dto.RoleId);
                if (assignedRole == null)
                {
                    _log.Warn("Invalid RoleId ");
                    return BadRequest("Invalid RoleId");
                }

                if (assignedRole.RoleName != "User")
                {
                    _log.Warn($"Registration attempt blocked: Public registration is only allowed for 'User' role. Attempted: {assignedRole.RoleName}");
                    return BadRequest("Only customer accounts ('User' role) can be created via the public registration page.");
                }

                int calculatedAge = DateTime.Today.Year - dto.DateOfBirth.Year;
                if (dto.DateOfBirth > DateTime.Today.AddYears(-calculatedAge))
                {
                    calculatedAge--;
                }

                if (dto.DateOfBirth > DateTime.Today)
                {
                    _log.Warn("Date of birth cannot be in the future");
                    return BadRequest("Date of birth cannot be in the future.");
                }

                if (calculatedAge < 18)
                {
                    _log.Warn($"Registration rejected: User must be at least 18 years old. Calculated age: {calculatedAge}");
                    return BadRequest("You must be at least 18 years old to register.");
                }

                var newUser = new User
                {
                    FullName = dto.FullName,
                    Email = dto.Email,
                    PasswordHash = _passwordHasher.HashPassword(dto.Password),
                    Phone = dto.Phone,
                    Address = dto.Address,
                    AadhaarNumber = dto.AadhaarNumber,
                    PANNumber = dto.PANNumber,
                    DateOfBirth = dto.DateOfBirth,
                    Age = calculatedAge,
                    RoleId = dto.RoleId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                _log.Info($"User Created Successfully.");
                return Ok(new { Message = "User registered successfully" });
            }
            catch (Exception ex)
            {
                _log.Error(ex);
                return StatusCode(500, "An internal error occurred .");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
            {
                _log.Warn("Invalid login credentials provided.");
                return BadRequest("Email and Password are required");
            }

            _log.Info($"Login authentication verification .");

            try
            {
                var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == dto.Email);
                if (user == null)
                {
                    _log.Warn($"Authentication failed");
                    return Unauthorized("Invalid email or password");
                }

                bool isPasswordValid = _passwordHasher.VerifyPassword(dto.Password, user.PasswordHash);
                if (!isPasswordValid)
                {
                    _log.Warn($"Authentication Failed.");
                    return Unauthorized("Invalid email or password");
                }

                if (!user.IsActive)
                {
                    _log.Warn($"User is inactive: {user.UserId}");
                    return Unauthorized("User account is inactive");
                }

                string roleName = user.Role != null ? user.Role.RoleName : "User";
                string token = _tokenService.CreateToken(user, roleName);

                var newResponse = new AuthResponseDto
                {
                    Token = token,
                    UserId = user.UserId,
                    FullName = user.FullName,
                    Email = user.Email,
                    RoleName = roleName
                };

                _log.Info("User Login successful.");
                return Ok(newResponse);
            }
            catch (Exception ex)
            {
                _log.Error(ex);
                return StatusCode(500, "An Internal Error");
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.Email))
            {
                return BadRequest("Email is required");
            }

            _log.Info($"Forgot password requested for email: {dto.Email}");

            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
                if (user == null)
                {
                    return BadRequest("Email address is not registered.");
                }

                var recoveryToken = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
                
                string subject = "AutoShield Protection - Recover Your Password";
                string htmlBody = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                        <h2 style='color: #009087;'>AutoShield Protection Portal</h2>
                        <p>Hello <strong>{user.FullName}</strong>,</p>
                        <p>We received a request to recover the password for your coverage account.</p>
                        <p>Please use the following temporary security token to reset your password:</p>
                        <div style='background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #333; margin: 20px 0; border-radius: 5px;'>
                            {recoveryToken}
                        </div>
                        <p>If you did not request this, you can safely ignore this email.</p>
                        <hr style='border: none; border-top: 1px solid #eee;' />
                        <p style='font-size: 11px; color: #999;'>This is an automated notification from AutoShield Protection. Please do not reply to this email.</p>
                    </div>";

                await _emailService.SendEmailAsync(user.Email, subject, htmlBody, "ForgotPassword", user.UserId);

                return Ok(new { Message = "If the email is registered, a password recovery link has been sent." });
            }
            catch (Exception ex)
            {
                _log.Error("Error in ForgotPassword flow", ex);
                return StatusCode(500, "An internal error occurred.");
            }
        }
    }
}