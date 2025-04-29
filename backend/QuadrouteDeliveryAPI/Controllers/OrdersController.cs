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
}