using InsuranceCompany.Controllers.Operations;
using InsuranceCompany.Dtos.Claims;
using InsuranceCompany.Models.Operations;
using InsuranceCompany.Repositories.Claims;
using InsuranceCompany.Services.Claims;
using InsuranceCompany.Services.Communications;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Timers;
using NUnit.Framework;
using Assert = NUnit.Framework.Legacy.ClassicAssert;
using Claim = InsuranceCompany.Models.Operations.Claim;

namespace InsuranceCompany.Tests.Claims
{
    [TestFixture]
    public class ClaimServiceTests
    {
        private Mock<IClaimRepository> _mockClaimRepository = null!;
        private Mock<IEmailService> _mockEmailService = null!;
        private ClaimService _claimService = null!;

        [SetUp]
        public void Setup()
        {
            _mockClaimRepository = new Mock<IClaimRepository>();
            _mockEmailService = new Mock<IEmailService>();
            _claimService = new ClaimService(_mockClaimRepository.Object, _mockEmailService.Object);
        }

        #region FileClaimAsync Tests

        [Test]
        public async Task FileClaimAsync_ShouldReturnCreatedClaim_WhenSuccessfullyFiled()
        {
            int userId = 1;
            var dto = new ClaimFileDto
            {
                IssuedPolicyId = 10,
                EstimatedLossAmount = 5000.00m,
                IncidentDescription = "Water damage due to leak.",
                IncidentDate = DateTime.UtcNow.AddDays(-2)
            };

            var mockPolicy = new IssuedPolicy
            {
                IssuedPolicyId = dto.IssuedPolicyId,
                Proposal = new InsuranceCompany.Models.Proposals.Proposal
                {
                    UserId = userId
                }
            };

            var expectedClaim = new Claim
            {
                ClaimId = 101,
                IssuedPolicyId = dto.IssuedPolicyId,
                EstimatedLossAmount = dto.EstimatedLossAmount,
                IncidentDescription = dto.IncidentDescription,
                IncidentDate = dto.IncidentDate,
                Status = "ClaimFiled",
                FiledAt = DateTime.UtcNow
            };

            _mockClaimRepository
                .Setup(r => r.GetIssuedPolicyByIdAsync(dto.IssuedPolicyId))
                .ReturnsAsync(mockPolicy);

            _mockClaimRepository
                .Setup(r => r.AddClaimAsync(It.IsAny<Claim>()))
                .ReturnsAsync(expectedClaim);

            var result = await _claimService.FileClaimAsync(userId, dto);

            Assert.NotNull(result);
            Assert.AreEqual(expectedClaim.ClaimId, result.ClaimId);
            Assert.AreEqual(expectedClaim.IssuedPolicyId, result.IssuedPolicyId);
            Assert.AreEqual(expectedClaim.Status, result.Status);
            _mockClaimRepository.Verify(r => r.AddClaimAsync(It.Is<Claim>(c =>
                c.IssuedPolicyId == dto.IssuedPolicyId &&
                c.EstimatedLossAmount == dto.EstimatedLossAmount
            )), Times.Once);
        }

        [Test]
        public void FileClaimAsync_ShouldThrowException_WhenRepositoryFails()
        {
            int userId = 1;
            var dto = new ClaimFileDto { IssuedPolicyId = 10 };
            var mockPolicy = new IssuedPolicy
            {
                IssuedPolicyId = dto.IssuedPolicyId,
                Proposal = new InsuranceCompany.Models.Proposals.Proposal
                {
                    UserId = userId
                }
            };

            _mockClaimRepository
                .Setup(r => r.GetIssuedPolicyByIdAsync(dto.IssuedPolicyId))
                .ReturnsAsync(mockPolicy);

            _mockClaimRepository
                .Setup(r => r.AddClaimAsync(It.IsAny<Claim>()))
                .ThrowsAsync(new Exception("Database error"));

            Assert.ThrowsAsync<Exception>(() => _claimService.FileClaimAsync(userId, dto));
        }

        [Test]
        public void FileClaimAsync_ShouldThrowKeyNotFoundException_WhenPolicyDoesNotExist()
        {
            int userId = 1;
            var dto = new ClaimFileDto { IssuedPolicyId = 99 };
            _mockClaimRepository
                .Setup(r => r.GetIssuedPolicyByIdAsync(dto.IssuedPolicyId))
                .ReturnsAsync((IssuedPolicy?)null);

            Assert.ThrowsAsync<KeyNotFoundException>(() => _claimService.FileClaimAsync(userId, dto));
        }

