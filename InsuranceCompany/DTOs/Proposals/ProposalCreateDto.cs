using System.ComponentModel.DataAnnotations;
namespace InsuranceCompany.DTOs.Proposals
{
    public class ProposalCreateDto
    {
        [Required]
        public int PolicyId { get; set; }
        [Required]
        [StringLength(20)]
        public string VehicleNumber { get; set; } = string.Empty;
        [Required] [StringLength(20)]
        public string VehicleMake { get; set; } = string.Empty;
        [Required] [StringLength(20)]
        public string VehicleModel { get; set; } = string.Empty;
            [Required]
        [Range(1900, 2100, ErrorMessage = "Vehicle year must be between 1900 and 2100.")]
        public int VehicleYear { get; set; } = 0;
        [Required] [StringLength(25)]
        public string? EngineNumber { get; set; }
        [Required] [StringLength(25)]
        public string ChassisNumber { get; set; } = string.Empty;
        public List<int>? SelectedAddOnIds { get; set; } =new List<int>();

    }
}
