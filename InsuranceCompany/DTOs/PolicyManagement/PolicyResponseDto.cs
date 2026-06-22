namespace InsuranceCompany.DTOs.PolicyManagement
{
    public class PolicyResponseDto
    {
        public int PolicyId { get; set; }
        public string PolicyName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePremium { get; set; }
        public decimal CoverageAmount { get; set; }
        public int PolicyDurationMonths { get; set; } = 12;
        public string PolicyType { get; set; } = string.Empty;
        public int CategoryId { get; set; }

        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}