        [Test]
        public void FileClaimAsync_ShouldThrowUnauthorizedAccessException_WhenPolicyDoesNotBelongToUser()
        {
            int userId = 1;
            var dto = new ClaimFileDto { IssuedPolicyId = 10 };
            var mockPolicy = new IssuedPolicy
            {
                IssuedPolicyId = dto.IssuedPolicyId,
                Proposal = new InsuranceCompany.Models.Proposals.Proposal
                {
                    UserId = 2 // Different user
                }
            };

            _mockClaimRepository
                .Setup(r => r.GetIssuedPolicyByIdAsync(dto.IssuedPolicyId))
                .ReturnsAsync(mockPolicy);

            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _claimService.FileClaimAsync(userId, dto));
        }

        #endregion

        #region ReviewClaimAsync Tests

        [Test]
        public async Task ReviewClaimAsync_ShouldReturnFalse_WhenClaimDoesNotExist()
        {
            int claimId = 999;
            int officerId = 5;
            var dto = new ClaimReviewDto { Status = "Approved", ApprovedSettlementAmount = 4000.00m, OfficerRemarks = "Looks good" };

            _mockClaimRepository
                .Setup(r => r.GetClaimByIdAsync(claimId))
                .ReturnsAsync((Claim?)null);

            var result = await _claimService.ReviewClaimAsync(claimId, officerId, dto);

            Assert.IsFalse(result);
            _mockClaimRepository.Verify(r => r.UpdateClaimAsync(It.IsAny<Claim>()), Times.Never);
        }

        [TestCase("Approved")]
        [TestCase("Rejected")]
        public void ReviewClaimAsync_ShouldThrowInvalidOperationException_WhenClaimIsAlreadyFinalized(string existingStatus)
        {
            int claimId = 101;
            int officerId = 5;
            var dto = new ClaimReviewDto { Status = "Approved" };
            var existingClaim = new Claim { ClaimId = claimId, Status = existingStatus };

            _mockClaimRepository
                .Setup(r => r.GetClaimByIdAsync(claimId))
                .ReturnsAsync(existingClaim);

            var exception = Assert.ThrowsAsync<InvalidOperationException>(() =>
                _claimService.ReviewClaimAsync(claimId, officerId, dto)
            );
            Assert.AreEqual("This claim has already been finalized.", exception.Message);
            _mockClaimRepository.Verify(r => r.UpdateClaimAsync(It.IsAny<Claim>()), Times.Never);
        }

        [Test]
        public async Task ReviewClaimAsync_ShouldUpdateStatusAndReturnTrue_WhenApprovedSuccessfully()
        {
            int claimId = 101;
            int officerId = 5;
            var dto = new ClaimReviewDto
            {
                Status = "Approved",
                ApprovedSettlementAmount = 3500.00m,
                OfficerRemarks = "Approved after reviewing receipts."
            };
            var existingClaim = new Claim { ClaimId = claimId, Status = "ClaimFiled" };

            _mockClaimRepository
                .Setup(r => r.GetClaimByIdAsync(claimId))
                .ReturnsAsync(existingClaim);

            _mockClaimRepository
                .Setup(r => r.UpdateClaimAsync(It.IsAny<Claim>()))
                .Returns(Task.CompletedTask);

            var result = await _claimService.ReviewClaimAsync(claimId, officerId, dto);

            Assert.IsTrue(result);
            Assert.AreEqual("Approved", existingClaim.Status);
            Assert.AreEqual(dto.ApprovedSettlementAmount, existingClaim.ApprovedSettlementAmount);
            Assert.AreEqual(dto.OfficerRemarks, existingClaim.OfficerRemarks);
            Assert.AreEqual(officerId, existingClaim.ReviewedByOfficerId);
            Assert.NotNull(existingClaim.UpdatedAt);
            _mockClaimRepository.Verify(r => r.UpdateClaimAsync(existingClaim), Times.Once);
        }

        [Test]
        public async Task ReviewClaimAsync_ShouldSetSettlementToZeroAndReturnTrue_WhenRejectedSuccessfully()
        {
            int claimId = 101;
            int officerId = 5;
            var dto = new ClaimReviewDto
            {
                Status = "Rejected",
                ApprovedSettlementAmount = 3500.00m,
                OfficerRemarks = "Not covered by policy terms."
            };
            var existingClaim = new Claim { ClaimId = claimId, Status = "ClaimFiled" };

            _mockClaimRepository
                .Setup(r => r.GetClaimByIdAsync(claimId))
                .ReturnsAsync(existingClaim);

            _mockClaimRepository
                .Setup(r => r.UpdateClaimAsync(It.IsAny<Claim>()))
                .Returns(Task.CompletedTask);

            var result = await _claimService.ReviewClaimAsync(claimId, officerId, dto);

            Assert.IsTrue(result);
            Assert.AreEqual("Rejected", existingClaim.Status);
            Assert.AreEqual(0, existingClaim.ApprovedSettlementAmount);
            Assert.AreEqual(dto.OfficerRemarks, existingClaim.OfficerRemarks);
            Assert.AreEqual(officerId, existingClaim.ReviewedByOfficerId);
            _mockClaimRepository.Verify(r => r.UpdateClaimAsync(existingClaim), Times.Once);
        }

