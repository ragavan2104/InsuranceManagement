namespace InsuranceCompany.DTOs.Authentication
{
    public class UserResponseDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } 
        public string Email { get; set; } 
        public string Address { get; set; } 
        public string Phone { get; set; } 
        public string AadhaarNumber { get; set; } 
        public int Age { get; set; }
        public string PANNumber { get; set; } 
        public DateTime DateOfBirth { get; set; }
        public int RoleId { get; set; } 
    }
}
