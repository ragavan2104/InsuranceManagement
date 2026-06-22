using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using InsuranceCompany.DTOs.PolicyManagement;
using InsuranceCompany.Services.PolicyManagement;
using log4net; // Added for log4net

namespace InsuranceCompany.Controllers.PolicyManagement
{
    [Route("api/[controller]")]
    [ApiController]
    public class PolicyController : ControllerBase
    {
        private readonly IPolicyService _policyService;
        // Instantiating the log4net logger for this controller class
        private static readonly ILog _log = LogManager.GetLogger(typeof(PolicyController));

        public PolicyController(IPolicyService policyService)
        {
            _policyService = policyService;
        }

        [HttpGet]
        public async Task<IActionResult> AllPolicy()
        {
            try
            {
                _log.Info("Received GET request for all active policies.");

                var policies = await _policyService.GetAllActivePoliciesAsync();
                if (policies == null)
                {
                    _log.Warn("No active policies.");
                    return NotFound(new
                    {
                        StatusCode = StatusCodes.Status404NotFound,
                        Message = "No active policies found."
                    });
                }

                return Ok(policies);
            }
            catch (Exception ex)
            {
                _log.Error("Error handling GET request for all policies.", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPolicyById(int id)
        {
            try
            {
                _log.Info($"Received GET request for Policy ID: {id}");

                var policy = await _policyService.GetPolicyByIdAsync(id);
                if (policy == null)
                {
                    _log.Warn($"Policy with ID {id} was not found.");
                    return NotFound(new
                    {
                        StatusCode = StatusCodes.Status404NotFound,
                        Message = $"Policy with ID {id} not found."
                    });
                }

                return Ok(policy);
            }
            catch (Exception ex)
            {
                _log.Error(ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
            }
        }
        [HttpPost("AddPolicy")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreatePolicy([FromBody] PolicyCreateDto dto)
        {
            try
            {
                _log.Info($"Received POST request to create a new policy: '{dto?.PolicyName}'");

                if (!ModelState.IsValid)
                {
                    _log.Warn("Invalid model state submitted.");
                    return BadRequest(ModelState);
                }

                var adminIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(adminIdClaim))
                {
                    _log.Warn("Unauthorized policy creation attempt: Missing NameIdentifier claim.");
                    return Unauthorized("Could not resolve admin identification credentials.");
                }

                int adminId = int.Parse(adminIdClaim);

                var createdPolicy = await _policyService.CreatePolicyAsync(adminId, dto);
                _log.Info($"Successfully created policy with ID: {createdPolicy.PolicyId}");

                return CreatedAtAction(nameof(GetPolicyById), new { id = createdPolicy.PolicyId }, createdPolicy);
            }
            catch (Exception ex)
            {
                _log.Error(ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
            }
        }
        [HttpPut("UpdatePolicy/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePolicy(int id, [FromBody] PolicyUpdateDto dto)
        {
            try
            {
                _log.Info("Updating Policy");

                if (!User.IsInRole("Admin"))
                {
                    _log.Warn("Unauthorized policy update attempt.");
                    return Forbid();
                }

                if (!ModelState.IsValid)
                {
                    _log.Warn("Invalid values");
                    return BadRequest(ModelState);
                }

                var policy = await _policyService.GetPolicyByIdAsync(id);
                if (policy == null)
                {
                    _log.Warn("Does not Exist.");
                    return NotFound(new
                    {
                        StatusCode = StatusCodes.Status404NotFound,
                        Message = "Policy ID not found."
                    });
                }

                await _policyService.UpdatePolicyAsync(id, dto);
                _log.Info($"Successfully updated records for Policy ID: {id}");

                return NoContent();
            }
            catch (Exception ex)
            {
                _log.Error(ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
            }
        }
    }
}