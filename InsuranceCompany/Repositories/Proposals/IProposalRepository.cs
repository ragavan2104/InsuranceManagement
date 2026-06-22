using InsuranceCompany.Models.Proposals;
namespace InsuranceCompany.Repositories.Proposals
{
    public interface IProposalRepository
    {
        Task<Proposal?> GetProposalByIdAsync(int id);
        Task<IEnumerable<Proposal>> GetProposalsByUserIdAsync(int UserId);
        Task<IEnumerable<Proposal>> GetAllProposalsAsync();
        Task<Proposal> AddProposalAsync(Proposal proposal);
        Task<Proposal> UpdateProposalAsync(Proposal proposal);
    }
}
