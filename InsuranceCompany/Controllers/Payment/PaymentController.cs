using InsuranceCompany.DTOs.Payments;
using InsuranceCompany.Services.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace InsuranceCompany.Controllers.Payments
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] 
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("checkout")]
        [Authorize(Roles = "User")] 
        public async Task<IActionResult> ProcessCheckout([FromBody] PaymentProcessDto dto)
        {
            if (dto == null) return BadRequest("Invalid checkout payload structure.");

            try
            {
               
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized("UnAuthorized Access");
                }

                int userId = int.Parse(userIdClaim);

                var receipt = await _paymentService.ProcessPaymentAsync(userId, dto);

                return Ok(receipt);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An internal transaction error occurred while executing the premium payment routine.");
            }
        }
    }
}