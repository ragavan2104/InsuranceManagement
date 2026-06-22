namespace InsuranceCompany.DTOs.Payments
{
    public class PolicyReciptDto
    {
        public int PaymentId { get; set; }
        public int ProposalId { get; set; }
        public decimal AmountPaid { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public DateTime PaidAt { get; set; }
        public string PolicyNumber { get; set; } = string.Empty;
        public DateTime EffectiveDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string ActiveStatus { get; set; } = string.Empty;
    }
}
