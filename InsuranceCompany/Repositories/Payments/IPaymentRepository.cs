using InsuranceCompany.Models.Operations;
namespace InsuranceCompany.Repositories.Payments
{
    public interface IPaymentRepository
    {
        Task<Payment> AddPaymentAsync(Payment payment);
        Task<Payment> GetPaymentByIdAsync(int id);
        Task SaveIssuedPolicyAsync(IssuedPolicy issuedPolicy);
    }
}
