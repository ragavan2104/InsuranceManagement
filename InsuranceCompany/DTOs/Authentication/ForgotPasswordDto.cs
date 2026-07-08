using System.ComponentModel.DataAnnotations;

namespace InsuranceCompany.DTOs.Authentication
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
