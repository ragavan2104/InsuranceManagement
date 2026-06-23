using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InsuranceCompany.Dtos.Claims;
using InsuranceCompany.Models.Operations;
using InsuranceCompany.Repositories.Claims;
using log4net;

namespace InsuranceCompany.Services.Claims
{
    public class ClaimService : IClaimService
    {
        private readonly IClaimRepository _claimRepository;
        private static readonly ILog _log = LogManager.GetLogger(typeof(ClaimService));

        public ClaimService(IClaimRepository claimRepository)
        {
            _claimRepository = claimRepository;
        }

        public async Task<Claim> FileClaimAsync(int userId, ClaimFileDto dto)
        {
            try
            {
                _log.Info($"User {userId} is filing a new claim for IssuedPolicyId: {dto.IssuedPolicyId}");

                var policy = await _claimRepository.GetIssuedPolicyByIdAsync(dto.IssuedPolicyId);
                if (policy == null)
                {
                    _log.Warn($"Claim filing blocked: Issued policy with ID {dto.IssuedPolicyId} not found.");
                    throw new KeyNotFoundException("Issued policy not found.");
                }

                if (policy.Proposal == null || policy.Proposal.UserId != userId)
                {
                    _log.Warn($"Claim filing blocked: User {userId} does not own Policy ID {dto.IssuedPolicyId}.");
                    throw new UnauthorizedAccessException("You do not have permission to file a claim for this policy.");
                }

                var claimEntity = new Claim
                {
                    IssuedPolicyId = dto.IssuedPolicyId,
                    EstimatedLossAmount = dto.EstimatedLossAmount,
                    IncidentDescription = dto.IncidentDescription,
                    IncidentDate = dto.IncidentDate,
                    Status = "ClaimFiled",
                    FiledAt = DateTime.UtcNow
                };

                var result = await _claimRepository.AddClaimAsync(claimEntity);

                _log.Info($"Claim successfully filed with ID: {result.ClaimId} for User: {userId}");

                return result;
            }
            catch (Exception ex)
            {
                _log.Error($"Error occurred while filing claim for User {userId}", ex);
                throw;
            }
        }

        public async Task<bool> ReviewClaimAsync(int claimId, int officerId, ClaimReviewDto dto)
        {
            try
            {
                _log.Info($"Officer {officerId} is reviewing Claim ID: {claimId} with status: {dto.Status}");

                var claim = await _claimRepository.GetClaimByIdAsync(claimId);
                if (claim == null)
                {
                    _log.Warn($"Claim ID {claimId} not found.");
                    return false;
                }

                if (claim.Status == "Approved" || claim.Status == "Rejected")
                {
                    _log.Warn($"Claim ID {claimId} is already finalized with status: {claim.Status}");
                    throw new InvalidOperationException("This claim has already been finalized.");
                }

                claim.Status = dto.Status;
                claim.ApprovedSettlementAmount = dto.Status == "Approved" ? dto.ApprovedSettlementAmount : 0;
                claim.OfficerRemarks = dto.OfficerRemarks;
                claim.ReviewedByOfficerId = officerId;
                claim.UpdatedAt = DateTime.UtcNow;

                await _claimRepository.UpdateClaimAsync(claim);

                _log.Info($"Claim ID {claimId} successfully reviewed and marked as: {dto.Status}");

                return true;
            }
            catch (InvalidOperationException ex)
            {
                _log.Warn($"Claim {claimId} review blocked: {ex.Message}");
                throw;
            }
            catch (Exception ex)
            {
                _log.Error($"Error occurred while reviewing Claim ID: {claimId}", ex);
                throw;
            }
        }

        public async Task<IEnumerable<Claim>> GetCustomerClaimsHistoryAsync(int userId)
        {
            try
            {
                _log.Info($"Fetching claims history for User ID: {userId}");

                var claims = await _claimRepository.GetClaimsByUserIdAsync(userId);

                _log.Info($"Successfully fetched claims for User ID: {userId}");

                return claims;
            }
            catch (Exception ex)
            {
                _log.Error($"Error fetching claims history for User ID: {userId}", ex);
                throw;
            }
        }

        public async Task<IEnumerable<Claim>> GetPendingClaimsQueueAsync()
        {
            try
            {
                _log.Info("Fetching all pending claims.");

                var claims = await _claimRepository.GetAllPendingClaimsAsync();

                _log.Info("Successfully fetched all pending claims.");

                return claims;
            }
            catch (Exception ex)
            {
                _log.Error("Error fetching pending claims.", ex);
                throw;
            }
        }

        public async Task<Claim?> TrackClaimStatusAsync(int claimId, int userId, bool bypassOwnershipCheck)
        {
            try
            {
                _log.Info($"Processing status tracking context for Claim ID: {claimId}. Bypass Flag: {bypassOwnershipCheck}");

                var claim = await _claimRepository.GetClaimByIdAsync(claimId);
                if (claim == null) return null;

                // ✅ If Admin or Officer, return data immediately and skip customer checks
                if (bypassOwnershipCheck)
                {
                    _log.Info($"Ownership check bypassed for backoffice role on Claim ID: {claimId}");
                    return claim;
                }

                
                var userClaims = await _claimRepository.GetClaimsByUserIdAsync(userId);
                if (!userClaims.Any(c => c.ClaimId == claimId))
                {
                    _log.Warn($"User {userId} attempted unauthorized status tracking access on Claim {claimId}");
                    throw new UnauthorizedAccessException("Not your claim!");
                }

                return claim;
            }
            catch (Exception ex)
            {
                _log.Error($"Error occurred within tracking manager for Claim ID: {claimId}", ex);
                throw;
            }
        }
    }
}