// Controllers/VehiclesController.cs
using Microsoft.AspNetCore.Mvc;
using QuadrouteDeliveryAPI.Data;
using NetTopologySuite.Geometries;

namespace QuadrouteDeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly AppDbContext _context;

    public VehiclesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetVehicles()
    {
        var vehicles = _context.Vehicles.ToList();
        return Ok(vehicles);
    }

    [HttpGet("{id}")]
    public IActionResult GetVehicleById(string id)
    {
        var vehicle = _context.Vehicles.FirstOrDefault(v => v.VehicleId == id);
        if (vehicle == null)
        {
            return NotFound();
        }
        return Ok(vehicle);
    }

    [HttpPost]
    public IActionResult CreateVehicle([FromBody] Vehicle vehicle)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (vehicle.Location != null)
        {
            vehicle.Location.SRID = 4326;
        }

        _context.Vehicles.Add(vehicle);
        _context.SaveChanges();

        return CreatedAtAction(nameof(GetVehicleById), new { id = vehicle.VehicleId }, vehicle);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateVehicle(string id, [FromBody] Vehicle updatedVehicle)
    {
        if (id != updatedVehicle.VehicleId)
        {
            return BadRequest("Vehicle ID mismatch");
        }

        var existingVehicle = _context.Vehicles.FirstOrDefault(v => v.VehicleId == id);
        if (existingVehicle == null)
        {
            return NotFound();
        }

        existingVehicle.DriverName = updatedVehicle.DriverName;
        existingVehicle.ContactNumber = updatedVehicle.ContactNumber;
        existingVehicle.CapacityLiters = updatedVehicle.CapacityLiters;
        existingVehicle.AvailabilityStartTime = updatedVehicle.AvailabilityStartTime;
        existingVehicle.AvailabilityEndTime = updatedVehicle.AvailabilityEndTime;
        if (updatedVehicle.Location != null)
        {
            existingVehicle.Location = updatedVehicle.Location;
            existingVehicle.Location.SRID = 4326;
        }

        _context.SaveChanges();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteVehicle(string id)
    {
        var vehicle = _context.Vehicles.FirstOrDefault(v => v.VehicleId == id);
        if (vehicle == null)
        {
            return NotFound();
        }

        _context.Vehicles.Remove(vehicle);
        _context.SaveChanges();

        return NoContent();
    }
    [HttpGet("available")]
    public IActionResult GetAvailableVehicles([FromQuery] string startTime, [FromQuery] string endTime)
    {
        if (!TimeSpan.TryParse(startTime, out var start) || !TimeSpan.TryParse(endTime, out var end))
        {
            return BadRequest("Invalid time format. Use HH:mm:ss (e.g., 08:00:00).");
        }

        var availableVehicles = _context.Vehicles
            .Where(v => v.AvailabilityStartTime <= start && v.AvailabilityEndTime >= end)
            .ToList();

        return Ok(availableVehicles);
    }
}