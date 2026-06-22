using FluentValidation;
using InsuranceCompany.Models.Proposals;
namespace InsuranceCompany.Validators.Proposals
{
    public class ProposalDocumentValidator : AbstractValidator<ProposalDocument>
    {
        public ProposalDocumentValidator() 
        {
            RuleFor(p => p.ProposalId)
                .NotEmpty().WithMessage("Proposal ID is required.")
                .GreaterThan(0).WithMessage("Proposal ID must be greater than 0.");
            RuleFor(p => p.DocumentType)
                .NotEmpty().WithMessage("Document Type is required.")
                .Must(Document => Document == "RC Book" || Document == "License" ).WithMessage("Docment Type Invalid. Allowed values are 'RC Book' or 'License'."); 
            RuleFor(p => p.FileUrl)
                .NotEmpty().WithMessage("File URL is required.")
                .MaximumLength(200).WithMessage("File URL cannot exceed 200 characters.");
            RuleFor(p => p.UploadedAt)
                .LessThanOrEqualTo(DateTime.Now).WithMessage("Uploaded date cannot be in the future.");

        }
    }
}
