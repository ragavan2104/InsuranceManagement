using System.Collections.Generic;
using System.Threading.Tasks;
using InsuranceCompany.Dtos.Claims;
using InsuranceCompany.Models.Operations;

namespace InsuranceCompany.Services.Claims
{
    public interface IClaimService
    {
        Task<Claim> FileClaimAsync(int userId, ClaimFileDto dto);
        Task<bool> ReviewClaimAsync(int claimId, int officerId, ClaimReviewDto dto);
        Task<IEnumerable<Claim>> GetCustomerClaimsHistoryAsync(int userId);
        Task<IEnumerable<Claim>> GetPendingClaimsQueueAsync();
        Task<IEnumerable<Claim>> GetAllClaimsHistoryAsync();
        Task<Claim?> TrackClaimStatusAsync(int claimId, int userId, bool bypassOwnershipCheck);
    }
}