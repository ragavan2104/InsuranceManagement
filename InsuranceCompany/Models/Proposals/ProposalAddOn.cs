using InsuranceCompany.Models.PolicyManagement;

namespace InsuranceCompany.Models.Proposals
{
    public class ProposalAddOn
    {
        public int ProposalAddOnId { get; set; }
        public int ProposalId { get; set; }
        public int AddOnId { get; set; }
        public virtual Proposal? Proposal { get; set; }
        public virtual AddOn? AddOn { get; set; }
    }
}