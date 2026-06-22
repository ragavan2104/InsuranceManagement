using FluentValidation;
using InsuranceCompany.Models.PolicyManagement;
namespace InsuranceCompany.Validators.PolicyManagementValidator
{
    public class AddOnValidator :AbstractValidator<AddOn>
    {
        public AddOnValidator()
        {
            RuleFor(addOn => addOn.AddOnName)
                .NotEmpty().WithMessage("Add-On Name is required.")
                .MaximumLength(100).WithMessage("Add-On Name cannot exceed 100 characters.");
            RuleFor(addOn => addOn.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");
            RuleFor(addOn => addOn.AdditionalCost)
                .GreaterThanOrEqualTo(0).WithMessage("Cost must be a non-negative value.");
        }
    }
}
