using InsuranceCompany.Models.Authentication;
using InsuranceCompany.Models.Operations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace InsuranceCompany.Models.Proposals
{
    public class Quote
    {
        public int QuoteId { get; set; } 
        public int ProposalId { get; set; }
        [Column(TypeName = "decimal(18, 2)")]
        public decimal BasePremium { get; set; }
        [Column(TypeName = "decimal(18 , 2)")]
        public decimal AddOnCost { get; set; }
        [Column(TypeName = "decimal(18, 2)")]
        public decimal VehicleAgeFactor { get; set; }
        
        public string RiskFactor { get; set; }
        [Column(TypeName = "decimal(15, 2)")]
        public decimal TotalPremium { get; private set; } 
        public DateTime ValidUntil { get; set; }
        public bool IsEmailed { get; set; }
        public int GeneratedBy { get; set; } 
        public DateTime GeneratedAt { get; set; }

        [ForeignKey("ProposalId")]
        public virtual Proposal? Proposal { get; set; }
        public virtual User? Generator { get; set; }
        [InverseProperty("Quote")]
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}