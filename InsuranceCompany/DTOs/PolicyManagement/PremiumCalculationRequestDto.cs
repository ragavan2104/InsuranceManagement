using System.ComponentModel.DataAnnotations;

namespace InsuranceCompany.DTOs.PolicyManagement
{
    public class PremiumCalculationRequestDto
    {
        [Required]
        public int PolicyId { get; set; }

        [Required]
        [Range(1900, 2100)]
        public int VehicleYear { get; set; }

        public bool HasPriorClaims { get; set; }

        public bool IsDriverUnder25 { get; set; }

        public bool IsCommercialUse { get; set; }
    }
}
