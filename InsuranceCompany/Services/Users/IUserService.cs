using InsuranceCompany.DTOs.Authentication;
namespace InsuranceCompany.Services.Users
{
    public interface IUserService
    {
        Task<IEnumerable<UserResponseDto>> GetAllUserAsync();
        Task<UserResponseDto?> GetUserByIdAsync(int id);

    }
}
