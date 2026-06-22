using InsuranceCompany.Models.PolicyManagement;
using InsuranceCompany.Models.Authentication;
using InsuranceCompany.Models.PolicyManagement;
using InsuranceCompany.Models.Proposals;
using System;
using System.Collections.Generic;
using System.Security.Claims;

namespace InsuranceCompany.Models.Operations
{
    public class IssuedPolicy
    {
        public int IssuedPolicyId { get; set; }
        public string PolicyNumber { get;  set; } = string.Empty; 
        public int? ProposalId { get; set; }
        public int? UserId { get; set; }
        public int? PolicyId { get; set; }
        public int? PaymentId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Active"; 
        public string? PolicyDocumentUrl { get; set; }
        public bool IsDocumentEmailed { get; set; }
        public DateTime IssuedAt { get; set; }

        public virtual Proposal? Proposal { get; set; }
        public virtual User? User { get; set; }
        public virtual InsurancePolicy? InsurancePolicy { get; set; }
        public virtual Payment? Payment { get; set; }
        public virtual ICollection<Claim> Claims { get; set; } = new List<Claim>();
    }
}