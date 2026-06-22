using Microsoft.AspNetCore.Mvc;
using InsuranceCompany.Models.Authentication;
using InsuranceCompany.Data;
using InsuranceCompany.DTOs.Authentication;
using InsuranceCompany.Services.Authentication;
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

        public AuthController(AppDbContext context, ITokenService tokenService, IPasswordHasher passwordHasher, IValidator<UserRegisterDto> registerValidator)
        {
            _context = context;
            _tokenService = tokenService;
            _passwordHasher = passwordHasher;
            _registerValidator = registerValidator;
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

                int calculatedAge = DateTime.Today.Year - dto.DateOfBirth.Year;
                if (dto.DateOfBirth > DateTime.Today.AddYears(-calculatedAge))
                {
                    calculatedAge--;
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
    }
}