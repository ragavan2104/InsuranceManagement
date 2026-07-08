using System.ComponentModel.DataAnnotations.Schema;

namespace InsuranceCompany.Models.PolicyManagement
{
    public class PolicyAddOn
    {
        public int PolicyAddOnId { get; set; }
        public int PolicyId { get; set; }
        public int AddOnId { get; set; }

        [ForeignKey("PolicyId")]
        public virtual InsurancePolicy? InsurancePolicy { get; set; }
        public virtual AddOn? AddOn { get; set; }
    }
}