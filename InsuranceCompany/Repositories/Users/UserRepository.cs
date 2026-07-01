using InsuranceCompany.Data;
using InsuranceCompany.Models.Authentication;
using InsuranceCompany.Repositories.Proposals;
using log4net;
using Microsoft.EntityFrameworkCore;
namespace InsuranceCompany.Repositories.Users
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        private static readonly ILog _log = LogManager.GetLogger(typeof(UserRepository));

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<User>> GetAllUserAsync()
        {
            try
            {
                _log.Info("Fetching all users");
                return await _context.Users.ToListAsync();
            }
            catch (Exception ex)
            {
                _log.Error("Error fetching all users", ex);
                throw;
            }
        }
        public async Task<User?> GetUserByIdAsync(int id)
        {
            try
            {
                _log.Info($"Fetching user with ID: {id}");
                return await _context.Users.FindAsync(id);
            }
            catch (Exception ex)
            {
                _log.Error($"Error fetching user with ID: {id}", ex);
                throw;
            }
        }
        public async Task<User?> DeleteUserAsync(int id)
        {
            try
            {
                _log.Info($"Deleting user with ID: {id}");
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    _log.Warn($"User with ID: {id} not found for deletion");
                    return null;
                }
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                _log.Info($"User with ID: {id} deleted successfully");
                return user;
            }
            catch (Exception ex)
            {
                _log.Error($"Error deleting user with ID: {id}", ex);
                throw;
            }
        }
    }
}

