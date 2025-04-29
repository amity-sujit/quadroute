// Controllers/StoresController.cs
using Microsoft.AspNetCore.Mvc;
using QuadrouteDeliveryAPI.Data;
using NetTopologySuite.Geometries;

namespace QuadrouteDeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StoresController : ControllerBase
{
    private readonly AppDbContext _context;

    public StoresController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetStores()
    {
        var stores = _context.Stores.ToList();
        return Ok(stores);
    }

    [HttpGet("{id}")]
    public IActionResult GetStoreById(string id)
    {
        var store = _context.Stores.FirstOrDefault(s => s.StoreId == id);
        if (store == null)
        {
            return NotFound();
        }
        return Ok(store);
    }

    [HttpPost]
    public IActionResult CreateStore([FromBody] Store store)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (store.Location != null)
        {
            store.Location.SRID = 4326;
        }

        _context.Stores.Add(store);
        _context.SaveChanges();

        return CreatedAtAction(nameof(GetStoreById), new { id = store.StoreId }, store);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateStore(string id, [FromBody] Store updatedStore)
    {
        if (id != updatedStore.StoreId)
        {
            return BadRequest("Store ID mismatch");
        }

        var existingStore = _context.Stores.FirstOrDefault(s => s.StoreId == id);
        if (existingStore == null)
        {
            return NotFound();
        }

        existingStore.Name = updatedStore.Name;
        existingStore.AddressLine1 = updatedStore.AddressLine1;
        existingStore.AddressLine2 = updatedStore.AddressLine2;
        existingStore.City = updatedStore.City;
        existingStore.PostalCode = updatedStore.PostalCode;
        existingStore.ContactNumber = updatedStore.ContactNumber;
        existingStore.DailyCapacityLiters = updatedStore.DailyCapacityLiters;
        if (updatedStore.Location != null)
        {
            existingStore.Location = updatedStore.Location;
            existingStore.Location.SRID = 4326;
        }

        _context.SaveChanges();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteStore(string id)
    {
        var store = _context.Stores.FirstOrDefault(s => s.StoreId == id);
        if (store == null)
        {
            return NotFound();
        }

        _context.Stores.Remove(store);
        _context.SaveChanges();

        return NoContent();
    }
}