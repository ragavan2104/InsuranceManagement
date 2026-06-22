namespace InsuranceCompany.DTOs.Authentication
{
    public class UserRegisterDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string AadhaarNumber { get; set; } = string.Empty;
        public int Age { get;  set; }
        public string PANNumber { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public int RoleId { get; set; } = 1;

    }
}
