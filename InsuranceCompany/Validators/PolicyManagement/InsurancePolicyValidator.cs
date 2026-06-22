using FluentValidation;
using InsuranceCompany.Models.PolicyManagement;
namespace InsuranceCompany.Validators.PolicyManagementValidator
{
    public class InsurancePolicyValidator : AbstractValidator<InsurancePolicy>
    {
        public InsurancePolicyValidator() 
        {
            RuleFor(policy => policy.PolicyName)
                .NotEmpty().WithMessage("Policy name is required.")
                .MaximumLength(100).WithMessage("Policy name cannot exceed 100 characters.");
            RuleFor(policy => policy.CategoryId)
                .GreaterThan(0).WithMessage("Category ID must be greater than 0.");
            RuleFor(policy => policy.Description)
                .NotEmpty().WithMessage("Description is required.")
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");
            RuleFor(policy => policy.CoverageDetails)
                .NotEmpty().WithMessage("Coverage details are required.")
                .MaximumLength(1000).WithMessage("Coverage details cannot exceed 1000 characters.");
            RuleFor(policy => policy.BasePremium)
                .NotEmpty().WithMessage("Base premium is required.")
                .GreaterThan(0).WithMessage("Base premium must be greater than 0.");
            RuleFor(policy => policy.CoverageAmount)
                .NotEmpty().WithMessage("Coverage amount is required.")
                .GreaterThan(0).WithMessage("Coverage amount must be greater than 0.");
            RuleFor(policy => policy.PolicyDurationMonths)
                .NotEmpty().WithMessage("Policy duration is required.")
                .GreaterThan(0).WithMessage("Policy duration must be greater than 0.");


        }
    }
}
