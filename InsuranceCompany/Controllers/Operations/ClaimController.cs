using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using InsuranceCompany.Dtos.Claims;
using InsuranceCompany.Services.Claims;
using log4net;

namespace InsuranceCompany.Controllers.Operations
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClaimController : ControllerBase
    {
        private readonly IClaimService _claimService;
        private static readonly ILog _log = LogManager.GetLogger(typeof(ClaimController));

        public ClaimController(IClaimService claimService)
        {
            _claimService = claimService;
        }

        [HttpPost("file")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> FileClaim([FromBody] ClaimFileDto dto)
        {
            _log.Info($"Request received to file claim for PolicyId: {dto.IssuedPolicyId}");

            if (!ModelState.IsValid)
            {
                _log.Warn("FileClaim request failed model validation.");
                return BadRequest(new { Error = ModelState });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                _log.Warn("FileClaim blocked: userId could not be extracted from token.");
                return Unauthorized(new { Error = "Invalid user identity." });
            }

            int userId = int.Parse(userIdClaim);
            var createdClaim = await _claimService.FileClaimAsync(userId, dto);

            _log.Info($"Claim ID {createdClaim.ClaimId} successfully filed by User ID: {userId}");
            return StatusCode(StatusCodes.Status201Created, createdClaim);
        }

        [HttpGet("my-history")]
        [Authorize(Roles = "User,Officer,Admin")] 
        public async Task<IActionResult> GetMyClaimsHistory()
        {
            _log.Info("Request received to fetch customer claims history.");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                _log.Warn("GetMyClaimsHistory blocked: userId could not be extracted from token.");
                return Unauthorized(new { Error = "Invalid token claims." });
            }

            int userId = int.Parse(userIdClaim);

            _log.Info($"Fetching claims history for User ID: {userId}");
            var history = await _claimService.GetCustomerClaimsHistoryAsync(userId);

            return Ok(history);
        }

        [HttpGet("pending-queue")]
        [Authorize(Roles = "Officer,Admin")]
        public async Task<IActionResult> GetPendingQueue()
        {
            _log.Info("Officer fetching pending claims dashboard workbench queue.");

            var claims = await _claimService.GetPendingClaimsQueueAsync();

            var flatQueue = claims.Select(c => new
            {
                ClaimId = c.ClaimId,
                IssuedPolicyId = c.IssuedPolicyId,
                PolicyNumber = c.IssuedPolicy?.PolicyNumber ?? "N/A",
                PolicyName = c.IssuedPolicy?.InsurancePolicy?.PolicyName ?? "Standard Policy",
                EstimatedLossAmount = c.EstimatedLossAmount,
                IncidentDescription = c.IncidentDescription,
                IncidentDate = c.IncidentDate,
                Status = c.Status,
                FiledAt = c.FiledAt
            });

            return Ok(flatQueue);
        }

        [HttpPut("{id}/review")]
        [Authorize(Roles = "Officer,Admin")]
        public async Task<IActionResult> ReviewClaim(int id, [FromBody] ClaimReviewDto dto)
        {
            _log.Info($"Request received to review Claim ID: {id}");

            if (!ModelState.IsValid)
            {
                _log.Warn($"ReviewClaim request failed model validation for Claim ID: {id}");
                return BadRequest(new { Error = ModelState });
            }

            var officerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(officerIdClaim))
            {
                _log.Warn("ReviewClaim blocked: officerId could not be extracted from token.");
                return Unauthorized(new { Error = "Missing identity credentials." });
            }

            int officerId = int.Parse(officerIdClaim);

            var statusChanged = await _claimService.ReviewClaimAsync(id, officerId, dto);
            if (!statusChanged)
            {
                _log.Warn($"Claim ID {id} not found.");
                return NotFound(new { Error = $"Claim with ID {id} not found." });
            }

            _log.Info($"Claim ID {id} successfully marked as: {dto.Status}");
            return Ok(new { Message = $"Claim has been marked as '{dto.Status}' successfully." });
        }

        [HttpGet("{id}/Status")]
        [Authorize(Roles = "User,Officer,Admin")]
        public async Task<IActionResult> TrackClaimStatus(int id)
        {
            _log.Info($"User requesting tracking metrics for Claim ID: {id}");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("Invalid token identity claims.");
            int userId = int.Parse(userIdClaim);

            bool isAdminOrOfficer = User.IsInRole("Admin") || User.IsInRole("Officer");

            var claim = await _claimService.TrackClaimStatusAsync(id, userId, isAdminOrOfficer);
            if (claim == null)
            {
                _log.Warn($"Claim tracking reference {id} returned 404.");
                return NotFound($"No claim found matching reference identifier: {id}");
            }

            var trackingStatus = new
            {
                ClaimId = claim.ClaimId,
                IssuedPolicyId = claim.IssuedPolicyId,
                PolicyNumber = claim.IssuedPolicy?.PolicyNumber,
                CurrentStatus = claim.Status,
                EstimatedLossAmount = claim.EstimatedLossAmount,
                ApprovedSettlementAmount = claim.ApprovedSettlementAmount,
                OfficerRemarks = claim.OfficerRemarks ?? "Your claim is currently under evaluation by our underwriting team.",
                FiledAt = claim.FiledAt,
                LastUpdatedAt = claim.UpdatedAt
            };

            return Ok(trackingStatus);
        }
    }
}