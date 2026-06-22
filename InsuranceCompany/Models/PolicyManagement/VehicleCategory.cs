using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; 

namespace InsuranceCompany.Models.PolicyManagement
{
    public class VehicleCategory
    {
        [Key]
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty; 
        public string? Description { get; set; }

       
        public virtual ICollection<InsurancePolicy> InsurancePolicies { get; set; } = new List<InsurancePolicy>();
    }
}