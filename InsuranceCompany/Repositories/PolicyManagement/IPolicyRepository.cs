using InsuranceCompany.DTOs.PolicyManagement;
using InsuranceCompany.Models.PolicyManagement;

namespace InsuranceCompany.Repositories.PolicyManagement
{
    public interface IPolicyRepository
    {
        Task<IEnumerable<InsurancePolicy>> GetAllPoliciesAsync();
        Task<InsurancePolicy?> GetPolicyByIdAsync(int Id);
        Task<InsurancePolicy> AddPolicyAsync(InsurancePolicy policy);
        Task UpdatePolicyAsync(InsurancePolicy policy);
    }
}