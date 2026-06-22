using System;
using System.ComponentModel.DataAnnotations;
namespace InsuranceCompany.Models.Proposals
{
    public class ProposalDocument
    {
        [Key]
        public int DocumentId { get; set; }
        public int ProposalId { get; set; }
        public string DocumentType { get; set; } = string.Empty; 
        public string FileUrl { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
        public bool IsVerified { get; set; }

        
        public virtual Proposal? Proposal { get; set; }
    }
}