using InsuranceCompany.DTOs.Payments;

namespace InsuranceCompany.Services.Payments
{
    public interface IPaymentService
    {
        Task<PolicyReciptDto> ProcessPaymentAsync(int userId, PaymentProcessDto dto);
        
    }
}
