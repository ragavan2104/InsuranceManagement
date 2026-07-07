namespace InsuranceCompany.DTOs.Proposals
{
    public class ProposalResponseDto
    {
        public int ProposalId { get; set; }
        public int UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int PolicyId { get; set; }
        public string PolicyName { get; set; }
        public string PolicyType { get; set; }
        public string VehicleNumber { get; set; }
        public string VehicleMake { get; set; }
        public string VehicleModel { get; set; }
        public int VehicleYear { get; set; }
        public int VehicleAge { get; set; }
        public string Status { get; set; }
        public string? OfficerRemarks { get; set; }
        public int? AssignedOfficerId { get; set; }
        public DateTime SubmittedAt { get; set; }
        public decimal TotalCalculatedPremium { get; set; }
        public decimal FinalInsuredDeclaredValue { get; set; }
        public List<string> AppliedAddOnName { get; set; } = new List<string>();
        public int? IssuedPolicyId { get; set; }


    }
}
