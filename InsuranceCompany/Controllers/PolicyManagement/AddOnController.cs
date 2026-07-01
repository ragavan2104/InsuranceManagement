using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using InsuranceCompany.DTOs.PolicyManagement;
using InsuranceCompany.Services.PolicyManagement;
using log4net;

namespace InsuranceCompany.Controllers.PolicyManagement
{
    [Route("api/[controller]")]
    [ApiController]
    public class AddOnController : ControllerBase
    {
        private readonly IAddOnService _addOnService;
        private static readonly ILog _log = LogManager.GetLogger(typeof(AddOnController));

        public AddOnController(IAddOnService addOnService)
        {
            _addOnService = addOnService;
        }

        [HttpGet]
        public async Task<IActionResult> AllAddOn()
        {
            try
            {
                _log.Info("Received GET request for all active Add-Ons.");
                var addOns = await _addOnService.GetAllActiveAddOnsAsync();
                if (addOns == null || !addOns.Any())
                {
                    _log.Warn("No active Add-Ons found.");
                    return NotFound(new
                    {
                        StatusCode = StatusCodes.Status404NotFound,
                        Message = "No active Add-Ons found."
                    });
                }
                return Ok(addOns);
            }
            catch (Exception ex)
            {
                _log.Error("Error handling GET request for all Add-Ons.", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAddOnById(int id)
        {
            try
            {
                _log.Info($"Received GET request for Add-On ID: {id}");
                var addOn = await _addOnService.GetAddOnByIdAsync(id);
                if (addOn == null)
                {
                    _log.Warn($"Add-On with ID {id} was not found.");
                    return NotFound(new
                    {
                        StatusCode = StatusCodes.Status404NotFound,
                        Message = $"Add-On with ID {id} not found."
                    });
                }
                return Ok(addOn);
            }
            catch (Exception ex)
            {
                _log.Error($"Error handling GET request for Add-On ID: {id}.", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
            }
        }

        [HttpPost("AddAddOn")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAddOn([FromBody] AddOnCreateDto dto)
        {
            try
            {
                if (dto == null)
                {
                    _log.Warn("Null body submitted for Add-On creation.");
                    return BadRequest("Request body cannot be null.");
                }

                _log.Info($"Received POST request to create a new Add-On: '{dto.AddOnName}'");
                if (!ModelState.IsValid)
                {
                    _log.Warn("Invalid model state submitted for Add-On creation.");
                    return BadRequest(ModelState);
                }

                var createdAddOn = await _addOnService.CreateAddOnAsync(dto);
                _log.Info($"Successfully created Add-On with ID: {createdAddOn.AddOnId}");

                return CreatedAtAction(nameof(GetAddOnById), new { id = createdAddOn.AddOnId }, createdAddOn);
            }
            catch (Exception ex)
            {
                _log.Error("Error handling POST request for Add-On creation.", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
            }
        }

        [HttpPut("UpdateAddOn/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAddOn(int id, [FromBody] AddOnUpdateDto dto)
        {
            try
            {
                if (dto == null)
                {
                    _log.Warn("Null body submitted for Add-On update.");
                    return BadRequest("Request body cannot be null.");
                }

                _log.Info($"Received PUT request to update Add-On ID: {id}");
                if (!ModelState.IsValid)
                {
                    _log.Warn("Invalid model state submitted for Add-On update.");
                    return BadRequest(ModelState);
                }

                var updated = await _addOnService.UpdateAddOnAsync(id, dto);
                if (!updated)
                {
                    _log.Warn($"Add-On with ID {id} does not exist.");
                    return NotFound(new
                    {
                        StatusCode = StatusCodes.Status404NotFound,
                        Message = "Add-On ID not found."
                    });
                }

                _log.Info($"Successfully updated records for Add-On ID: {id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                _log.Error($"Error handling PUT request for Add-On ID: {id}.", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
            }
        }
    }
}
