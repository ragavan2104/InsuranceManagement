using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InsuranceCompany.DTOs.Proposals;
using InsuranceCompany.Repositories.Proposals;
using InsuranceCompany.Models.Proposals;
using InsuranceCompany.Repositories.PolicyManagement;
using log4net;

namespace InsuranceCompany.Services.Proposals
{
    public class ProposalService : IProposalService
    {
        private readonly IProposalRepository _proposalRepository;
        private readonly IPolicyRepository _policyRepository;

        private static readonly ILog _log = LogManager.GetLogger(typeof(ProposalService));

        public ProposalService(IProposalRepository proposalRepository, IPolicyRepository policyRepository)
        {
            _proposalRepository = proposalRepository;
            _policyRepository = policyRepository;
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
                    Status = "Pending",
                    SubmittedAt = DateTime.Now,
                };

                var ageProperty = typeof(Proposal).GetProperty("VehicleAge");
                if (ageProperty != null)
                {
                    ageProperty.SetValue(ProposalEntity, CalculatedVehicleAge);
                }

                var createdProposal = await _proposalRepository.AddProposalAsync(ProposalEntity);

                _log.Info($"Successfully created proposal with ID: {createdProposal.ProposalId} for UserId: {userId}");

                return new ProposalResponseDto
                {
                    ProposalId = createdProposal.ProposalId,
                    UserId = createdProposal.UserId,
                    PolicyId = createdProposal.PolicyId,
                    PolicyName = policy.PolicyName,
                    PolicyType = policy.PolicyType,
                    VehicleNumber = createdProposal.VehicleNumber,
                    VehicleMake = createdProposal.VehicleMake,
                    VehicleModel = createdProposal.VehicleModel,
                    VehicleYear = createdProposal.VehicleYear,
                    VehicleAge = CalculatedVehicleAge,
                    Status = createdProposal.Status,
                    SubmittedAt = createdProposal.SubmittedAt,
                    TotalCalculatedPremium = finalPremium,
                    FinalInsuredDeclaredValue = policy.CoverageAmount
                };
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

                return history.Select(p =>
                {
                    decimal basePremium = p.InsurancePolicy?.BasePremium ?? 0;
                    decimal calculatedPremium = basePremium;
                    if (p.VehicleAge > 5)
                        calculatedPremium += basePremium * 0.10m;
                    else if (p.VehicleAge > 2)
                        calculatedPremium += basePremium * 0.05m;

                    return new ProposalResponseDto
                    {
                        ProposalId = p.ProposalId,
                        UserId = p.UserId,
                        PolicyId = p.PolicyId,
                        PolicyName = p.InsurancePolicy?.PolicyName ?? string.Empty,
                        PolicyType = p.InsurancePolicy?.PolicyType ?? string.Empty,
                        VehicleNumber = p.VehicleNumber,
                        VehicleMake = p.VehicleMake,
                        VehicleModel = p.VehicleModel,
                        VehicleYear = p.VehicleYear,
                        VehicleAge = p.VehicleAge,
                        Status = p.Status,
                        SubmittedAt = p.SubmittedAt,
                        TotalCalculatedPremium = p.Quote?.TotalPremium > 0 ? p.Quote.TotalPremium : calculatedPremium
                    };
                }).ToList();
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

                decimal basePremium = p.InsurancePolicy?.BasePremium ?? 0;
                decimal calculatedPremium = basePremium;
                if (p.VehicleAge > 5)
                    calculatedPremium += basePremium * 0.10m;
                else if (p.VehicleAge > 2)
                    calculatedPremium += basePremium * 0.05m;

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
                    TotalCalculatedPremium = p.Quote?.TotalPremium > 0 ? p.Quote.TotalPremium : calculatedPremium,
                    FinalInsuredDeclaredValue = p.InsurancePolicy?.CoverageAmount ?? 0
                };
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
                    .Select(p =>
                    {
                        decimal basePremium = p.InsurancePolicy?.BasePremium ?? 0;
                        decimal calculatedPremium = basePremium;
                        if (p.VehicleAge > 5)
                            calculatedPremium += basePremium * 0.10m;
                        else if (p.VehicleAge > 2)
                            calculatedPremium += basePremium * 0.05m;

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
                            SubmittedAt = p.SubmittedAt,
                            TotalCalculatedPremium = p.Quote?.TotalPremium > 0 ? p.Quote.TotalPremium : calculatedPremium
                        };
                    }).ToList();
            }
            catch (Exception ex)
            {
                _log.Error("Internal Error occurred", ex);
                throw;
            }
        }
    }
}