using InsuranceCompany.Models.Authentication;
namespace InsuranceCompany.Repositories.Users
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllUserAsync();
        Task<User?> GetUserByIdAsync(int id);
        Task<User?> DeleteUserAsync(int id);
    }
}
