using InsuranceCompany.DTOs.PolicyManagement;

namespace InsuranceCompany.Services.PolicyManagement
{
    public interface IAddOnService
    {
        Task<IEnumerable<AddOnResponseDto>> GetAllActiveAddOnsAsync();
        Task<AddOnResponseDto?> GetAddOnByIdAsync(int id);
        Task<AddOnResponseDto> CreateAddOnAsync(AddOnCreateDto dto);
        Task<bool> UpdateAddOnAsync(int id, AddOnUpdateDto dto);
    }
}
