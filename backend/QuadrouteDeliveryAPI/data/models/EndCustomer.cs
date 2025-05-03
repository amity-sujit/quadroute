
// Models/EndCustomer.cs
using System.ComponentModel.DataAnnotations;

namespace QuadrouteDeliveryAPI.Models
{
    public class EndCustomer
    {
        public Guid CustomerId { get; set; }
        public Guid TenantId { get; set; }
        [Required]
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public float? Latitude { get; set; }
        public float? Longitude { get; set; }
        public bool IsVerified { get; set; }
        public DateTime CreatedAt { get; set; }
        public Tenant Tenant { get; set; }
    }
}