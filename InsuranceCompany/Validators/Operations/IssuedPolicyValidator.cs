using FluentValidation;
using InsuranceCompany.Models.Operations;
namespace InsuranceCompany.Validators.Operations
{
    public class IssuedPolicyValidator :AbstractValidator<IssuedPolicy>
    {
        public IssuedPolicyValidator()
        {
            RuleFor(x => x.PolicyId)
                .NotEmpty()
                .WithMessage("Policy Number is Required.");
                
            RuleFor(x => x.IssuedAt)
                .NotEmpty()
                .WithMessage("Issue Date is Required.")
                .LessThanOrEqualTo(DateTime.Now)
                .WithMessage("Issue Date cannot be in the future.");

        }
    }
}
