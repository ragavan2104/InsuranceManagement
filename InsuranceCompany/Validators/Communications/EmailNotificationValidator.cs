using FluentValidation;
using InsuranceCompany.Models.Communications;
namespace InsuranceCompany.Validators.Communications
{
    public class EmailNotificationValidator :AbstractValidator<EmailNotification>
    {
        public EmailNotificationValidator()
        {
            RuleFor(e => e.UserId)
                .GreaterThan(0).WithMessage("User ID must be greater than 0.");
            RuleFor(e => e.EmailType)
                .NotEmpty().WithMessage("Email Type is required.")
                .MaximumLength(50).WithMessage("Email Type cannot exceed 50 characters.");
            RuleFor(e => e.Subject)
                .NotEmpty().WithMessage("Subject is required.")
                .MaximumLength(100).WithMessage("Subject cannot exceed 100 characters.");
        }

    }
}
