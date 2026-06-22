using System.Collections.Generic;

namespace InsuranceCompany.Models.Authentication
{
    public class Role
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty; 

        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}