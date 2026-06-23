using InsuranceCompany.DTOs.Proposals;
using InsuranceCompany.Services.Proposals;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using log4net;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace InsuranceCompany.Controllers.Proposals
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProposalController : ControllerBase
    {
        private readonly IProposalService _proposalService;
        private static readonly ILog _log = LogManager.GetLogger(typeof(ProposalController));

        public ProposalController(IProposalService proposalService)
        {
            _proposalService = proposalService;
        }

        [HttpPost("Submit")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> AddProposal([FromBody] ProposalCreateDto dto)
        {
            if (dto == null)
            {
                _log.Warn("Failed to create proposal: Request body is null.");
                return BadRequest("Proposal data is required.");
            }

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    _log.Warn("Failed to create proposal: User ID claim not found in token.");
                    return Unauthorized("User ID not found in token.");
                }

                int userId = int.Parse(userIdClaim);
                _log.Info($"Creating proposal for User ID: {userId}");

                var result = await _proposalService.CreateProposalAsync(userId, dto);

                _log.Info($"Proposal created successfully with ID: {result.ProposalId}");
                return CreatedAtAction(nameof(GetById), new { id = result.ProposalId }, result);
            }
            catch (KeyNotFoundException ex)
            {
                _log.Warn($"Policy not found while creating proposal: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _log.Error("Error occurred while creating proposal.", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            _log.Info($"Fetching proposal with ID: {id}");

            try
            {
                var proposal = await _proposalService.GetProposalByIdAsync(id);
                if (proposal == null)
                {
                    _log.Warn($"Proposal with ID: {id} was not found.");
                    return NotFound($"Proposal with ID {id} not found.");
                }

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

                if (userIdClaim != null && userRoleClaim == "User" && proposal.UserId != int.Parse(userIdClaim))
                {
                    _log.Warn($"Access denied: User {userIdClaim} tried to view Proposal {id} owned by User {proposal.UserId}");
                    return StatusCode(StatusCodes.Status403Forbidden, "You do not have permission to view this proposal.");
                }

                return Ok(proposal);
            }
            catch (Exception ex)
            {
                _log.Error($"Error occurred while fetching proposal ID: {id}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpGet("UserProposals")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetMyProposalHistory()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    _log.Warn("Failed to fetch history: User ID claim not found in token.");
                    return Unauthorized("User ID not found .");
                }

                int userId = int.Parse(userIdClaim);
                _log.Info($"Fetching proposal history for User ID: {userId}");

                var proposals = await _proposalService.GetCustomerProposalsHistoryAsync(userId);

                return Ok(proposals);
            }
            catch (Exception ex)
            {
                _log.Error("Error occurred while fetching proposal history.", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpPut("{id}/review")]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<IActionResult> ReviewProposal(int id, [FromBody] ProposalReviewDto dto)
        {
            if (dto == null)
            {
                _log.Warn("Failed to review proposal: Request body is null.");
                return BadRequest("Review data is required.");
            }

            try
            {
                var officerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(officerIdClaim))
                {
                    _log.Warn("Failed to review proposal: Officer ID claim not found in token.");
                    return Unauthorized("Officer ID not found in token.");
                }
                int officerId = int.Parse(officerIdClaim);

                _log.Info($"Officer {officerId} is reviewing proposal ID: {id}");

                var isReviewed = await _proposalService.ReviewProposalAsync(id, officerId, dto);
                if (!isReviewed)
                {
                    _log.Warn($"Review failed: Proposal ID {id} not found.");
                    return NotFound($"Proposal with ID {id} not found.");
                }

                _log.Info($"Proposal ID {id} successfully marked as {dto.Status}.");
                return Ok(new { Message = $"Proposal has been successfully marked as {dto.Status}." });
            }
            catch (InvalidOperationException ex)
            {
                _log.Warn($"Invalid operation during review for proposal ID {id}: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _log.Error($"Error occurred while reviewing proposal ID: {id}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpGet("Pending")]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<IActionResult> GetPendingProposals()
        {
            try
            {
                _log.Info("Fetching all pending proposals.");
                var proposals = await _proposalService.GetPendingProposalsAsync();
                return Ok(proposals);
            }
            catch (Exception ex)
            {
                _log.Error("Error occurred while fetching pending proposals.", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }
    }
}