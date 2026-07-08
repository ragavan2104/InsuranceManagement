using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace InsuranceCompany.DTOs.PolicyManagement
{
    public class PolicyUpdateDto
    {
        [Required(ErrorMessage = "Policy name is required")]
        public string PolicyName { get; set; }
        [Required(ErrorMessage = "Description is required")]
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string Description { get; set; }
        [Required(ErrorMessage = "Base premium is required")]
        public decimal BasePremium { get; set; }
        [Required(ErrorMessage = "Coverage amount is required")]
        public decimal CoverageAmount { get; set; }
        [Required(ErrorMessage = "Duration in months is required")]
        public int PolicyDurationMonths { get; set; } = 12;
        [Required(ErrorMessage = "Policy type is required")]
        [RegularExpression("^(Comprehensive|Third-Party, Fire & Theft \\(TPFT\\)|Third-Party Only \\(TPO\\))$",
            ErrorMessage = "Policy type must be either 'Comprehensive', 'Third-Party, Fire & Theft (TPFT)', or 'Third-Party Only (TPO)'")]
        public string PolicyType { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        public int CategoryId { get; set; }

        public List<int>? AssociatedAddOnIds { get; set; } = new List<int>();
    }
}
