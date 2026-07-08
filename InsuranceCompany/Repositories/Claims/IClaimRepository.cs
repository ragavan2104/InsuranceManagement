using System.Collections.Generic;
using System.Threading.Tasks;
using InsuranceCompany.Models.Operations;

namespace InsuranceCompany.Repositories.Claims
{
    public interface IClaimRepository
    {
        Task<Claim> AddClaimAsync(Claim claim);
        Task<Claim?> GetClaimByIdAsync(int claimId);
        Task<IEnumerable<Claim>> GetClaimsByUserIdAsync(int userId);
        Task<IEnumerable<Claim>> GetAllPendingClaimsAsync();
        Task<IEnumerable<Claim>> GetAllClaimsAsync();
        Task UpdateClaimAsync(Claim claim);
        Task<IssuedPolicy?> GetIssuedPolicyByIdAsync(int issuedPolicyId);
        Task<bool> HasIncompleteClaimForVehicleAsync(string vehicleNumber);
    }
}