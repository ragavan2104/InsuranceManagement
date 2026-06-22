using InsuranceCompany.Models.Authentication;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InsuranceCompany.Models.PolicyManagement
{
    public class InsurancePolicy
    {
        [Key]
        public int PolicyId { get; set; }

        public string PolicyName { get; set; } = string.Empty;

        public int CategoryId { get; set; }

        public string? Description { get; set; }
        public string? CoverageDetails { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal BasePremium { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal CoverageAmount { get; set; }

        
        public int PolicyDurationMonths { get; set; } = 12;
        [Required(ErrorMessage ="Type is Required")]
        [RegularExpression("^(Comprehensive |Third-Party, Fire & Theft (TPFT)| Third-Party Only (TPO))", ErrorMessage = "Policy type must be either 'Comprehensive', 'Third-Party, Fire & Theft (TPFT)', or 'Third-Party Only (TPO)'")]
        public string PolicyType { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties with explicit ForeignKey mappings
        [ForeignKey("CategoryId")]
        public virtual VehicleCategory? VehicleCategory { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual User? Creator { get; set; }

        public virtual ICollection<PolicyAddOn> PolicyAddOns { get; set; } = new List<PolicyAddOn>();
    }
}