using FluentValidation;
using InsuranceCompany.Models.PolicyManagement;

namespace InsuranceCompany.Validators.PolicyManagementValidator
{
    public class VehicleCategoryValidator :AbstractValidator<VehicleCategory>
    {
        public VehicleCategoryValidator() 
        {
            RuleFor(vc => vc.CategoryName)
                .NotEmpty().WithMessage("Category Name is required.")
                .MaximumLength(100).WithMessage("Category Name cannot exceed 100 characters.");

            RuleFor(vc => vc.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");
        }
    }
}
