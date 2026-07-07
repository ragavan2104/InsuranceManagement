using InsuranceCompany.DTOs.Proposals;

namespace InsuranceCompany.Services.Proposals
{
    public interface IProposalService
    {
        Task<ProposalResponseDto?> CreateProposalAsync(int userId,ProposalCreateDto dto);
        Task<ProposalResponseDto?> GetProposalByIdAsync(int id);
        Task<IEnumerable<ProposalResponseDto>> GetCustomerProposalsHistoryAsync(int userId);
        Task<bool> ReviewProposalAsync(int proposalId, int officerId, ProposalReviewDto dto);
        Task<IEnumerable<ProposalResponseDto>> GetPendingProposalsAsync();
        Task<IEnumerable<ProposalResponseDto>> GetAllProposalsHistoryAsync();
    }
}
