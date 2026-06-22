using System;
using System.ComponentModel.DataAnnotations;

namespace InsuranceCompany.Dtos.Claims
{
    public class ClaimFileDto
    {
        [Required]
        public int IssuedPolicyId { get; set; }

        [Required]
        [Range(1, 10000000, ErrorMessage = "Estimated loss must be greater than 0")]
        public decimal EstimatedLossAmount { get; set; }

        [Required]
        [StringLength(1000, MinimumLength = 10, ErrorMessage = "Please provide a detailed description (10-1000 characters).")]
        public string IncidentDescription { get; set; } = string.Empty;

        [Required]
        public DateTime IncidentDate { get; set; }
    }
}