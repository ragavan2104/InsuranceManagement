using FluentValidation;
using InsuranceCompany.Models.Operations;

namespace InsuranceCompany.Validators.Operations
{
    public class PaymentValidator : AbstractValidator<Payment>
    {
        public PaymentValidator() 
        {
            RuleFor(x => x.AmountPaid)
                .GreaterThan(0).WithMessage("Amount paid must be greater than zero.");
            RuleFor( x => x.PaymentMethod)
                .NotEmpty().WithMessage("Payment method is required.")
                .Must(method => method == "Card" || method == "NetBanking" || method == "UPI")
                .WithMessage("Payment method must be 'Card', 'NetBanking', or 'UPI'.");
        
        }
    }
}
