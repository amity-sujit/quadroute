// Controllers/CustomersController.cs
using Microsoft.AspNetCore.Mvc;
using QuadrouteDeliveryAPI.Data;
using NetTopologySuite.Geometries;
using QuadrouteDeliveryAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace QuadrouteDeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly Guid _fixedTenantId = Guid.Parse("6fb59d40-20f1-4545-a418-831ecd24484e");

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
    [HttpGet("/verify/1")]
    public IActionResult GetCustomersverify()
    {
        var ordertype = new List<OrderType>();
        ordertype.Add( new OrderType(){OrderTypeId="5",Type="Geer"});
        ordertype.AddRange(_context.OrderTypes.ToList());
        return Ok(ordertype);
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
    
    // [HttpGet("/api/tenants/{tenantId}/customers/")]
    // public IActionResult GetEndCustomers()
    // {
    //     var customers = _context.EndCustomers.ToList();
    //     return Ok(customers);
    // }
    [HttpGet("/api/tenants/{tenantId}/customers")]
    public IActionResult SearchEndCustomers([FromRoute]string tenantId,[FromQuery] string phone,[FromQuery] string name="")
    {
        var customers = _context.EndCustomers.ToList();
        if(string.IsNullOrEmpty(phone) && string.IsNullOrEmpty(name))
        {
           return Ok(customers);
        }
        
        // Console.Write("phone number is : ");
        // Console.WriteLine(phone);
        // Console.WriteLine(customers.Count);

        customers = new List<EndCustomer>(){customers.FirstOrDefault(x=>x.Phone==phone && !string.IsNullOrWhiteSpace(phone) && phone.Length==10)??new EndCustomer()};
        return Ok(customers);
    }
    [HttpGet("/api/tenants")]
    public IActionResult SearchTenants(string tenantId,[FromQuery] string name="")
    {
        // var customers = _context.Tenants.ToList();
       var      tenants= _context.Tenants.Where(x=>x.Name.Contains(name) & !string.IsNullOrWhiteSpace(name)).ToList();
        return Ok(tenants);
    }
    
    // GET: api/tenants/{tenantId}/customers/{customerId}
    [HttpGet("/api/tenants/{tenantId}/customers/{customerId}")]
    public async Task<ActionResult<EndCustomer>> GetCustomer(string customerId,string tenantId = "6fb59d40-20f1-4545-a418-831ecd24484e")
    {
        if (!Guid.TryParse(tenantId, out var tenantGuid) || !Guid.TryParse(customerId, out var customerGuid))
            return BadRequest("Invalid ID format");

        var customer = await _context.EndCustomers
            .Where(c => c.TenantId == tenantGuid && c.CustomerId == customerGuid)
            .FirstOrDefaultAsync();

        if (customer == null)
            return NotFound();

        return Ok(customer);
    }

    // PATCH: api/tenants/{tenantId}/customers/{customerId}
    [HttpPatch("/api/tenants/{tenantId}/customers/{customerId}")]
    public async Task<IActionResult> UpdateLocation(string customerId, [FromBody] UpdateLocationDto dto,string tenantId = "6fb59d40-20f1-4545-a418-831ecd24484e")
    {
        if (!Guid.TryParse(tenantId, out var tenantGuid) || !Guid.TryParse(customerId, out var customerGuid))
            return BadRequest("Invalid ID format");

        var customer = await _context.EndCustomers
            .Where(c => c.TenantId == tenantGuid && c.CustomerId == customerGuid)
            .FirstOrDefaultAsync();

        if (customer == null)
            return NotFound();

        customer.Latitude = dto.Latitude;
        customer.Longitude = dto.Longitude;
        customer.IsVerified = dto.IsVerified;
        customer.Address = dto.Address; // Optional, for manual address updates

        await _context.SaveChangesAsync();
        return Ok();
    }
}

    public class UpdateLocationDto
    {
        public float? Latitude { get; set; }
        public float? Longitude { get; set; }
        public bool IsVerified { get; set; }
        public string Address { get; set; }
    }
