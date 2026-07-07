using InsuranceCompany.Data;
using InsuranceCompany.DTOs.Authentication;
using InsuranceCompany.Repositories.Users;
using InsuranceCompany.Services.Proposals;
using log4net;
namespace InsuranceCompany.Services.Users
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly IUserRepository _userRepository;
        private static readonly ILog _log = LogManager.GetLogger(typeof(UserService));

        public UserService(AppDbContext context, IUserRepository userRepository)
        {
            _context = context;
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<UserResponseDto>> GetAllUserAsync()
        {
            try
            {
                _log.Info("Fetching all users");
                var users = await _userRepository.GetAllUserAsync();
                return users.Select(u => new UserResponseDto
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    Address = u.Address,
                    Phone = u.Phone,
                    AadhaarNumber = u.AadhaarNumber,
                    Age = u.Age,
                    PANNumber = u.PANNumber,
                    DateOfBirth = u.DateOfBirth,
                    RoleId = u.RoleId
                }).ToList(); 
            }
            catch (Exception ex)
            {
                _log.Error("Error fetching all users", ex);
                throw;
            }
        }
        public async Task<UserResponseDto?> GetUserByIdAsync(int id)
        {
            try
            {
                _log.Info($"Fetching user with ID: {id}");
                var user = await _userRepository.GetUserByIdAsync(id);
                if (user == null)
                {
                    _log.Warn($"User with ID: {id} not found");
                    return null;
                }
                return new UserResponseDto
                {
                    UserId = user.UserId,
                    FullName = user.FullName,
                    Email = user.Email,
                    Address = user.Address,
                    Phone = user.Phone,
                    AadhaarNumber = user.AadhaarNumber,
                    Age = user.Age,
                    PANNumber = user.PANNumber,
                    DateOfBirth = user.DateOfBirth,
                    RoleId = user.RoleId
                };
            }
            catch (Exception ex)
            {
                _log.Error($"Error fetching user with ID: {id}", ex);
                throw;
            }
        }
    }
}
