// Controllers/OrdersController.cs
using Microsoft.AspNetCore.Mvc;
using QuadrouteDeliveryAPI.Data;

namespace QuadrouteDeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetOrders()
    {
        var orders = _context.Orders.ToList();
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public IActionResult GetOrderById(string id)
    {
        var order = _context.Orders.FirstOrDefault(o => o.OrderId == id);
        if (order == null)
        {
            return NotFound();
        }
        return Ok(order);
    }

    [HttpGet("customer/{customerId}")]
    public IActionResult GetOrdersByCustomerId(string customerId)
    {
        var customer = _context.Customers.FirstOrDefault(c => c.CustomerId == customerId);
        if (customer == null)
        {
            return NotFound("Customer not found");
        }

        var orders = _context.Orders
            .Where(o => o.CustomerId == customerId)
            .ToList();
        return Ok(orders);
    }

    [HttpPost]
    public IActionResult CreateOrder([FromBody] Order order)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var customer = _context.Customers.FirstOrDefault(c => c.CustomerId == order.CustomerId);
        if (customer == null)
        {
            return BadRequest("Invalid CustomerId: Customer does not exist.");
        }

        _context.Orders.Add(order);
        _context.SaveChanges();

        return CreatedAtAction(nameof(GetOrderById), new { id = order.OrderId }, order);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateOrder(string id, [FromBody] Order updatedOrder)
    {
        if (id != updatedOrder.OrderId)
        {
            return BadRequest("Order ID mismatch");
        }

        var existingOrder = _context.Orders.FirstOrDefault(o => o.OrderId == id);
        if (existingOrder == null)
        {
            return NotFound();
        }

        var customer = _context.Customers.FirstOrDefault(c => c.CustomerId == updatedOrder.CustomerId);
        if (customer == null)
        {
            return BadRequest("Invalid CustomerId: Customer does not exist.");
        }

        existingOrder.CustomerId = updatedOrder.CustomerId;
        existingOrder.MilkType = updatedOrder.MilkType;
        existingOrder.QuantityLiters = updatedOrder.QuantityLiters;
        existingOrder.DeliveryDate = updatedOrder.DeliveryDate;
        existingOrder.DeliveryTimeWindow = updatedOrder.DeliveryTimeWindow;
        existingOrder.Status = updatedOrder.Status;

        _context.SaveChanges();

        return NoContent();
    }
[HttpPost("{orderId}/assign-vehicle")]
public IActionResult AssignVehicleToOrder(string orderId, [FromBody] AssignVehicleRequest request)
{
    var order = _context.Orders.FirstOrDefault(o => o.OrderId == orderId);
    if (order == null)
    {
        return NotFound("Order not found");
    }

    var vehicle = _context.Vehicles.FirstOrDefault(v => v.VehicleId == request.VehicleId);
    if (vehicle == null)
    {
        return BadRequest("Invalid VehicleId: Vehicle does not exist.");
    }

    order.VehicleId = request.VehicleId;
    _context.SaveChanges();

    return Ok(order);
}

public class AssignVehicleRequest
{
    public required string VehicleId { get; set; }
}
    [HttpDelete("{id}")]
    public IActionResult DeleteOrder(string id)
    {
        var order = _context.Orders.FirstOrDefault(o => o.OrderId == id);
        if (order == null)
        {
            return NotFound();
        }

        _context.Orders.Remove(order);
        _context.SaveChanges();

        return NoContent();
    }
}