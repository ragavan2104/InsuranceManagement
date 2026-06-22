using InsuranceCompany.Models.Authentication;
namespace InsuranceCompany.Services.Authentication
{
    public interface ITokenService
    {
        string CreateToken(User user, string roleName);
    }
}
