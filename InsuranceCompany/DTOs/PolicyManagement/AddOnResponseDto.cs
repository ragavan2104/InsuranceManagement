namespace InsuranceCompany.DTOs.PolicyManagement
{
    public class AddOnResponseDto
    {
        public int AddOnId { get; set; }
        public string AddOnName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal AdditionalCost { get; set; }
        public bool IsActive { get; set; }
    }
}
