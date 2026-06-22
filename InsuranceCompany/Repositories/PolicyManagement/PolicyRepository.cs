using Microsoft.EntityFrameworkCore;
using InsuranceCompany.Data;
using InsuranceCompany.Models.PolicyManagement;
using log4net;

namespace InsuranceCompany.Repositories.PolicyManagement
{
    public class PolicyRepository : IPolicyRepository
    {
        private readonly AppDbContext _context;
        private static readonly ILog _log = LogManager.GetLogger(typeof(PolicyRepository));

        public PolicyRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<InsurancePolicy>> GetAllPoliciesAsync()
        {
            try
            {
                _log.Info("Fetching all policies from the database.");
                return await _context.InsurancePolicies.ToListAsync();
            }
            catch (Exception ex)
            {
                _log.Error("Error fetching all policies from the database.", ex);
                throw;
            }
        }

        public async Task<InsurancePolicy?> GetPolicyByIdAsync(int id)
        {
            try
            {
                _log.Info($"Fetching policy with ID: {id}");
                return await _context.InsurancePolicies.FindAsync(id);
            }
            catch (Exception ex)
            {
                _log.Error($"Error fetching policy with ID: {id}", ex);
                throw;
            }
        }

        public async Task<InsurancePolicy> AddPolicyAsync(InsurancePolicy policy)
        {
            try
            {
                _log.Info("Adding policy to the database.");
                _context.InsurancePolicies.Add(policy);
                await _context.SaveChangesAsync();
                return policy;
            }
            catch (Exception ex)
            {
                _log.Error("Error adding policy to the database.", ex);
                throw;
            }
        }

        public async Task UpdatePolicyAsync(InsurancePolicy policy)
        {
            try
            {
                _log.Info($"Updating policy in the database.");
                _context.InsurancePolicies.Update(policy);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _log.Error($"Error updating policy in the database.", ex);
                throw;
            }
        }
    }
}