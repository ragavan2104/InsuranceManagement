using InsuranceCompany.Data;
using InsuranceCompany.Models.Proposals;
using Microsoft.EntityFrameworkCore;
using log4net;

namespace InsuranceCompany.Repositories.Proposals
{
    public class ProposalRepository : IProposalRepository
    {
        private readonly AppDbContext _context;
        private static readonly ILog _log = LogManager.GetLogger(typeof(ProposalRepository));

        public ProposalRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Proposal?> GetProposalByIdAsync(int id)
        {
            try
            {
                _log.Info($"Fetching proposal with ID: {id}");
                return await _context.Proposals
                    .Include(p => p.User)
                    .Include(p => p.InsurancePolicy)
                    .Include(p => p.ProposalAddOns)
                        .ThenInclude(pa => pa.AddOn)
                    .Include(p => p.Quote)
                    .FirstOrDefaultAsync(p => p.ProposalId == id);
            }
            catch (Exception ex)
            {
                _log.Error($"Error fetching proposal with ID: {id}", ex);
                throw;
            }
        }

        public async Task<IEnumerable<Proposal>> GetProposalsByUserIdAsync(int userId)
        {
            try
            {
                _log.Info($"Fetching proposals for user ID: {userId}");
                return await _context.Proposals
                    .Include(p => p.InsurancePolicy)
                    .Include(p => p.Quote)
                    .Include(p => p.ProposalAddOns)
                        .ThenInclude(pa => pa.AddOn)
                    .Where(p => p.UserId == userId)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _log.Error($"Error fetching proposals for user ID: {userId}", ex);
                throw;
            }
        }

        public async Task<IEnumerable<Proposal>> GetAllProposalsAsync()
        {
            try
            {
                _log.Info("Fetching all proposals from the database.");
                return await _context.Proposals
                    .Include(p => p.User)
                    .Include(p => p.InsurancePolicy)
                    .Include(p => p.ProposalAddOns)
                        .ThenInclude(pa => pa.AddOn)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _log.Error("Error fetching all proposals from the database.", ex);
                throw;
            }
        }

        public async Task<Proposal> AddProposalAsync(Proposal proposal)
        {
            try
            {
                _log.Info("Adding proposal to the database.");
                _context.Proposals.Add(proposal);
                await _context.SaveChangesAsync();
                return proposal;
            }
            catch (Exception ex)
            {
                _log.Error("Error adding proposal to the database.", ex);
                throw;
            }
        }

        public async Task<Proposal> UpdateProposalAsync(Proposal proposal)
        {
            try
            {
                _log.Info("Updating proposal in the database.");
                _context.Proposals.Update(proposal);
                await _context.SaveChangesAsync();
                return proposal;
            }
            catch (Exception ex)
            {
                _log.Error("Error updating proposal in the database.", ex);
                throw;
            }
        }
    }
}