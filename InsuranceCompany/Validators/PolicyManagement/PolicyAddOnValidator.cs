using FluentValidation;
using InsuranceCompany.Models.PolicyManagement;

namespace InsuranceCompany.Validators.PolicyManagementValidator
{
    public class PolicyAddOnValidator :AbstractValidator<PolicyAddOn>
    {
        public PolicyAddOnValidator() 
        {
            RuleFor(addOn => addOn.PolicyId)
                .GreaterThan(0).WithMessage("Policy ID must be greater than 0.");
            RuleFor(addOn => addOn.AddOnId)
                .GreaterThan(0).WithMessage("Add-On ID must be greater than 0.");
        }
    }
}
