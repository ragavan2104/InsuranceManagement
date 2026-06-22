using System.ComponentModel.DataAnnotations;
namespace InsuranceCompany.DTOs.Payments
{
    public class PaymentProcessDto
    {
        [Required]
        public int ProposalId { get; set; }
        [Required]
        [StringLength(20)]
        public string PaymentMethod { get; set; } = string.Empty;
        [Required]
        [StringLength(100)]
        public string? TransactionId { get; set; }

    }
}
