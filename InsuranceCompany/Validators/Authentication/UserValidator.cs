using FluentValidation;
using InsuranceCompany.Models.Authentication;

namespace InsuranceCompany.Validators.Authentication
{
    public class UserValidator : AbstractValidator<User>
    {
        public UserValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty()
                .WithMessage("Name is Required.")
                .Length(3, 50)
                .WithMessage("The Length Must between 3 to 50 characters.");

            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("EmailId is Required.")
                .EmailAddress()
                .WithMessage("EmailId is not valid.");

            RuleFor(x => x.PasswordHash)
                .NotEmpty()
                .WithMessage("Password is Required.")
                .MinimumLength(6)
                .WithMessage("Password must be at least 6 characters long.");

            RuleFor(x => x.Phone)
                .Matches(@"^\d{10}$")
                .When(x => !string.IsNullOrEmpty(x.Phone))
                .WithMessage("Phone number must be 10 digits.");

            RuleFor(x => x.AadhaarNumber)
                .Matches(@"^\d{12}$")
                .When(x => !string.IsNullOrEmpty(x.AadhaarNumber))
                .WithMessage("Aadhaar number must be 12 digits.");

            RuleFor(x => x.PANNumber)
                .Matches(@"^[A-Z]{5}\d{4}[A-Z]$")
                .When(x => !string.IsNullOrEmpty(x.PANNumber))
                .WithMessage("PAN number must be in the format: 5 letters, 4 digits, 1 letter.");

            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Address is Required.");
             
            RuleFor(x => x.DateOfBirth)
                .NotEmpty()
                .WithMessage("Date of Birth is Required.")
                .LessThan(DateTime.Now)
                .WithMessage("Date of Birth must be in the past.");


        }


    }
}
