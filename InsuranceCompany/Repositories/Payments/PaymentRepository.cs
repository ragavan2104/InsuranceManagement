using Microsoft.EntityFrameworkCore;
using InsuranceCompany.Data;
using InsuranceCompany.Models.Operations;
using log4net;

namespace InsuranceCompany.Repositories.Payments
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly AppDbContext _context;
        private static readonly ILog _log = LogManager.GetLogger(typeof(PaymentRepository));

        public PaymentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Payment> AddPaymentAsync(Payment payment)
        {
            try
            {
                _log.Info("Adding payment to the database.");
                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();
                return payment;
            }
            catch (Exception ex)
            {
                _log.Error("Error adding payment to the database.", ex);
                throw;
            }
        }

        public async Task<Payment?> GetPaymentByIdAsync(int id)
        {
            try
            {
                _log.Info($"Fetching payment with ID: {id}");
                return await _context.Payments
                    .Include(p => p.Proposal)
                    .ThenInclude(pr => pr!.InsurancePolicy)
                    .Include(p => p.IssuedPolicy)
                    .FirstOrDefaultAsync(p => p.PaymentId == id);
            }
            catch (Exception ex)
            {
                _log.Error($"Error fetching payment with ID: {id}", ex);
                throw;
            }
        }

        public async Task SaveIssuedPolicyAsync(IssuedPolicy issuedPolicy)
        {
            try
            {
                _log.Info("Saving issued policy to the database.");
                _context.IssuedPolicies.Add(issuedPolicy);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _log.Error("Error saving issued policy to the database.", ex);
                throw;
            }
        }
    }
}