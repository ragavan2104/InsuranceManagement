using FluentValidation;
using InsuranceCompany.Models.Proposals;

namespace InsuranceCompany.Validators.Proposals
{
    public class QuoteValidator : AbstractValidator<Quote>
    {
        public QuoteValidator() 
        {
            RuleFor(q => q.ProposalId)
                .NotEmpty().WithMessage("Proposal ID is required.")
                .GreaterThan(0).WithMessage("Proposal ID must be greater than 0.");
            RuleFor(q => q.BasePremium)
                .NotEmpty().WithMessage("Base Premium is required.")
                .GreaterThan(0).WithMessage("Base Premium must be greater than 0.");
            RuleFor(q => q.AddOnCost)
                .NotEmpty().WithMessage("Add-On Cost is required.")
                .GreaterThanOrEqualTo(0).WithMessage("Add-On Cost cannot be negative.");
            RuleFor(q => q.VehicleAgeFactor)
                .NotEmpty().WithMessage("Vehicle Age Factor is required.")
                .GreaterThan(0).WithMessage("Vehicle Age Factor must be greater than 0.");
            RuleFor(q => q.RiskFactor)
                .NotEmpty().WithMessage("Risk Factor is required.");
                
            RuleFor(q => q.TotalPremium)
                .NotEmpty().WithMessage("Total Premium is required.")
                .GreaterThan(0).WithMessage("Total Premium must be greater than 0.");
            RuleFor(q => q.ValidUntil)
                .NotEmpty().WithMessage("Valid Until date is required.");    
        }
    }
}
