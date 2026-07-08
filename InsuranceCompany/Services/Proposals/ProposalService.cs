using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InsuranceCompany.DTOs.Proposals;
using InsuranceCompany.DTOs.PolicyManagement;
using InsuranceCompany.Repositories.Proposals;
using InsuranceCompany.Models.Proposals;
using InsuranceCompany.Repositories.PolicyManagement;
using InsuranceCompany.Services.Communications;
using log4net;

namespace InsuranceCompany.Services.Proposals
{
    public class ProposalService : IProposalService
    {
        private readonly IProposalRepository _proposalRepository;
        private readonly IPolicyRepository _policyRepository;
        private readonly IEmailService _emailService;

        private static readonly ILog _log = LogManager.GetLogger(typeof(ProposalService));

        public ProposalService(
            IProposalRepository proposalRepository, 
            IPolicyRepository policyRepository,
            IEmailService emailService)
        {
            _proposalRepository = proposalRepository;
            _policyRepository = policyRepository;
            _emailService = emailService;
        }

        private ProposalResponseDto MapToResponseDto(Proposal p, decimal? premiumOverride = null)
        {
            decimal basePremium = p.InsurancePolicy?.BasePremium ?? 0;
            decimal calculatedPremium = basePremium;
            if (p.VehicleAge > 5)
                calculatedPremium += basePremium * 0.10m;
            else if (p.VehicleAge > 2)
                calculatedPremium += basePremium * 0.05m;

            if (p.ProposalAddOns != null && p.ProposalAddOns.Any())
            {
                calculatedPremium += p.ProposalAddOns
                    .Where(pa => pa.AddOn != null)
                    .Sum(pa => pa.AddOn!.AdditionalCost);
            }

            decimal totalPremium = premiumOverride ?? (p.Quote?.TotalPremium > 0 ? p.Quote.TotalPremium : calculatedPremium);

            return new ProposalResponseDto
            {
                ProposalId = p.ProposalId,
                UserId = p.UserId,
                CustomerName = p.User?.FullName ?? string.Empty,
                PolicyId = p.PolicyId,
                PolicyName = p.InsurancePolicy?.PolicyName ?? string.Empty,
                PolicyType = p.InsurancePolicy?.PolicyType ?? string.Empty,
                VehicleNumber = p.VehicleNumber,
                VehicleMake = p.VehicleMake,
                VehicleModel = p.VehicleModel,
                VehicleYear = p.VehicleYear,
                VehicleAge = p.VehicleAge,
                Status = p.Status,
                OfficerRemarks = p.OfficerRemarks,
                AssignedOfficerId = p.AssignedOfficerId,
                SubmittedAt = p.SubmittedAt,
                TotalCalculatedPremium = totalPremium,
                FinalInsuredDeclaredValue = p.InsurancePolicy?.CoverageAmount ?? 0,
                AppliedAddOnName = p.ProposalAddOns?.Select(pa => pa.AddOn?.AddOnName ?? string.Empty).Where(name => !string.IsNullOrEmpty(name)).ToList() ?? new List<string>(),
                IssuedPolicyId = p.IssuedPolicy?.IssuedPolicyId,
                EngineNumber = p.EngineNumber ?? string.Empty,
                ChassisNumber = p.ChassisNumber ?? string.Empty,
                InsurancePolicy = p.InsurancePolicy != null ? new PolicyResponseDto
                {
                    PolicyId = p.InsurancePolicy.PolicyId,
                    PolicyName = p.InsurancePolicy.PolicyName,
                    Description = p.InsurancePolicy.Description ?? string.Empty,
                    BasePremium = p.InsurancePolicy.BasePremium,
                    CoverageAmount = p.InsurancePolicy.CoverageAmount,
                    PolicyDurationMonths = p.InsurancePolicy.PolicyDurationMonths,
                    PolicyType = p.InsurancePolicy.PolicyType,
                    CategoryId = p.InsurancePolicy.CategoryId,
                    IsActive = p.InsurancePolicy.IsActive,
                    CreatedAt = p.InsurancePolicy.CreatedAt
                } : null
            };
        }

