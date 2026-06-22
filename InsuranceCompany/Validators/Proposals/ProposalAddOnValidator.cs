using FluentValidation;
using InsuranceCompany.Models.Proposals;

namespace InsuranceCompany.Validators.Proposals
{
    public class ProposalAddOnValidator : AbstractValidator<ProposalAddOn>
    {
        public ProposalAddOnValidator() 
        {
            RuleFor(p => p.ProposalId)
                .NotEmpty().WithMessage("Proposal ID is required.")
                .GreaterThan(0).WithMessage("Proposal ID must be greater than 0.");
            RuleFor(p => p.AddOnId)
                .NotEmpty().WithMessage("Add-On ID is required.")
                .GreaterThan(0).WithMessage("Add-On ID must be greater than 0.");
            
        }
    }
}