        #endregion

        #region GetCustomerClaimsHistoryAsync Tests

        [Test]
        public async Task GetCustomerClaimsHistoryAsync_ShouldReturnClaimsList()
        {
            int userId = 1;
            var expectedClaims = new List<Claim>
            {
                new Claim { ClaimId = 1, IssuedPolicyId = 10, Status = "Approved" },
                new Claim { ClaimId = 2, IssuedPolicyId = 10, Status = "ClaimFiled" }
            };

            _mockClaimRepository
                .Setup(r => r.GetClaimsByUserIdAsync(userId))
                .ReturnsAsync(expectedClaims);

            var result = await _claimService.GetCustomerClaimsHistoryAsync(userId);

            Assert.NotNull(result);
            Assert.AreEqual(2, result.Count());
            Assert.AreEqual(expectedClaims, result);
        }

        #endregion

        #region GetPendingClaimsQueueAsync Tests

        [Test]
        public async Task GetPendingClaimsQueueAsync_ShouldReturnPendingClaims()
        {
            var expectedClaims = new List<Claim>
            {
                new Claim { ClaimId = 1, Status = "ClaimFiled" },
                new Claim { ClaimId = 2, Status = "UnderEvaluation" }
            };

            _mockClaimRepository
                .Setup(r => r.GetAllPendingClaimsAsync())
                .ReturnsAsync(expectedClaims);

            var result = await _claimService.GetPendingClaimsQueueAsync();

            Assert.NotNull(result);
            Assert.AreEqual(2, result.Count());
            Assert.AreEqual(expectedClaims, result);
        }

        #endregion

        #region TrackClaimStatusAsync Tests

        [Test]
        public async Task TrackClaimStatusAsync_ShouldReturnNull_WhenClaimDoesNotExist()
        {
            int claimId = 999;
            int userId = 1;
            _mockClaimRepository
                .Setup(r => r.GetClaimByIdAsync(claimId))
                .ReturnsAsync((Claim?)null);

            var result = await _claimService.TrackClaimStatusAsync(claimId, userId, false);

            Assert.IsNull(result);
        }

        [Test]
        public async Task TrackClaimStatusAsync_ShouldReturnClaimDirectly_WhenBypassOwnershipCheckIsTrue()
        {
            int claimId = 101;
            int userId = 999;
            var claim = new Claim { ClaimId = claimId, IssuedPolicyId = 5 };

            _mockClaimRepository
                .Setup(r => r.GetClaimByIdAsync(claimId))
                .ReturnsAsync(claim);

            var result = await _claimService.TrackClaimStatusAsync(claimId, userId, true);

            Assert.NotNull(result);
            Assert.AreEqual(claim, result);
            _mockClaimRepository.Verify(r => r.GetClaimsByUserIdAsync(It.IsAny<int>()), Times.Never);
        }

        [Test]
        public async Task TrackClaimStatusAsync_ShouldReturnClaim_WhenBypassIsFalseAndClaimBelongsToUser()
        {
            int claimId = 101;
            int userId = 1;
            var claim = new Claim { ClaimId = claimId, IssuedPolicyId = 5 };
            var userClaimsList = new List<Claim> { claim };

            _mockClaimRepository
                .Setup(r => r.GetClaimByIdAsync(claimId))
                .ReturnsAsync(claim);

            _mockClaimRepository
                .Setup(r => r.GetClaimsByUserIdAsync(userId))
                .ReturnsAsync(userClaimsList);

            var result = await _claimService.TrackClaimStatusAsync(claimId, userId, false);

            Assert.NotNull(result);
            Assert.AreEqual(claim, result);
        }

        [Test]
        public void TrackClaimStatusAsync_ShouldThrowUnauthorizedAccessException_WhenBypassIsFalseAndClaimDoesNotBelongToUser()
        {
            int claimId = 101;
            int userId = 1;
            var claim = new Claim { ClaimId = claimId, IssuedPolicyId = 5 };
            var differentClaim = new Claim { ClaimId = 102, IssuedPolicyId = 5 };
            var userClaimsList = new List<Claim> { differentClaim };

            _mockClaimRepository
                .Setup(r => r.GetClaimByIdAsync(claimId))
                .ReturnsAsync(claim);

            _mockClaimRepository
                .Setup(r => r.GetClaimsByUserIdAsync(userId))
                .ReturnsAsync(userClaimsList);

            var exception = Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _claimService.TrackClaimStatusAsync(claimId, userId, false)
            );
            Assert.AreEqual("Not your claim!", exception.Message);
        }

        #endregion
    }
}
    