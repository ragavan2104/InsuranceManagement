using InsuranceCompany.Models.PolicyManagement;

namespace InsuranceCompany.Repositories.PolicyManagement
{
    public interface IAddOnRepository
    {
        Task<IEnumerable<AddOn>> GetAllAddOnsAsync();
        Task<AddOn?> GetAddOnByIdAsync(int id);
        Task<AddOn> AddAddOnAsync(AddOn addOn);
        Task UpdateAddOnAsync(AddOn addOn);
    }
}
