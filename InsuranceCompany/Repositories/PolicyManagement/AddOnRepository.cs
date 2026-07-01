using Microsoft.EntityFrameworkCore;
using InsuranceCompany.Data;
using InsuranceCompany.Models.PolicyManagement;
using log4net;

namespace InsuranceCompany.Repositories.PolicyManagement
{
    public class AddOnRepository : IAddOnRepository
    {
        private readonly AppDbContext _context;
        private static readonly ILog _log = LogManager.GetLogger(typeof(AddOnRepository));

        public AddOnRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AddOn>> GetAllAddOnsAsync()
        {
            try
            {
                _log.Info("Fetching all Add-Ons from the database.");
                return await _context.AddOns.ToListAsync();
            }
            catch (Exception ex)
            {
                _log.Error("Error fetching all Add-Ons from the database.", ex);
                throw;
            }
        }

        public async Task<AddOn?> GetAddOnByIdAsync(int id)
        {
            try
            {
                _log.Info($"Fetching Add-On with ID: {id}");
                return await _context.AddOns.FindAsync(id);
            }
            catch (Exception ex)
            {
                _log.Error($"Error fetching Add-On with ID: {id}", ex);
                throw;
            }
        }

        public async Task<AddOn> AddAddOnAsync(AddOn addOn)
        {
            try
            {
                _log.Info("Adding a new Add-On to the database.");
                _context.AddOns.Add(addOn);
                await _context.SaveChangesAsync();
                return addOn;
            }
            catch (Exception ex)
            {
                _log.Error("Error adding Add-On to the database.", ex);
                throw;
            }
        }

        public async Task UpdateAddOnAsync(AddOn addOn)
        {
            try
            {
                _log.Info($"Updating Add-On with ID: {addOn.AddOnId} in the database.");
                _context.AddOns.Update(addOn);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _log.Error($"Error updating Add-On with ID: {addOn.AddOnId} in the database.", ex);
                throw;
            }
        }
    }
}
