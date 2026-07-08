using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using InsuranceCompany.Data;
using InsuranceCompany.Models.Operations;

namespace InsuranceCompany.Repositories.Claims
{
    public class ClaimRepository : IClaimRepository
    {
        private readonly AppDbContext _context;

        public ClaimRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Claim> AddClaimAsync(Claim claim)
        {
            _context.Claims.Add(claim);
            await _context.SaveChangesAsync();
            return claim;
        }

        public async Task<Claim?> GetClaimByIdAsync(int claimId)
        {
            return await _context.Claims
                .Include(c => c.IssuedPolicy)
                    .ThenInclude(p => p!.InsurancePolicy)
                .Include(c => c.IssuedPolicy)
                    .ThenInclude(p => p!.Payment)
                .Include(c => c.IssuedPolicy)
                    .ThenInclude(p => p!.User)
                .FirstOrDefaultAsync(c => c.ClaimId == claimId);
        }

        public async Task<IEnumerable<Claim>> GetClaimsByUserIdAsync(int userId)
        {
            return await _context.Claims
                .Include(c => c.IssuedPolicy)
                    .ThenInclude(p => p!.InsurancePolicy) 
                .Include(c => c.IssuedPolicy)
                    .ThenInclude(p => p!.Payment)       
                .Where(c => c.IssuedPolicy!.Proposal!.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Claim>> GetAllPendingClaimsAsync()
        {
            return await _context.Claims
                .Include(c => c.IssuedPolicy)
                    .ThenInclude(p => p!.InsurancePolicy) 
                .Include(c => c.IssuedPolicy)
                    .ThenInclude(p => p!.Payment)
                .Where(c => c.Status == "ClaimFiled" || c.Status == "UnderReview")
                .ToListAsync();
        }

        public async Task<IEnumerable<Claim>> GetAllClaimsAsync()
        {
            return await _context.Claims
                .Include(c => c.IssuedPolicy)
                    .ThenInclude(p => p!.InsurancePolicy) 
                .Include(c => c.IssuedPolicy)
                    .ThenInclude(p => p!.Payment)
                .ToListAsync();
        }

        public async Task UpdateClaimAsync(Claim claim)
        {
            _context.Claims.Update(claim);
            await _context.SaveChangesAsync();
        }

        public async Task<IssuedPolicy?> GetIssuedPolicyByIdAsync(int issuedPolicyId)
        {
            return await _context.IssuedPolicies
                .Include(p => p.Proposal)
                .Include(p => p.InsurancePolicy)
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.IssuedPolicyId == issuedPolicyId);
        }

        public async Task<bool> HasIncompleteClaimForVehicleAsync(string vehicleNumber)
        {
            return await _context.Claims
                .AnyAsync(c => c.IssuedPolicy != null && 
                               c.IssuedPolicy.Proposal != null && 
                               c.IssuedPolicy.Proposal.VehicleNumber == vehicleNumber && 
                               c.Status != "Approved" && 
                               c.Status != "Rejected");
        }
    }
}