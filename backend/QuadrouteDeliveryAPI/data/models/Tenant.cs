// Models/Tenant.cs
using System.ComponentModel.DataAnnotations;

namespace QuadrouteDeliveryAPI.Models
{
    public class Tenant
    {
        public Guid TenantId { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Vertical { get; set; }
        public string ContactEmail { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<EndCustomer> EndCustomers { get; set; }
    }
}
