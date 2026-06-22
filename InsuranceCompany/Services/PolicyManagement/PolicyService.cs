using InsuranceCompany.Models.PolicyManagement;
using InsuranceCompany.Repositories.PolicyManagement;
using InsuranceCompany.DTOs.PolicyManagement;
using log4net; 

namespace InsuranceCompany.Services.PolicyManagement
{
    public class PolicyService : IPolicyService
    {
        private readonly IPolicyRepository _policyRepository;
        private static readonly ILog _log = LogManager.GetLogger(typeof(PolicyService));

        public PolicyService(IPolicyRepository policyRepository)
        {
            _policyRepository = policyRepository;
        }

        public async Task<IEnumerable<PolicyResponseDto>> GetAllActivePoliciesAsync()
        {
            try
            {
                _log.Info("Fetching all active insurance policies.");

                var policy = await _policyRepository.GetAllPoliciesAsync();
                return policy.Where(p => p.IsActive == true).Select(p => new PolicyResponseDto
                {
                    PolicyId = p.PolicyId,
                    PolicyName = p.PolicyName,
                    Description = p.Description,
                    BasePremium = p.BasePremium,
                    CoverageAmount = p.CoverageAmount,
                    PolicyDurationMonths = p.PolicyDurationMonths,
                    PolicyType = p.PolicyType,
                    CategoryId = p.CategoryId,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _log.Error("Internal error occurred.", ex);
                throw;
            }
        }

        public async Task<PolicyResponseDto?> GetPolicyByIdAsync(int policyId)
        {
            try
            {
                _log.Info($"Fetching details for Policy ID: {policyId}");

                var policy = await _policyRepository.GetPolicyByIdAsync(policyId);
                if (policy == null)
                {
                    _log.Warn($"Policy with ID {policyId}  not found.");
                    return null;
                }

                return new PolicyResponseDto
                {
                    PolicyId = policy.PolicyId,
                    PolicyName = policy.PolicyName,
                    Description = policy.Description,
                    BasePremium = policy.BasePremium,
                    CoverageAmount = policy.CoverageAmount,
                    PolicyDurationMonths = policy.PolicyDurationMonths,
                    PolicyType = policy.PolicyType,
                    CategoryId = policy.CategoryId,
                    IsActive = policy.IsActive,
                    CreatedAt = policy.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _log.Error($"Error occurred while getting Policy ID: {policyId}", ex);
                throw;
            }
        }

        public async Task<PolicyResponseDto> CreatePolicyAsync(int adminId, PolicyCreateDto dto)
        {
            try
            {
                _log.Info($"Attempting to create a new policy: {dto.PolicyName}");

                var policyEntity = new InsurancePolicy
                {
                    PolicyName = dto.PolicyName,
                    Description = dto.Description,
                    BasePremium = dto.BasePremium,
                    CoverageAmount = dto.CoverageAmount,
                    PolicyDurationMonths = dto.PolicyDurationMonths,
                    PolicyType = dto.PolicyType,
                    CategoryId = dto.CategoryId,

                    
                    CreatedBy = adminId, 

                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                var createdPolicy = await _policyRepository.AddPolicyAsync(policyEntity);

                _log.Info($"Successfully created policy '{createdPolicy.PolicyName}' with ID: {createdPolicy.PolicyId}");

                return new PolicyResponseDto
                {
                    PolicyId = createdPolicy.PolicyId,
                    PolicyName = createdPolicy.PolicyName,
                    Description = createdPolicy.Description,
                    BasePremium = createdPolicy.BasePremium,
                    CoverageAmount = createdPolicy.CoverageAmount,
                    PolicyDurationMonths = createdPolicy.PolicyDurationMonths,
                    PolicyType = createdPolicy.PolicyType,
                    CategoryId = createdPolicy.CategoryId,
                    IsActive = createdPolicy.IsActive,
                    CreatedAt = createdPolicy.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _log.Error("Internal error occured.", ex);
                throw;
            }
        }

        public async Task<bool> UpdatePolicyAsync(int id, PolicyUpdateDto dto)
        {
            try
            {
                _log.Info($"Attempting to update Policy ID: {id}");

                var existingPolicy = await _policyRepository.GetPolicyByIdAsync(id);
                if (existingPolicy == null)
                {
                    _log.Warn($"Update failed because Policy ID {id} does not exist.");
                    return false;
                }

       
                existingPolicy.PolicyName = dto.PolicyName;
                existingPolicy.Description = dto.Description;
                existingPolicy.BasePremium = dto.BasePremium;
                existingPolicy.CoverageAmount = dto.CoverageAmount;
                existingPolicy.PolicyDurationMonths = dto.PolicyDurationMonths;
                existingPolicy.PolicyType = dto.PolicyType;
                existingPolicy.IsActive = dto.IsActive;
                existingPolicy.CategoryId = dto.CategoryId;

                await _policyRepository.UpdatePolicyAsync(existingPolicy);

                _log.Info($"Successfully updated records for Policy ID: {id}");
                return true;
            }
            catch (Exception ex)
            {
                _log.Error($"Error updating details for Policy ID: {id}", ex);
                throw;
            }
        }
    }
}