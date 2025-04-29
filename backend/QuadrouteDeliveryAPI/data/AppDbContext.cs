// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace QuadrouteDeliveryAPI.Data;

public class AppDbContext : DbContext
{
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Store> Stores { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Order> Orders { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>()
            .Property(c => c.Location)
            .HasColumnType("geography (point)");
        modelBuilder.Entity<Store>()
            .Property(s => s.Location)
            .HasColumnType("geography (point)");
        modelBuilder.Entity<Vehicle>()
            .Property(v => v.Location)
            .HasColumnType("geography (point)");

        modelBuilder.Entity<Customer>().ToTable("customers");
        modelBuilder.Entity<Customer>().Property(c => c.CustomerId).HasColumnName("customer_id");
        modelBuilder.Entity<Customer>().Property(c => c.Name).HasColumnName("name");
        modelBuilder.Entity<Customer>().Property(c => c.AddressLine1).HasColumnName("address_line1");
        modelBuilder.Entity<Customer>().Property(c => c.AddressLine2).HasColumnName("address_line2");
        modelBuilder.Entity<Customer>().Property(c => c.City).HasColumnName("city");
        modelBuilder.Entity<Customer>().Property(c => c.PostalCode).HasColumnName("postal_code");
        modelBuilder.Entity<Customer>().Property(c => c.PhoneNumber).HasColumnName("phone_number");
        modelBuilder.Entity<Customer>().Property(c => c.Email).HasColumnName("email");
        modelBuilder.Entity<Customer>().Property(c => c.Location).HasColumnName("location");

        modelBuilder.Entity<Store>().ToTable("stores");
        modelBuilder.Entity<Store>().Property(s => s.StoreId).HasColumnName("store_id");
        modelBuilder.Entity<Store>().Property(s => s.Name).HasColumnName("name");
        modelBuilder.Entity<Store>().Property(s => s.AddressLine1).HasColumnName("address_line1");
        modelBuilder.Entity<Store>().Property(s => s.AddressLine2).HasColumnName("address_line2");
        modelBuilder.Entity<Store>().Property(s => s.City).HasColumnName("city");
        modelBuilder.Entity<Store>().Property(s => s.PostalCode).HasColumnName("postal_code");
        modelBuilder.Entity<Store>().Property(s => s.ContactNumber).HasColumnName("contact_number");
        modelBuilder.Entity<Store>().Property(s => s.DailyCapacityLiters).HasColumnName("daily_capacity_liters");
        modelBuilder.Entity<Store>().Property(s => s.Location).HasColumnName("location");

        modelBuilder.Entity<Vehicle>().ToTable("vehicles");
        modelBuilder.Entity<Vehicle>().Property(v => v.VehicleId).HasColumnName("vehicle_id");
        modelBuilder.Entity<Vehicle>().Property(v => v.DriverName).HasColumnName("driver_name");
        modelBuilder.Entity<Vehicle>().Property(v => v.ContactNumber).HasColumnName("contact_number");
        modelBuilder.Entity<Vehicle>().Property(v => v.CapacityLiters).HasColumnName("capacity_liters");
        modelBuilder.Entity<Vehicle>().Property(v => v.AvailabilityStartTime).HasColumnName("availability_start_time");
        modelBuilder.Entity<Vehicle>().Property(v => v.AvailabilityEndTime).HasColumnName("availability_end_time");
        modelBuilder.Entity<Vehicle>().Property(v => v.Location).HasColumnName("location");

        modelBuilder.Entity<Order>().ToTable("orders");
        modelBuilder.Entity<Order>().Property(o => o.OrderId).HasColumnName("order_id");
        modelBuilder.Entity<Order>().Property(o => o.CustomerId).HasColumnName("customer_id");
        modelBuilder.Entity<Order>().Property(o => o.MilkType).HasColumnName("milk_type");
        modelBuilder.Entity<Order>().Property(o => o.QuantityLiters).HasColumnName("quantity_liters");
        modelBuilder.Entity<Order>().Property(o => o.DeliveryDate).HasColumnName("delivery_date");
        modelBuilder.Entity<Order>().Property(o => o.DeliveryTimeWindow).HasColumnName("delivery_time_window");
        modelBuilder.Entity<Order>().Property(o => o.Status).HasColumnName("status");

        modelBuilder.Entity<Order>()
            .HasOne<Customer>()
            .WithMany()
            .HasForeignKey(o => o.CustomerId);
    }
}

public class Customer
{
    public required string CustomerId { get; set; }
    public required string Name { get; set; }
    public required string AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public required string City { get; set; }
    public required string PostalCode { get; set; }
    public required string PhoneNumber { get; set; }
    public string? Email { get; set; }
    public required Point Location { get; set; }
}

public class Store
{
    public required string StoreId { get; set; }
    public required string Name { get; set; }
    public required string AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public required string City { get; set; }
    public required string PostalCode { get; set; }
    public required string ContactNumber { get; set; }
    public required int DailyCapacityLiters { get; set; }
    public required Point Location { get; set; }
}

public class Vehicle
{
    public required string VehicleId { get; set; }
    public required string DriverName { get; set; }
    public required string ContactNumber { get; set; }
    public required int CapacityLiters { get; set; }
    public required TimeSpan AvailabilityStartTime { get; set; }
    public required TimeSpan AvailabilityEndTime { get; set; }
    public required Point Location { get; set; }
}

public class Order
{
    public required string OrderId { get; set; }
    public required string CustomerId { get; set; }
    public required string MilkType { get; set; }
    public required int QuantityLiters { get; set; }
    public required DateTime DeliveryDate { get; set; }
    public required string DeliveryTimeWindow { get; set; }
    public required string Status { get; set; }
}