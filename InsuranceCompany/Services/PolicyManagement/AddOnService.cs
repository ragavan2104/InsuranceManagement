using InsuranceCompany.Models.PolicyManagement;
using InsuranceCompany.Repositories.PolicyManagement;
using InsuranceCompany.DTOs.PolicyManagement;
using log4net;

namespace InsuranceCompany.Services.PolicyManagement
{
    public class AddOnService : IAddOnService
    {
        private readonly IAddOnRepository _addOnRepository;
        private static readonly ILog _log = LogManager.GetLogger(typeof(AddOnService));

        public AddOnService(IAddOnRepository addOnRepository)
        {
            _addOnRepository = addOnRepository;
        }

        public async Task<IEnumerable<AddOnResponseDto>> GetAllActiveAddOnsAsync()
        {
            try
            {
                _log.Info("Fetching all active Add-Ons.");
                var addOns = await _addOnRepository.GetAllAddOnsAsync();
                
                return addOns.Where(a => a.IsActive).Select(a => new AddOnResponseDto
                {
                    AddOnId = a.AddOnId,
                    AddOnName = a.AddOnName,
                    Description = a.Description,
                    AdditionalCost = a.AdditionalCost,
                    IsActive = a.IsActive
                });
            }
            catch (Exception ex)
            {
                _log.Error("Error occurred in GetAllActiveAddOnsAsync.", ex);
                throw;
            }
        }

        public async Task<AddOnResponseDto?> GetAddOnByIdAsync(int id)
        {
            try
            {
                _log.Info($"Fetching details for Add-On ID: {id}");
                var addOn = await _addOnRepository.GetAddOnByIdAsync(id);
                if (addOn == null)
                {
                    _log.Warn($"Add-On with ID {id} not found.");
                    return null;
                }

                return new AddOnResponseDto
                {
                    AddOnId = addOn.AddOnId,
                    AddOnName = addOn.AddOnName,
                    Description = addOn.Description,
                    AdditionalCost = addOn.AdditionalCost,
                    IsActive = addOn.IsActive
                };
            }
            catch (Exception ex)
            {
                _log.Error($"Error occurred in GetAddOnByIdAsync for ID: {id}", ex);
                throw;
            }
        }

        public async Task<AddOnResponseDto> CreateAddOnAsync(AddOnCreateDto dto)
        {
            try
            {
                _log.Info($"Attempting to create a new Add-On: {dto.AddOnName}");
                var addOnEntity = new AddOn
                {
                    AddOnName = dto.AddOnName,
                    Description = dto.Description,
                    AdditionalCost = dto.AdditionalCost,
                    IsActive = true
                };

                var createdAddOn = await _addOnRepository.AddAddOnAsync(addOnEntity);
                _log.Info($"Successfully created Add-On '{createdAddOn.AddOnName}' with ID: {createdAddOn.AddOnId}");

                return new AddOnResponseDto
                {
                    AddOnId = createdAddOn.AddOnId,
                    AddOnName = createdAddOn.AddOnName,
                    Description = createdAddOn.Description,
                    AdditionalCost = createdAddOn.AdditionalCost,
                    IsActive = createdAddOn.IsActive
                };
            }
            catch (Exception ex)
            {
                _log.Error("Error occurred in CreateAddOnAsync.", ex);
                throw;
            }
        }

        public async Task<bool> UpdateAddOnAsync(int id, AddOnUpdateDto dto)
        {
            try
            {
                _log.Info($"Attempting to update Add-On ID: {id}");
                var existingAddOn = await _addOnRepository.GetAddOnByIdAsync(id);
                if (existingAddOn == null)
                {
                    _log.Warn($"Update failed because Add-On ID {id} does not exist.");
                    return false;
                }

                existingAddOn.AddOnName = dto.AddOnName;
                existingAddOn.Description = dto.Description;
                existingAddOn.AdditionalCost = dto.AdditionalCost;
                existingAddOn.IsActive = dto.IsActive;

                await _addOnRepository.UpdateAddOnAsync(existingAddOn);
                _log.Info($"Successfully updated records for Add-On ID: {id}");
                return true;
            }
            catch (Exception ex)
            {
                _log.Error($"Error updating details for Add-On ID: {id}", ex);
                throw;
            }
        }
    }
}
