using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InsuranceCompany.Dtos.Claims;
using InsuranceCompany.Models.Operations;
using InsuranceCompany.Repositories.Claims;
using InsuranceCompany.Services.Communications;
using log4net;

namespace InsuranceCompany.Services.Claims
{
    public class ClaimService : IClaimService
    {
        private readonly IClaimRepository _claimRepository;
        private readonly IEmailService _emailService;
        private static readonly ILog _log = LogManager.GetLogger(typeof(ClaimService));

        public ClaimService(IClaimRepository claimRepository, IEmailService emailService)
        {
            _claimRepository = claimRepository;
            _emailService = emailService;
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

                bool isOwner = (policy.UserId.HasValue && policy.UserId.Value == userId) || 
                               (policy.Proposal != null && policy.Proposal.UserId == userId);

                if (!isOwner)
                {
                    _log.Warn($"Claim filing blocked: User {userId} does not own Policy ID {dto.IssuedPolicyId}.");
                    throw new UnauthorizedAccessException("You do not have permission to file a claim for this policy.");
                }

                if (policy.Proposal != null && !string.IsNullOrEmpty(policy.Proposal.VehicleNumber))
                {
                    bool hasActiveClaim = await _claimRepository.HasIncompleteClaimForVehicleAsync(policy.Proposal.VehicleNumber);
                    if (hasActiveClaim)
                    {
                        _log.Warn($"Claim filing blocked: Vehicle {policy.Proposal.VehicleNumber} already has an active, incomplete claim.");
                        throw new InvalidOperationException($"Cannot file a new claim for vehicle {policy.Proposal.VehicleNumber} because there is already an active, unresolved claim in progress.");
                    }
                }

                decimal maxCoverage = policy.InsurancePolicy?.CoverageAmount ?? 0;
                if (dto.EstimatedLossAmount > maxCoverage)
                {
                    _log.Warn($"Claim filing blocked: Estimated loss amount {dto.EstimatedLossAmount} exceeds maximum coverage {maxCoverage}.");
                    throw new ArgumentException($"Estimated loss amount cannot exceed the maximum policy coverage of ₹{maxCoverage}.");
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

                if (policy.User != null && !string.IsNullOrEmpty(policy.User.Email))
                {
                    try
                    {
                        string subject = $"AutoShield Protection - Claim #{result.ClaimId} Filed Successfully";
                        string htmlBody = $@"
                            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                                <h2 style='color: #009087;'>Insurance Claim Filed</h2>
                                <p>Hello <strong>{policy.User.FullName}</strong>,</p>
                                <p>This notification confirms that your claim has been successfully filed for Policy Number <strong>{policy.PolicyNumber}</strong>.</p>
                                <p><strong>Claim Details:</strong></p>
                                <ul>
                                    <li><strong>Claim Reference ID:</strong> #{result.ClaimId}</li>
                                    <li><strong>Incident Description:</strong> {result.IncidentDescription}</li>
                                    <li><strong>Estimated Loss Amount:</strong> ₹{result.EstimatedLossAmount}</li>
                                    <li><strong>Date of Incident:</strong> {result.IncidentDate:yyyy-MM-dd}</li>
                                    <li><strong>Status:</strong> Filed (Under Evaluation)</li>
                                </ul>
                                <p>An insurance claims officer will review the incident report and details shortly. You can monitor progress and status updates directly from your dashboard.</p>
                                <hr style='border: none; border-top: 1px solid #eee;' />
                                <p style='font-size: 11px; color: #999;'>This is an automated notification. Please do not reply directly.</p>
                            </div>";

                        await _emailService.SendEmailAsync(policy.User.Email, subject, htmlBody, "ClaimFiled", policy.User.UserId);
                    }
                    catch (Exception mailEx)
                    {
                        _log.Error("Failed to send claim filing email notification", mailEx);
                    }
                }

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

                if (claim.IssuedPolicy != null && claim.IssuedPolicy.User != null && !string.IsNullOrEmpty(claim.IssuedPolicy.User.Email))
                {
                    try
                    {
                        string subject = $"AutoShield Protection - Claim #{claim.ClaimId} Evaluation Decision";
                        string statusText = dto.Status == "Approved" ? "APPROVED" : "REJECTED";
                        string statusColor = dto.Status == "Approved" ? "#009087" : "#e03e3e";

                        string htmlBody = $@"
                            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                                <h2 style='color: {statusColor};'>Claim Evaluation: {statusText}</h2>
                                <p>Hello <strong>{claim.IssuedPolicy.User.FullName}</strong>,</p>
                                <p>An insurance claims officer has reviewed and finalized the decision for your claim filed against Policy Number <strong>{claim.IssuedPolicy.PolicyNumber}</strong>.</p>
                                <p><strong>Decision Details:</strong></p>
                                <ul>
                                    <li><strong>Claim Reference ID:</strong> #{claim.ClaimId}</li>
                                    <li><strong>Status:</strong> <span style='color: {statusColor}; font-weight: bold;'>{dto.Status}</span></li>
                                    {(dto.Status == "Approved" ? $"<li><strong>Approved Settlement Amount:</strong> ₹{claim.ApprovedSettlementAmount}</li>" : "")}
                                    <li><strong>Officer Remarks:</strong> {claim.OfficerRemarks ?? "No remarks provided."}</li>
                                </ul>
                                {(dto.Status == "Approved" ? "<p>The approved settlement amount is scheduled to be disbursed to your registered bank details shortly.</p>" : "<p>If you have any questions regarding the rejection of this claim, you may contact our claims helpdesk.</p>")}
                                <hr style='border: none; border-top: 1px solid #eee;' />
                                <p style='font-size: 11px; color: #999;'>This is an automated notification. Please do not reply directly.</p>
                            </div>";

                        await _emailService.SendEmailAsync(claim.IssuedPolicy.User.Email, subject, htmlBody, $"Claim{dto.Status}", claim.IssuedPolicy.User.UserId);
                    }
                    catch (Exception mailEx)
                    {
                        _log.Error("Failed to send claim review email notification", mailEx);
                    }
                }

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

        public async Task<IEnumerable<Claim>> GetAllClaimsHistoryAsync()
        {
            try
            {
                _log.Info("Fetching all claims for history review.");
                var claims = await _claimRepository.GetAllClaimsAsync();
                return claims;
            }
            catch (Exception ex)
            {
                _log.Error("Error fetching all claims history.", ex);
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