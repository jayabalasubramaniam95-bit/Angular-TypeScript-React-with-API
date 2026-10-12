
using Microsoft.AspNetCore.Mvc;
using VehicleManagement.Services;

namespace VehicleManagement.Controllers;

[ApiController]
[Route("api/manufacturers")]
public class ManufacturersApiController : ControllerBase
{
    private readonly IManufacturerService _manufacturerService;

    public ManufacturersApiController(
        IManufacturerService manufacturerService)
    {
        _manufacturerService = manufacturerService;
    }

    [HttpGet]
    public ActionResult Get()
    {
        var manufacturers =
            _manufacturerService.GetActiveManufacturers();

        return Ok(manufacturers);
    }
}
