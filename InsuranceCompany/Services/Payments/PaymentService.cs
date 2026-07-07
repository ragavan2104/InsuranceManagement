using InsuranceCompany.Models.Operations;
using InsuranceCompany.DTOs.Payments;
using InsuranceCompany.Repositories.Proposals;
using InsuranceCompany.Repositories.Payments;
using log4net; 

namespace InsuranceCompany.Services.Payments
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IProposalRepository _proposalRepository;
        private static readonly ILog _log = LogManager.GetLogger(typeof(PaymentService));

        public PaymentService(IPaymentRepository paymentRepository, IProposalRepository proposalRepository)
        {
            _paymentRepository = paymentRepository;
            _proposalRepository = proposalRepository;
        }

        public async Task<PolicyReciptDto> ProcessPaymentAsync(int userId, PaymentProcessDto dto)
        {
            try
            {
                _log.Info($"Initiating payment processing for UserId: {userId}, ProposalId: {dto.ProposalId}");

                var proposal = await _proposalRepository.GetProposalByIdAsync(dto.ProposalId);
                if (proposal == null)
                {
                    _log.Warn($"Payment failed");
                    throw new Exception("Proposal not found");
                }

                if (proposal.UserId != userId)
                {
                    _log.Warn("Unauthorized payment ");
                    throw new Exception("Unauthorized");
                }

                decimal totalPremiumdue = proposal.InsurancePolicy?.BasePremium ?? 0;

                var paymententity = new Payment
                {
                    ProposalId = dto.ProposalId,
                    AmountPaid = totalPremiumdue,
                    PaymentMethod = dto.PaymentMethod,
                    TransactionId = dto.TransactionId,
                    PaymentStatus = "Success",
                    PaidAt = DateTime.UtcNow
                };

                var completedPayment = await _paymentRepository.AddPaymentAsync(paymententity);
                _log.Info($"Payment registered successfully. PaymentId: {completedPayment.PaymentId}, TransactionId: {dto.TransactionId}");

                proposal.Status = "PolicyIssued";
                proposal.UpdatedAt = DateTime.UtcNow;
                await _proposalRepository.UpdateProposalAsync(proposal);
                DateTime startDate = DateTime.UtcNow;
                int CoverageMonths = proposal.InsurancePolicy?.PolicyDurationMonths ?? 12;
                DateTime EndDate = startDate.AddMonths(CoverageMonths);
                string generatedPolicyNumber = $"POL-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

                var certificateEntity = new IssuedPolicy
                {
                    ProposalId = proposal.ProposalId,
                    UserId = proposal.UserId,
                    PolicyId = proposal.PolicyId,
                    PolicyNumber = generatedPolicyNumber,
                    StartDate = startDate,
                    EndDate = EndDate,
                    Status = "Active",
                    IssuedAt = DateTime.UtcNow
                };

                await _paymentRepository.SaveIssuedPolicyAsync(certificateEntity);
                _log.Info($"Policy generation successful. Policy Number: {generatedPolicyNumber} issued for ProposalId: {proposal.ProposalId}");

                return new PolicyReciptDto
                {
                    PaymentId = completedPayment.PaymentId,
                    ProposalId = proposal.ProposalId,
                    AmountPaid = completedPayment.AmountPaid,
                    TransactionId = completedPayment.TransactionId ?? "",
                    PaymentStatus = completedPayment.PaymentStatus,
                    PaidAt = completedPayment.PaidAt ?? DateTime.UtcNow,
                    PolicyNumber = certificateEntity.PolicyNumber,
                    EffectiveDate = certificateEntity.StartDate,
                    ExpiryDate = certificateEntity.EndDate,
                    ActiveStatus = certificateEntity.Status
                };
            }
            catch (Exception ex) when (ex.Message == "Proposal not found" || ex.Message == "Unauthorized")
            {
                _log.Warn($"Payment Verification Failed",ex);
                throw;
            }
            catch (Exception ex)
            {
                _log.Error($"Unexpected error accoured {ex.Message}");
                throw;
            }
        }
    }
}