namespace InsuranceCompany.DTOs.PolicyManagement
{
    public class PremiumCalculationResponseDto
    {
        public decimal BasePremium { get; set; }
        public decimal VehicleAgeSurcharge { get; set; }
        public decimal RiskSurcharge { get; set; }
        public decimal TotalPremium { get; set; }
    }
}
