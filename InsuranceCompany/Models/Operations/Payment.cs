using InsuranceCompany.Models.Proposals;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace InsuranceCompany.Models.Operations
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public int? ProposalId { get; set; }
        public int? QuoteId { get; set; }
        [Column(TypeName = "decimal(18, 2)")]
        public decimal AmountPaid { get; set; }
        public string? PaymentMethod { get; set; } 
        public string? TransactionId { get; set; }
        public string PaymentStatus { get; set; } = "Pending"; 
        public DateTime? PaidAt { get; set; }

        [ForeignKey("ProposalId")]
        public virtual Proposal? Proposal { get; set; }
        [ForeignKey("QuoteId")]
        public virtual Quote? Quote { get; set; }
        public virtual IssuedPolicy? IssuedPolicy { get; set; }
    }
}