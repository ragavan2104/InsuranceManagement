using System.ComponentModel.DataAnnotations;

namespace InsuranceCompany.DTOs.PolicyManagement
{
    public class AddOnUpdateDto
    {
        [Required(ErrorMessage = "Add-On Name is required.")]
        [StringLength(100, ErrorMessage = "Add-On Name cannot exceed 100 characters.")]
        public string AddOnName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Cost is required.")]
        [Range(0, double.MaxValue, ErrorMessage = "Cost must be a non-negative value.")]
        public decimal AdditionalCost { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
