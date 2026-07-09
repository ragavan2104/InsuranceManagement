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
                .Length(10, 16)
                .When(x => !string.IsNullOrEmpty(x.PANNumber))
                .WithMessage("License number must be between 10 and 16 characters.");

            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Address is Required.");
             
            RuleFor(x => x.DateOfBirth)
                .NotEmpty()
                .WithMessage("Date of Birth is Required.")
                .LessThan(DateTime.Now)
                .WithMessage("Date of Birth must be in the past.")
                .Must(dob => {
                    int calculatedAge = DateTime.Today.Year - dob.Year;
                    if (dob > DateTime.Today.AddYears(-calculatedAge)) calculatedAge--;
                    return calculatedAge >= 18;
                }).WithMessage("You must be at least 18 years old.");


        }


    }
}
