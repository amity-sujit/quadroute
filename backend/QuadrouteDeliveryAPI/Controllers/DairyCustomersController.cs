using DairyDistribution.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace DairyDistribution.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DairyCustomersController : ControllerBase
    {
        private readonly DairyDbContext _context;

        public DairyCustomersController(DairyDbContext context)
        {
            _context = context;
        }

        // POST: api/dairycustomers
        [HttpPost]
        public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerDto customerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var customer = new Customer
            {
                CustomerName = customerDto.CustomerName,
                BillingName = customerDto.BillingName,
                PhoneNumber = customerDto.PhoneNumber,
                CreatedAt = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCustomer), new { id = customer.CustomerId }, customer);
        }

        // GET: api/dairycustomers/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound();

            return Ok(customer);
        }

        // POST: api/dairycustomers/{customerId}/addresses
        [HttpPost("{customerId}/addresses")]
        public async Task<IActionResult> AddCustomerAddress(int customerId, [FromBody] CreateAddressDto addressDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null)
                return NotFound("Customer not found");

            var address = new Address
            {
                FullName = addressDto.FullName,
                MobileNumber = addressDto.MobileNumber,
                Pincode = addressDto.Pincode,
                FlatHouse = addressDto.FlatHouse,
                AreaStreet = addressDto.AreaStreet,
                Landmark = addressDto.Landmark,
                TownCity = addressDto.TownCity,
                State = addressDto.State,
                Country = addressDto.Country,
                Latitude = addressDto.Latitude,
                Longitude = addressDto.Longitude,
                DeliveryInstructions = addressDto.DeliveryInstructions,
                CreatedAt = DateTime.UtcNow
            };

            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();

            var customerAddress = new CustomerAddress
            {
                CustomerId = customerId,
                AddressId = address.AddressId,
                TimeSlotId = addressDto.TimeSlotId,
                IsDefault = addressDto.IsDefault,
                CreatedAt = DateTime.UtcNow
            };

            _context.CustomerAddresses.Add(customerAddress);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCustomerAddress), new { customerId, addressId = address.AddressId }, address);
        }

        // GET: api/dairycustomers/{customerId}/addresses/{addressId}
        [HttpGet("{customerId}/addresses/{addressId}")]
        public async Task<IActionResult> GetCustomerAddress(int customerId, int addressId)
        {
            var customerAddress = await _context.CustomerAddresses
                .Include(ca => ca.Address)
                .FirstOrDefaultAsync(ca => ca.CustomerId == customerId && ca.AddressId == addressId);

            if (customerAddress == null)
                return NotFound();

            return Ok(customerAddress);
        }

        // GET: api/dairycustomers/timeslots
        [HttpGet("timeslots")]
        public async Task<IActionResult> GetTimeSlots()
        {
            var timeSlots = await _context.TimeSlots.ToListAsync();
            return Ok(timeSlots);
        }
    }

    public class CreateCustomerDto
    {
        public string CustomerName { get; set; }
        public string BillingName { get; set; }
        public string PhoneNumber { get; set; }
    }

    public class CreateAddressDto
    {
        public string FullName { get; set; }
        public string MobileNumber { get; set; }
        public string Pincode { get; set; }
        public string FlatHouse { get; set; }
        public string AreaStreet { get; set; }
        public string? Landmark { get; set; }
        public string TownCity { get; set; }
        public string State { get; set; }
        public string Country { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? DeliveryInstructions { get; set; }
        public int TimeSlotId { get; set; }
        public bool IsDefault { get; set; }
    }
}