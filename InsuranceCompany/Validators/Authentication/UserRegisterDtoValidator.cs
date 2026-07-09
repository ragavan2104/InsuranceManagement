using FluentValidation;
using InsuranceCompany.DTOs.Authentication;
namespace InsuranceCompany.Validators.Authentication
{
    public class UserRegisterDtoValidator :AbstractValidator<UserRegisterDto>
    {
        public UserRegisterDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required.")
                .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters.");
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters long.");
            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Address is required.")
                .MaximumLength(200).WithMessage("Address cannot exceed 200 characters.");
            RuleFor(x => x.AadhaarNumber)
                .NotEmpty().WithMessage("Aadhaar number is required.")
                .Matches(@"^\d{12}$").WithMessage("Aadhaar number must be exactly 12 digits.");
            RuleFor(x => x.PANNumber)
                .NotEmpty().WithMessage("License number is required.")
                .Length(10, 16).WithMessage("License number must be between 10 and 16 characters.");
            RuleFor(x => x.DateOfBirth)
                .NotEmpty().WithMessage("Date of birth is required.")
                .LessThan(DateTime.Now).WithMessage("Date of birth must be in the past.")
                .Must(dob => {
                    int calculatedAge = DateTime.Today.Year - dob.Year;
                    if (dob > DateTime.Today.AddYears(-calculatedAge)) calculatedAge--;
                    return calculatedAge >= 18;
                }).WithMessage("You must be at least 18 years old to register.");
            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Phone number is required.")
                .Matches(@"^\d{10}$").WithMessage("Phone number must be exactly 10 digits.");
        }
    }
}
