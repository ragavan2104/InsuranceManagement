using System.Collections.Generic;

namespace InsuranceCompany.DTOs.PolicyManagement
{
    public class PolicyResponseDto
    {
        public int PolicyId { get; set; }
        public string PolicyName { get; set; } 
        public string Description { get; set; } 
        public decimal BasePremium { get; set; }
        public decimal CoverageAmount { get; set; }
        public int PolicyDurationMonths { get; set; } = 12;
        public string PolicyType { get; set; } 
        public int CategoryId { get; set; }

        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<AddOnResponseDto> AssociatedAddOns { get; set; } = new List<AddOnResponseDto>();
    }
}