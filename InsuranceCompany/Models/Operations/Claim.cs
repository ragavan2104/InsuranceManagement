using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InsuranceCompany.Models.Operations
{
    public class Claim
    {
        [Key]
        public int ClaimId { get; set; }

        [Required]
        public int IssuedPolicyId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal EstimatedLossAmount { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal ApprovedSettlementAmount { get; set; } = 0;

        [Required]
        [StringLength(1000)]
        public string IncidentDescription { get; set; } = string.Empty;

        [Required]
        public DateTime IncidentDate { get; set; }

        [Required]
        public string Status { get; set; } = "ClaimFiled"; 

        public string? OfficerRemarks { get; set; }
        public int? ReviewedByOfficerId { get; set; }
        public DateTime FiledAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        [ForeignKey("IssuedPolicyId")]
        public virtual IssuedPolicy? IssuedPolicy { get; set; }
    }
}