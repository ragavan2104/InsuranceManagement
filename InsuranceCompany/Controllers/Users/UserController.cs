using Microsoft.AspNetCore.Authorization;
using InsuranceCompany.Services.Authentication;
using InsuranceCompany.Services.PolicyManagement;
using log4net;
using InsuranceCompany.Services.Users;
using InsuranceCompany.DTOs.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InsuranceCompany.Controllers.Users
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> logger;
        private readonly IUserService userService;
        public UserController(ILogger<UserController> logger, IUserService userService)
        {
            this.logger = logger;
            this.userService = userService;
        }
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await userService.GetAllUserAsync();
                return Ok(users);

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while fetching all users.");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

                int currentUserId = int.Parse(userIdClaim);
                bool isAdmin = User.IsInRole("Admin");

                if (!isAdmin && currentUserId != id)
                {
                    return Forbid();
                }

                var user = await userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { Message = $"User with ID {id} not found." });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while fetching user ID {id}.");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }
    }
}
