using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace InsuranceCompany.Models.PolicyManagement
{
    public class AddOn
    {
        public int AddOnId { get; set; }
        public string AddOnName { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Column(TypeName = "decimal(18, 2)")]
        public decimal AdditionalCost { get; set; }
        public bool IsActive { get; set; }

        
        public virtual ICollection<PolicyAddOn> PolicyAddOns { get; set; } = new List<PolicyAddOn>();
    }
}