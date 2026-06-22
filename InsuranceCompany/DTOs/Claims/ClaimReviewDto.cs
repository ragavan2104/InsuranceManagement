using System.ComponentModel.DataAnnotations;

namespace InsuranceCompany.Dtos.Claims
{
    public class ClaimReviewDto
    {
        [Required]
        [RegularExpression("Approved|Rejected", ErrorMessage = "Status must be 'Approved' or 'Rejected'.")]
        public string Status { get; set; } = string.Empty;

        [Range(0, 10000000, ErrorMessage = "Settlement amount cannot be negative.")]
        public decimal ApprovedSettlementAmount { get; set; }

        [Required]
        [StringLength(500, MinimumLength = 5, ErrorMessage = "Remarks must be between 5 and 500 characters.")]
        public string OfficerRemarks { get; set; } = string.Empty;
    }
}