using System.ComponentModel.DataAnnotations;

namespace InsuranceCompany.DTOs.PolicyManagement
{
    public class PolicyCreateDto
    {
        [Required(ErrorMessage = "Policy name is required")]
        public string PolicyName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required")]
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Base premium is required")]
        public decimal BasePremium { get; set; }

        [Required(ErrorMessage = "Coverage amount is required")]
        public decimal CoverageAmount { get; set; }

        [Required(ErrorMessage = "Duration in months is required")]
        public int PolicyDurationMonths { get; set; } = 12;

        [Required(ErrorMessage = "Policy type is required")]
        [RegularExpression("^(Comprehensive|Third-Party, Fire & Theft TPFT|Third-Party Only TPO)$",
            ErrorMessage = "Policy type must be either 'Comprehensive', 'Third-Party, Fire & Theft TPFT', or 'Third-Party Only TPO'")]
        public string PolicyType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Category ID is required")]
        public int CategoryId { get; set; }
    }
}