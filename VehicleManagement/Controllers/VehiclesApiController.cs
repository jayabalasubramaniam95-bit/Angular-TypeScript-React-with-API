using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using VehicleManagement.Services;
using VehicleManagement.ViewModels;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/vehicles")]
public class VehiclesApiController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public VehiclesApiController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    [HttpPost]
    public ActionResult Create([FromBody] CreateVehicleRequest request)
    {
        var model = new VehicleFormViewModel
        {
            OwnerName = request.OwnerName.Trim(),
            ManufacturerId = request.ManufacturerId,
            YearOfManufacture = request.YearOfManufacture,
            Weight = request.WeightKg
        };

        try
        {
            var result = _vehicleService.Create(model);

            if (!result.Success)
            {
                return BadRequest(new
                {
                    message = result.ErrorMessage
                });
            }

            return Ok(new
            {
                message = "Vehicle created successfully."
            });
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "The operation could not be completed. Please try again."
            });
        }
    }

        [HttpGet]
    public ActionResult GetVehicles(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] string sortColumn = "owner",
        [FromQuery] string sortDirection = "asc")
    {
        var vehicles = _vehicleService.GetVehicles(
            search,
            page,
            10,
            sortColumn,
            sortDirection);

        return Ok(vehicles);
    }
}

public class CreateVehicleRequest
{
    [Required]
    [StringLength(100)]
    public string OwnerName { get; set; } = string.Empty;

    [Required]
    [Range(1, int.MaxValue)]
    public int? ManufacturerId { get; set; }

    [Required]
    [Range(1886, 2100)]
    public int? YearOfManufacture { get; set; }

    [Required]
    [Range(typeof(decimal), "0.01",
        "79228162514264337593543950335")]
    public decimal? WeightKg { get; set; }
}