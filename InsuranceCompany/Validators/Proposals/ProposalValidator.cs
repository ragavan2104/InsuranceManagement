using FluentValidation;
using InsuranceCompany.Models.Proposals;
namespace InsuranceCompany.Validators.Proposals
{
    public class ProposalValidator :AbstractValidator<Proposal>
    {
        public ProposalValidator() 
        {
            RuleFor(p => p.UserId)
                .GreaterThan(0).WithMessage("User ID must be greater than 0.");
            RuleFor(p => p.PolicyId)
                .GreaterThan(0).WithMessage("Policy ID must be greater than 0.");
            RuleFor(p => p.VehicleNumber)
                .NotEmpty().WithMessage("Vehicle Number is required.")
                .MaximumLength(20).WithMessage("Vehicle Number cannot exceed 20 characters.");
            RuleFor(p => p.VehicleMake)
                .NotEmpty().WithMessage("Vehicle Make is required.")
                .MaximumLength(50).WithMessage("Vehicle Make cannot exceed 50 characters.");
            RuleFor(p => p.VehicleModel)
                .NotEmpty().WithMessage("Vehicle Model is required.")
                .MaximumLength(50).WithMessage("Vehicle Model cannot exceed 50 characters.");
            RuleFor(p => p.VehicleYear)
                .InclusiveBetween(1900, DateTime.Now.Year).WithMessage($"Vehicle Year must be between 1900 and {DateTime.Now.Year}.");
            RuleFor(p => p.EngineNumber)
                .NotEmpty().WithMessage("Engine Number is required.")
                .MaximumLength(50).WithMessage("Engine Number cannot exceed 50 characters.");
            RuleFor(p => p.ChassisNumber)
                .NotEmpty().WithMessage("Chassis Number is required.")
                .MaximumLength(50).WithMessage("Chassis Number cannot exceed 50 characters.");
            
        }
    }
}