        public async Task<ProposalResponseDto?> CreateProposalAsync(int userId, ProposalCreateDto dto)
        {
            try
            {
                _log.Info($"Attempting to create proposal for UserId: {userId}, PolicyId: {dto.PolicyId}");

                var policy = await _policyRepository.GetPolicyByIdAsync(dto.PolicyId);
                if (policy == null)
                {
                    _log.Warn($"Policy with ID {dto.PolicyId} not found.");
                    throw new KeyNotFoundException("the Insurance doesn't exist");
                }

                if (!string.IsNullOrEmpty(dto.VehicleNumber))
                {
                    bool hasActiveCoverage = await _proposalRepository.HasActiveProposalOrPolicyForVehicleAsync(dto.VehicleNumber);
                    if (hasActiveCoverage)
                    {
                        _log.Warn($"Proposal creation blocked: Vehicle {dto.VehicleNumber} already has an active policy or pending proposal.");
                        throw new InvalidOperationException($"Vehicle {dto.VehicleNumber} already has an active policy or pending proposal.");
                    }
                }

                int CurrentYear = DateTime.Now.Year;
                int CalculatedVehicleAge = CurrentYear - dto.VehicleYear;
                if (CalculatedVehicleAge < 0)
                    CalculatedVehicleAge = 0;

                decimal finalPremium = policy.BasePremium;
                if (CalculatedVehicleAge > 5)
                {
                    finalPremium += policy.BasePremium * 0.10m;
                }
                else if (CalculatedVehicleAge > 2)
                {
                    finalPremium += policy.BasePremium * 0.05m;
                }

                var ProposalEntity = new Proposal
                {
                    UserId = userId,
                    PolicyId = dto.PolicyId,
                    VehicleNumber = dto.VehicleNumber,
                    VehicleMake = dto.VehicleMake,
                    VehicleModel = dto.VehicleModel,
                    VehicleYear = dto.VehicleYear,
                    VehicleAge = CalculatedVehicleAge,
                    EngineNumber = dto.EngineNumber,
                    ChassisNumber = dto.ChassisNumber,
                    Status = "Pending",
                    SubmittedAt = DateTime.Now,
                };

                if (dto.SelectedAddOnIds != null && dto.SelectedAddOnIds.Any())
                {
                    var policyAddOnIds = policy.PolicyAddOns.Select(pa => pa.AddOnId).ToHashSet();
                    foreach (var addOnId in dto.SelectedAddOnIds)
                    {
                        if (!policyAddOnIds.Contains(addOnId))
                        {
                            _log.Warn($"Selected Add-On ID {addOnId} is not associated with Policy ID {dto.PolicyId}.");
                            throw new ArgumentException($"Add-On with ID {addOnId} is not associated with this policy.");
                        }
                    }

                    ProposalEntity.ProposalAddOns = dto.SelectedAddOnIds.Select(id => new ProposalAddOn
                    {
                        AddOnId = id
                    }).ToList();

                    decimal addOnTotalCost = policy.PolicyAddOns
                        .Where(pa => dto.SelectedAddOnIds.Contains(pa.AddOnId) && pa.AddOn != null)
                        .Sum(pa => pa.AddOn!.AdditionalCost);

                    finalPremium += addOnTotalCost;
                }

                var ageProperty = typeof(Proposal).GetProperty("VehicleAge");
                if (ageProperty != null)
                {
                    ageProperty.SetValue(ProposalEntity, CalculatedVehicleAge);
                }

                var createdProposal = await _proposalRepository.AddProposalAsync(ProposalEntity);

                _log.Info($"Successfully created proposal with ID: {createdProposal.ProposalId} for UserId: {userId}");

                var savedProposal = await _proposalRepository.GetProposalByIdAsync(createdProposal.ProposalId);
                if (savedProposal == null)
                {
                    throw new Exception("Error retrieving the created proposal.");
                }

                if (savedProposal.User != null && !string.IsNullOrEmpty(savedProposal.User.Email))
                {
                    try
                    {
                        string subject = $"AutoShield Protection - Proposal #{savedProposal.ProposalId} Submitted";
                        string htmlBody = $@"
                            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                                <h2 style='color: #009087;'>Proposal Submission Received</h2>
                                <p>Hello <strong>{savedProposal.User.FullName}</strong>,</p>
                                <p>Thank you for choosing AutoShield Protection. We have received your application for the <strong>{savedProposal.InsurancePolicy?.PolicyName ?? "Insurance Policy"}</strong>.</p>
                                <p><strong>Proposal Summary:</strong></p>
                                <ul>
                                    <li><strong>Proposal Reference ID:</strong> #{savedProposal.ProposalId}</li>
                                    <li><strong>Vehicle Make/Model:</strong> {savedProposal.VehicleMake} {savedProposal.VehicleModel}</li>
                                    <li><strong>Registration Number:</strong> {savedProposal.VehicleNumber}</li>
                                </ul>
                                <p>Our underwriting officers are currently reviewing your request. You can track the evaluation status from your personal dashboard at any time.</p>
                                <hr style='border: none; border-top: 1px solid #eee;' />
                                <p style='font-size: 11px; color: #999;'>This is an automated notification. Please do not reply directly.</p>
                            </div>";

                        await _emailService.SendEmailAsync(savedProposal.User.Email, subject, htmlBody, "ProposalSubmitted", savedProposal.UserId);
                    }
                    catch (Exception mailEx)
                    {
                        _log.Error("Failed to send proposal submission email", mailEx);
                    }
                }

                return MapToResponseDto(savedProposal, finalPremium);
            }
            catch (KeyNotFoundException ex)
            {
                _log.Warn($"fill all fields: {ex.Message}");
                throw;
            }
            catch (Exception ex)
            {
                _log.Error($"Unexpected internal error: {ex.Message} ");
                throw;
            }
        }

        public async Task<IEnumerable<ProposalResponseDto>> GetCustomerProposalsHistoryAsync(int userId)
        {
            try
            {
                _log.Info($"Fetching proposal history for UserId: {userId}");

                var history = await _proposalRepository.GetProposalsByUserIdAsync(userId);

                return history.Select(p => MapToResponseDto(p)).ToList();
            }
            catch (Exception ex)
            {
                _log.Error($"Error occurred fetching history for UserId: {userId}", ex);
                throw;
            }
        }

