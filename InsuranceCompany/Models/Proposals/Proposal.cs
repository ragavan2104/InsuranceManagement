using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using InsuranceCompany.Models.Authentication;
using InsuranceCompany.Models.PolicyManagement;
using InsuranceCompany.Models.Operations;

namespace InsuranceCompany.Models.Proposals
{
    public class Proposal
    {
        public int ProposalId { get; set; }
        public int UserId { get; set; }
        public int PolicyId { get; set; }
        public string VehicleNumber { get; set; } = string.Empty;
        public string VehicleMake { get; set; } = string.Empty;
        public string VehicleModel { get; set; } = string.Empty;
        public int VehicleYear { get; set; }
        public int VehicleAge { get;  set; } 
        public string? EngineNumber { get; set; }
        public string? ChassisNumber { get; set; }
        public string Status { get; set; } = "ProposalSubmitted"; 
        public string? OfficerRemarks { get; set; }
        public int? AssignedOfficerId { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual User? User { get; set; }

        [ForeignKey("PolicyId")]
        public virtual InsurancePolicy? InsurancePolicy { get; set; }

        public virtual User? AssignedOfficer { get; set; }

        public virtual Quote? Quote { get; set; }
        public virtual IssuedPolicy? IssuedPolicy { get; set; }
        public virtual ICollection<ProposalAddOn> ProposalAddOns { get; set; } = new List<ProposalAddOn>();
        public virtual ICollection<ProposalDocument> ProposalDocuments { get; set; } = new List<ProposalDocument>();
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}