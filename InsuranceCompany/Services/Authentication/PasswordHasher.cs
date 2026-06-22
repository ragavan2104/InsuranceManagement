using BCrypt.Net;
using Microsoft.AspNetCore.Identity;
using System.Reflection.Metadata;
namespace InsuranceCompany.Services.Authentication
{
    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }
        public bool VerifyPassword(string passord, string HashPassword)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(passord, HashPassword);

            }
            catch (Exception ex)
            {

                return false;
            }
        }
    }
}