        public async Task<ProposalResponseDto?> GetProposalByIdAsync(int id)
        {
            try
            {
                _log.Info($"Fetching details for Proposal ID: {id}");

                var p = await _proposalRepository.GetProposalByIdAsync(id);
                if (p == null)
                {
                    _log.Warn($"Proposal with ID {id} was not found.");
                    return null;
                }

                return MapToResponseDto(p);
            }
            catch (Exception ex)
            {
                _log.Error($"Error occurred while getting Proposal ID: {id}", ex);
                throw;
            }
        }

        public async Task<bool> ReviewProposalAsync(int proposalId, int officerId, ProposalReviewDto dto)
        {
            try
            {
                _log.Info($"Officer {officerId} is reviewing Proposal ID: {proposalId} with status: {dto.Status}");

                var proposal = await _proposalRepository.GetProposalByIdAsync(proposalId);
                if (proposal == null)
                {
                    _log.Warn($"Proposal ID {proposalId} does not exist.");
                    return false;
                }

                if (dto.Status != "Approved" && dto.Status != "Rejected")
                {
                    _log.Warn($"Invalid review status submitted: '{dto.Status}' for Proposal ID {proposalId}");
                    throw new ArgumentException("Invalid status. Status must be either 'Approved' or 'Rejected'.");
                }

                proposal.Status = dto.Status;
                proposal.OfficerRemarks = dto.OfficerRemarks;
                proposal.AssignedOfficerId = officerId;
                proposal.UpdatedAt = DateTime.Now;

                await _proposalRepository.UpdateProposalAsync(proposal);

                if (proposal.User != null && !string.IsNullOrEmpty(proposal.User.Email))
                {
                    try
                    {
                        string subject = $"AutoShield Protection - Proposal #{proposal.ProposalId} Underwriting Decision";
                        string statusText = dto.Status == "Approved" ? "APPROVED" : "REJECTED";
                        string statusColor = dto.Status == "Approved" ? "#009087" : "#e03e3e";
                        
                        string htmlBody = $@"
                            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                                <h2 style='color: {statusColor};'>Underwriting Decision: {statusText}</h2>
                                <p>Hello <strong>{proposal.User.FullName}</strong>,</p>
                                <p>An underwriting officer has completed the review of your proposal application for the <strong>{proposal.InsurancePolicy?.PolicyName ?? "Insurance Policy"}</strong>.</p>
                                <p><strong>Decision Details:</strong></p>
                                <ul>
                                    <li><strong>Proposal Reference ID:</strong> #{proposal.ProposalId}</li>
                                    <li><strong>Status:</strong> <span style='color: {statusColor}; font-weight: bold;'>{dto.Status}</span></li>
                                    <li><strong>Officer Remarks:</strong> {proposal.OfficerRemarks ?? "No remarks provided."}</li>
                                </ul>
                                {(dto.Status == "Approved" ? "<p>Since your proposal has been approved, you can proceed to issue the policy and set up your coverage parameters directly from your dashboard.</p>" : "<p>If you have any questions regarding this decision, please reach out to our support helpdesk.</p>")}
                                <hr style='border: none; border-top: 1px solid #eee;' />
                                <p style='font-size: 11px; color: #999;'>This is an automated notification. Please do not reply directly.</p>
                            </div>";

                        await _emailService.SendEmailAsync(proposal.User.Email, subject, htmlBody, $"Proposal{dto.Status}", proposal.UserId);
                    }
                    catch (Exception mailEx)
                    {
                        _log.Error("Failed to send proposal review email", mailEx);
                    }
                }

                _log.Info($"Successfully updated review status for Proposal ID: {proposalId}");
                return true;
            }
            catch (ArgumentException ex)
            {
                _log.Warn($"Verification failed: {ex.Message}");
                throw;
            }
            catch (Exception ex)
            {
                _log.Error("Internal Error occurred", ex);
                throw;
            }
        }

        public async Task<IEnumerable<ProposalResponseDto>> GetPendingProposalsAsync()
        {
            try
            {
                _log.Info("Fetching all pending and submitted proposals.");

                var proposals = await _proposalRepository.GetAllProposalsAsync();

                return proposals
                    .Where(p => p.Status == "Submitted" || p.Status == "Pending" || p.Status == "PolicyIssued")
                    .Select(p => MapToResponseDto(p)).ToList();
            }
            catch (Exception ex)
            {
                _log.Error("Internal Error occurred", ex);
                throw;
            }
        }

        public async Task<IEnumerable<ProposalResponseDto>> GetAllProposalsHistoryAsync()
        {
            try
            {
                _log.Info("Fetching all proposals history for admin/officer.");
                var proposals = await _proposalRepository.GetAllProposalsAsync();
                return proposals.Select(p => MapToResponseDto(p)).ToList();
            }
            catch (Exception ex)
            {
                _log.Error("Error fetching all proposals", ex);
                throw;
            }
        }
    }
}