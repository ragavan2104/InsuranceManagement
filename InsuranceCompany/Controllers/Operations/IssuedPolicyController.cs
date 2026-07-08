using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InsuranceCompany.Data;
using InsuranceCompany.Models.Operations;
using log4net;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace InsuranceCompany.Controllers.Operations
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class IssuedPolicyController : ControllerBase
    {
        private readonly AppDbContext _context;
        private static readonly ILog _log = LogManager.GetLogger(typeof(IssuedPolicyController));

        public IssuedPolicyController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("my")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetMyIssuedPolicies()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("User not identified.");
                int userId = int.Parse(userIdClaim);

                var policies = await _context.IssuedPolicies
                    .Include(p => p.InsurancePolicy)
                    .Include(p => p.Proposal)
                        .ThenInclude(pr => pr!.Quote)
                    .Where(p => p.UserId == userId)
                    .OrderByDescending(p => p.IssuedAt)
                    .ToListAsync();

                return Ok(policies);
            }
            catch (Exception ex)
            {
                _log.Error("Error getting user issued policies", ex);
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<IActionResult> GetAllIssuedPolicies()
        {
            try
            {
                var policies = await _context.IssuedPolicies
                    .Include(p => p.User)
                    .Include(p => p.InsurancePolicy)
                    .Include(p => p.Proposal)
                        .ThenInclude(pr => pr!.Quote)
                    .OrderByDescending(p => p.IssuedAt)
                    .ToListAsync();

                return Ok(policies);
            }
            catch (Exception ex)
            {
                _log.Error("Error getting all issued policies", ex);
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPost("cancel/{id}")]
        public async Task<IActionResult> CancelIssuedPolicy(int id)
        {
            try
            {
                var policy = await _context.IssuedPolicies
                    .Include(p => p.Proposal)
                    .FirstOrDefaultAsync(p => p.IssuedPolicyId == id);

                if (policy == null) return NotFound("Policy not found.");

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
                int userId = int.Parse(userIdClaim);

                bool isAdminOrOfficer = User.IsInRole("Admin") || User.IsInRole("Officer");
                bool isOwner = policy.UserId == userId || (policy.Proposal != null && policy.Proposal.UserId == userId);

                if (!isAdminOrOfficer && !isOwner)
                {
                    return Forbid();
                }

                if (policy.Status == "Cancelled")
                {
                    return BadRequest("Policy is already cancelled.");
                }

                policy.Status = "Cancelled";
                await _context.SaveChangesAsync();

                _log.Info($"IssuedPolicyId {id} was successfully cancelled.");
                return Ok(new { Message = "Policy successfully cancelled.", Status = "Cancelled" });
            }
            catch (Exception ex)
            {
                _log.Error("Error cancelling policy", ex);
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPost("renew/{id}")]
        public async Task<IActionResult> RenewIssuedPolicy(int id)
        {
            try
            {
                var policy = await _context.IssuedPolicies
                    .Include(p => p.Proposal)
                    .Include(p => p.InsurancePolicy)
                    .FirstOrDefaultAsync(p => p.IssuedPolicyId == id);

                if (policy == null) return NotFound("Policy not found.");

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
                int userId = int.Parse(userIdClaim);

                bool isAdminOrOfficer = User.IsInRole("Admin") || User.IsInRole("Officer");
                bool isOwner = policy.UserId == userId || (policy.Proposal != null && policy.Proposal.UserId == userId);

                if (!isAdminOrOfficer && !isOwner)
                {
                    return Forbid();
                }

                if (policy.Status == "Cancelled")
                {
                    return BadRequest("Cannot renew a cancelled policy.");
                }

                int durationMonths = policy.InsurancePolicy?.PolicyDurationMonths ?? 12;
                
                if (policy.EndDate > DateTime.Now)
                {
                    policy.EndDate = policy.EndDate.AddMonths(durationMonths);
                }
                else
                {
                    policy.EndDate = DateTime.Now.AddMonths(durationMonths);
                }

                policy.Status = "Active";
                await _context.SaveChangesAsync();

                _log.Info($"IssuedPolicyId {id} was successfully renewed. New EndDate: {policy.EndDate}");
                return Ok(new { Message = "Policy successfully renewed.", EndDate = policy.EndDate, Status = "Active" });
            }
            catch (Exception ex)
            {
                _log.Error("Error renewing policy", ex);
                return StatusCode(500, "Internal server error.");
            }
        }
    }
}
