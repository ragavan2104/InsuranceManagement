using System.ComponentModel.DataAnnotations;

namespace InsuranceCompany.DTOs.Proposals
{
    public class ProposalReviewDto
    {
        [Required]
        [RegularExpression("^(Approved|Rejected)$", ErrorMessage = "Status must be either 'Approved' or 'Rejected'.")]
        public string Status { get; set; } = string.Empty;
        [Required]
        [StringLength(500, ErrorMessage = "Officer remarks cannot exceed 500 characters.")]
        public string OfficerRemarks { get; set; } = string.Empty;
    }
}
