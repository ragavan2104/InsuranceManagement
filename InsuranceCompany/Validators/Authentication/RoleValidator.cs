using FluentValidation;
using InsuranceCompany.Models.Authentication;

namespace InsuranceCompany.Validators.Authentication
{
    public class RoleValidator : AbstractValidator<Role>
    {
        public RoleValidator() 
        {
            RuleFor(x => x.RoleName)
                .NotEmpty()
                .WithMessage("Role name is required.")
                .Must(role => role == "User" || role == "Officer")
                .WithMessage("Role Must be user or officer.");
        }
    }
}
