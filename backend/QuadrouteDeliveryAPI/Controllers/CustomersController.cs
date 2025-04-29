// Controllers/CustomersController.cs
using Microsoft.AspNetCore.Mvc;
using QuadrouteDeliveryAPI.Data;
using NetTopologySuite.Geometries;

namespace QuadrouteDeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetCustomers()
    {
        var customers = _context.Customers.ToList();
        return Ok(customers);
    }

    [HttpGet("{id}")]
    public IActionResult GetCustomerById(string id)
    {
        var customer = _context.Customers.FirstOrDefault(c => c.CustomerId == id);
        if (customer == null)
        {
            return NotFound();
        }
        return Ok(customer);
    }

    [HttpPost]
    public IActionResult CreateCustomer([FromBody] Customer customer)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (customer.Location != null)
        {
            customer.Location.SRID = 4326;
        }

        _context.Customers.Add(customer);
        _context.SaveChanges();

        return CreatedAtAction(nameof(GetCustomerById), new { id = customer.CustomerId }, customer);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateCustomer(string id, [FromBody] Customer updatedCustomer)
    {
        if (id != updatedCustomer.CustomerId)
        {
            return BadRequest("Customer ID mismatch");
        }

        var existingCustomer = _context.Customers.FirstOrDefault(c => c.CustomerId == id);
        if (existingCustomer == null)
        {
            return NotFound();
        }

        existingCustomer.Name = updatedCustomer.Name;
        existingCustomer.AddressLine1 = updatedCustomer.AddressLine1;
        existingCustomer.AddressLine2 = updatedCustomer.AddressLine2;
        existingCustomer.City = updatedCustomer.City;
        existingCustomer.PostalCode = updatedCustomer.PostalCode;
        existingCustomer.PhoneNumber = updatedCustomer.PhoneNumber;
        existingCustomer.Email = updatedCustomer.Email;
        if (updatedCustomer.Location != null)
        {
            existingCustomer.Location = updatedCustomer.Location;
            existingCustomer.Location.SRID = 4326;
        }

        _context.SaveChanges();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteCustomer(string id)
    {
        var customer = _context.Customers.FirstOrDefault(c => c.CustomerId == id);
        if (customer == null)
        {
            return NotFound();
        }

        _context.Customers.Remove(customer);
        _context.SaveChanges();

        return NoContent();
    }
}