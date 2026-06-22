using InsuranceCompany.DTOs.PolicyManagement;

namespace InsuranceCompany.Services.PolicyManagement
{
    public interface IPolicyService
    {
        Task <IEnumerable<PolicyResponseDto>> GetAllActivePoliciesAsync();
        Task<PolicyResponseDto?> GetPolicyByIdAsync(int id);
        Task<PolicyResponseDto> CreatePolicyAsync(int adminId, PolicyCreateDto dto);
        Task<bool> UpdatePolicyAsync(int id, PolicyUpdateDto dto);
    }
}
