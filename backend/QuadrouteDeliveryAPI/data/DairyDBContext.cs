using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DairyDistribution.Data
{
    public class DairyDbContext : DbContext
    {
        public DairyDbContext(DbContextOptions<DairyDbContext> options) : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<CustomerAddress> CustomerAddresses { get; set; }
        public DbSet<TimeSlot> TimeSlots { get; set; }
        public DbSet<Dairy> Dairies { get; set; }
        public DbSet<MilkType> MilkTypes { get; set; }
        public DbSet<DairyMilkOffering> DairyMilkOfferings { get; set; }
        public DbSet<DairyMilkOfferingHistory> DairyMilkOfferingHistories { get; set; }
        public DbSet<DeliveryBoy> DeliveryBoys { get; set; }
        public DbSet<DeliveryWage> DeliveryWages { get; set; }
        public DbSet<Route> Routes { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderSchedule> OrderSchedules { get; set; }
        public DbSet<DeliveryAssignment> DeliveryAssignments { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<OrderStatus> OrderStatuses { get; set; }
        public DbSet<PaymentStatus> PaymentStatuses { get; set; }
        public DbSet<PaymentMode> PaymentModes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("dairy_distribution");

            // Customer configuration
            modelBuilder.Entity<Customer>()
                .ToTable("customer")
                .HasKey(c => c.CustomerId);

            modelBuilder.Entity<Customer>(entity =>
            {
                entity.Property(c => c.CustomerId).HasColumnName("customer_id");
                entity.Property(c => c.CustomerName).HasColumnName("customer_name");
                entity.Property(c => c.BillingName).HasColumnName("billing_name");
                entity.Property(c => c.PhoneNumber).HasColumnName("phone_number");
                entity.Property(c => c.CreatedAt).HasColumnName("created_at");

                entity.HasMany(c => c.Orders)
                    .WithOne(o => o.Customer)
                    .HasForeignKey(o => o.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(c => c.CustomerAddresses)
                    .WithOne(ca => ca.Customer)
                    .HasForeignKey(ca => ca.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(c => c.PhoneNumber)
                    .IsUnique();
            });

            // Address configuration
            modelBuilder.Entity<Address>()
                .ToTable("address")
                .HasKey(a => a.AddressId);

            modelBuilder.Entity<Address>(entity =>
            {
                entity.Property(a => a.AddressId).HasColumnName("address_id");
                entity.Property(a => a.FullName).HasColumnName("full_name");
                entity.Property(a => a.MobileNumber).HasColumnName("mobile_number");
                entity.Property(a => a.Pincode).HasColumnName("pincode");
                entity.Property(a => a.FlatHouse).HasColumnName("flat_house");
                entity.Property(a => a.AreaStreet).HasColumnName("area_street");
                entity.Property(a => a.Landmark).HasColumnName("landmark");
                entity.Property(a => a.TownCity).HasColumnName("town_city");
                entity.Property(a => a.State).HasColumnName("state");
                entity.Property(a => a.Country).HasColumnName("country");
                entity.Property(a => a.Latitude).HasColumnName("latitude");
                entity.Property(a => a.Longitude).HasColumnName("longitude");
                entity.Property(a => a.DeliveryInstructions).HasColumnName("delivery_instructions");
                entity.Property(a => a.CreatedAt).HasColumnName("created_at");

                entity.HasMany(a => a.Dairies)
                    .WithOne(d => d.Address)
                    .HasForeignKey(d => d.AddressId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(a => a.Orders)
                    .WithOne(o => o.DeliveryAddress)
                    .HasForeignKey(o => o.DeliveryAddressId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // CustomerAddress configuration
            modelBuilder.Entity<CustomerAddress>()
                .ToTable("customeraddress")
                .HasKey(ca => ca.CustomerAddressId);

            modelBuilder.Entity<CustomerAddress>(entity =>
            {
                entity.Property(ca => ca.CustomerAddressId).HasColumnName("customer_address_id");
                entity.Property(ca => ca.CustomerId).HasColumnName("customer_id");
                entity.Property(ca => ca.AddressId).HasColumnName("address_id");
                entity.Property(ca => ca.TimeSlotId).HasColumnName("time_slot_id");
                entity.Property(ca => ca.IsDefault).HasColumnName("is_default");
                entity.Property(ca => ca.CreatedAt).HasColumnName("created_at");

                entity.HasOne(ca => ca.Address)
                    .WithMany(a => a.CustomerAddresses)
                    .HasForeignKey(ca => ca.AddressId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ca => ca.TimeSlot)
                    .WithMany(ts => ts.CustomerAddresses)
                    .HasForeignKey(ca => ca.TimeSlotId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(ca => new { ca.CustomerId, ca.AddressId })
                    .IsUnique();
            });

            // TimeSlot configuration
            modelBuilder.Entity<TimeSlot>()
                .ToTable("timeslot")
                .HasKey(ts => ts.TimeSlotId);

            modelBuilder.Entity<TimeSlot>(entity =>
            {
                entity.Property(ts => ts.TimeSlotId).HasColumnName("time_slot_id");
                entity.Property(ts => ts.SlotStart).HasColumnName("slot_start");
                entity.Property(ts => ts.SlotEnd).HasColumnName("slot_end");
                entity.Property(ts => ts.Description).HasColumnName("description");
            });

            // Dairy configuration
            modelBuilder.Entity<Dairy>()
                .ToTable("dairy")
                .HasKey(d => d.DairyId);

            modelBuilder.Entity<Dairy>(entity =>
            {
                entity.Property(d => d.DairyId).HasColumnName("dairy_id");
                entity.Property(d => d.Name).HasColumnName("name");
                entity.Property(d => d.AddressId).HasColumnName("address_id");
                entity.Property(d => d.OwnerName).HasColumnName("owner_name");
                entity.Property(d => d.ManagerName).HasColumnName("manager_name");
                entity.Property(d => d.ManagerPhone).HasColumnName("manager_phone");
                entity.Property(d => d.ManagerEmail).HasColumnName("manager_email");
                entity.Property(d => d.RegistrationNumber).HasColumnName("registration_number");
                entity.Property(d => d.LicenseNumber).HasColumnName("license_number");
                entity.Property(d => d.OperationalStartTime).HasColumnName("operational_start_time");
                entity.Property(d => d.OperationalEndTime).HasColumnName("operational_end_time");
                entity.Property(d => d.CreatedAt).HasColumnName("created_at");

                entity.HasMany(d => d.DairyMilkOfferings)
                    .WithOne(dmo => dmo.Dairy)
                    .HasForeignKey(dmo => dmo.DairyId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(d => d.Orders)
                    .WithOne(o => o.Dairy)
                    .HasForeignKey(o => o.DairyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(d => d.RegistrationNumber)
                    .IsUnique();

                entity.HasIndex(d => d.LicenseNumber)
                    .IsUnique();
            });

            // MilkType configuration
            modelBuilder.Entity<MilkType>()
                .ToTable("milktype")
                .HasKey(mt => mt.MilkTypeId);

            modelBuilder.Entity<MilkType>(entity =>
            {
                entity.Property(mt => mt.MilkTypeId).HasColumnName("milk_type_id");
                entity.Property(mt => mt.TypeName).HasColumnName("type_name");
                entity.Property(mt => mt.Description).HasColumnName("description");

                entity.HasMany(mt => mt.DairyMilkOfferings)
                    .WithOne(dmo => dmo.MilkType)
                    .HasForeignKey(dmo => dmo.MilkTypeId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(mt => mt.Orders)
                    .WithOne(o => o.MilkType)
                    .HasForeignKey(o => o.MilkTypeId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(mt => mt.TypeName)
                    .IsUnique();
            });

            // DairyMilkOffering configuration
            modelBuilder.Entity<DairyMilkOffering>()
                .ToTable("dairymilkoffering")
                .HasKey(dmo => dmo.OfferingId);

            modelBuilder.Entity<DairyMilkOffering>(entity =>
            {
                entity.Property(dmo => dmo.OfferingId).HasColumnName("offering_id");
                entity.Property(dmo => dmo.DairyId).HasColumnName("dairy_id");
                entity.Property(dmo => dmo.MilkTypeId).HasColumnName("milk_type_id");
                entity.Property(dmo => dmo.PricePerLiter).HasColumnName("price_per_liter");
                entity.Property(dmo => dmo.CapacityLiters).HasColumnName("capacity_liters");
                entity.Property(dmo => dmo.UpdatedAt).HasColumnName("updated_at");

                entity.HasMany(dmo => dmo.DairyMilkOfferingHistories)
                    .WithOne(dmoh => dmoh.DairyMilkOffering)
                    .HasForeignKey(dmoh => dmoh.OfferingId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(dmo => new { dmo.DairyId, dmo.MilkTypeId })
                    .IsUnique();
            });

            // DairyMilkOfferingHistory configuration
            modelBuilder.Entity<DairyMilkOfferingHistory>()
                .ToTable("dairymilkofferinghistory")
                .HasKey(dmoh => dmoh.HistoryId);

            modelBuilder.Entity<DairyMilkOfferingHistory>(entity =>
            {
                entity.Property(dmoh => dmoh.HistoryId).HasColumnName("history_id");
                entity.Property(dmoh => dmoh.OfferingId).HasColumnName("offering_id");
                entity.Property(dmoh => dmoh.PricePerLiter).HasColumnName("price_per_liter");
                entity.Property(dmoh => dmoh.CapacityLiters).HasColumnName("capacity_liters");
                entity.Property(dmoh => dmoh.ValidFrom).HasColumnName("valid_from");
                entity.Property(dmoh => dmoh.ValidTo).HasColumnName("valid_to");
            });

            // DeliveryBoy configuration
            modelBuilder.Entity<DeliveryBoy>()
                .ToTable("deliveryboy")
                .HasKey(db => db.DeliveryBoyId);

            modelBuilder.Entity<DeliveryBoy>(entity =>
            {
                entity.Property(db => db.DeliveryBoyId).HasColumnName("delivery_boy_id");
                entity.Property(db => db.Name).HasColumnName("name");
                entity.Property(db => db.PhoneNumber).HasColumnName("phone_number");
                entity.Property(db => db.UidaiNumber).HasColumnName("uidai_number");
                entity.Property(db => db.BankAccountNumber).HasColumnName("bank_account_number");
                entity.Property(db => db.Status).HasColumnName("status");
                entity.Property(db => db.OnboardingDate).HasColumnName("onboarding_date");
                entity.Property(db => db.CreatedAt).HasColumnName("created_at");

                entity.HasMany(db => db.DeliveryAssignments)
                    .WithOne(da => da.DeliveryBoy)
                    .HasForeignKey(da => da.DeliveryBoyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(db => db.PhoneNumber)
                    .IsUnique();

                entity.HasIndex(db => db.UidaiNumber)
                    .IsUnique();
            });

            // DeliveryWage configuration
            modelBuilder.Entity<DeliveryWage>()
                .ToTable("deliverywage")
                .HasKey(dw => dw.WageId);

            modelBuilder.Entity<DeliveryWage>(entity =>
            {
                entity.Property(dw => dw.WageId).HasColumnName("wage_id");
                entity.Property(dw => dw.MinDistanceKm).HasColumnName("min_distance_km");
                entity.Property(dw => dw.MaxDistanceKm).HasColumnName("max_distance_km");
                entity.Property(dw => dw.WageAmount).HasColumnName("wage_amount");
                entity.Property(dw => dw.ValidFrom).HasColumnName("valid_from");
                entity.Property(dw => dw.ValidTo).HasColumnName("valid_to");

                entity.HasMany(dw => dw.DeliveryAssignments)
                    .WithOne(da => da.DeliveryWage)
                    .HasForeignKey(da => da.WageId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Route configuration
            modelBuilder.Entity<Route>()
                .ToTable("route")
                .HasKey(r => r.RouteId);

            modelBuilder.Entity<Route>(entity =>
            {
                entity.Property(r => r.RouteId).HasColumnName("route_id");
                entity.Property(r => r.StartLatitude).HasColumnName("start_latitude");
                entity.Property(r => r.StartLongitude).HasColumnName("start_longitude");
                entity.Property(r => r.EndLatitude).HasColumnName("end_latitude");
                entity.Property(r => r.EndLongitude).HasColumnName("end_longitude");
                entity.Property(r => r.DistanceKm).HasColumnName("distance_km");
                entity.Property(r => r.RouteData).HasColumnName("route_data");
                entity.Property(r => r.CreatedAt).HasColumnName("created_at");

                entity.HasMany(r => r.DeliveryAssignments)
                    .WithOne(da => da.Route)
                    .HasForeignKey(da => da.RouteId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(r => new { r.StartLatitude, r.StartLongitude, r.EndLatitude, r.EndLongitude })
                    .IsUnique();
            });

            // Order configuration
            modelBuilder.Entity<Order>()
                .ToTable("order")
                .HasKey(o => o.OrderId);

            modelBuilder.Entity<Order>(entity =>
            {
                entity.Property(o => o.OrderId).HasColumnName("order_id");
                entity.Property(o => o.CustomerId).HasColumnName("customer_id");
                entity.Property(o => o.DairyId).HasColumnName("dairy_id");
                entity.Property(o => o.MilkTypeId).HasColumnName("milk_type_id");
                entity.Property(o => o.VolumeLiters).HasColumnName("volume_liters");
                entity.Property(o => o.DeliveryAddressId).HasColumnName("delivery_address_id");
                entity.Property(o => o.TimeSlotId).HasColumnName("time_slot_id");
                entity.Property(o => o.DeliveryDate).HasColumnName("delivery_date");
                entity.Property(o => o.StatusId).HasColumnName("status_id");
                entity.Property(o => o.CreatedAt).HasColumnName("created_at");
                entity.Property(o => o.CreatedBy).HasColumnName("created_by");

                entity.HasOne(o => o.TimeSlot)
                    .WithMany(ts => ts.Orders)
                    .HasForeignKey(o => o.TimeSlotId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.Status)
                    .WithMany(os => os.Orders)
                    .HasForeignKey(o => o.StatusId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.CreatedByCustomer)
                    .WithMany()
                    .HasForeignKey(o => o.CreatedBy)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasMany(o => o.OrderSchedules)
                    .WithOne(os => os.Order)
                    .HasForeignKey(os => os.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(o => o.DeliveryAssignments)
                    .WithOne(da => da.Order)
                    .HasForeignKey(da => da.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(o => o.Payments)
                    .WithOne(p => p.Order)
                    .HasForeignKey(p => p.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // OrderSchedule configuration
            modelBuilder.Entity<OrderSchedule>()
                .ToTable("orderschedule")
                .HasKey(os => os.ScheduleId);

            modelBuilder.Entity<OrderSchedule>(entity =>
            {
                entity.Property(os => os.ScheduleId).HasColumnName("schedule_id");
                entity.Property(os => os.OrderId).HasColumnName("order_id");
                entity.Property(os => os.Frequency).HasColumnName("frequency");
                entity.Property(os => os.BillingCycle).HasColumnName("billing_cycle");
                entity.Property(os => os.StartDate).HasColumnName("start_date");
                entity.Property(os => os.EndDate).HasColumnName("end_date");
            });

            // DeliveryAssignment configuration
            modelBuilder.Entity<DeliveryAssignment>()
                .ToTable("deliveryassignment")
                .HasKey(da => da.AssignmentId);

            modelBuilder.Entity<DeliveryAssignment>(entity =>
            {
                entity.Property(da => da.AssignmentId).HasColumnName("assignment_id");
                entity.Property(da => da.OrderId).HasColumnName("order_id");
                entity.Property(da => da.DeliveryBoyId).HasColumnName("delivery_boy_id");
                entity.Property(da => da.RouteId).HasColumnName("route_id");
                entity.Property(da => da.WageId).HasColumnName("wage_id");
                entity.Property(da => da.AssignedAt).HasColumnName("assigned_at");
                entity.Property(da => da.DeliveryTime).HasColumnName("delivery_time");

                entity.HasIndex(da => da.OrderId)
                    .IsUnique();
            });

            // Payment configuration
            modelBuilder.Entity<Payment>()
                .ToTable("payment")
                .HasKey(p => p.PaymentId);

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.Property(p => p.PaymentId).HasColumnName("payment_id");
                entity.Property(p => p.OrderId).HasColumnName("order_id");
                entity.Property(p => p.Amount).HasColumnName("amount");
                entity.Property(p => p.PaymentStatusId).HasColumnName("payment_status_id");
                entity.Property(p => p.PaymentModeId).HasColumnName("payment_mode_id");
                entity.Property(p => p.PaymentReferenceNumber).HasColumnName("payment_reference_number");
                entity.Property(p => p.PaymentDate).HasColumnName("payment_date");

                entity.HasOne(p => p.PaymentStatus)
                    .WithMany(ps => ps.Payments)
                    .HasForeignKey(p => p.PaymentStatusId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.PaymentMode)
                    .WithMany(pm => pm.Payments)
                    .HasForeignKey(p => p.PaymentModeId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(p => p.PaymentReferenceNumber)
                    .IsUnique();
            });

            // OrderStatus configuration
            modelBuilder.Entity<OrderStatus>()
                .ToTable("orderstatus")
                .HasKey(os => os.StatusId);

            modelBuilder.Entity<OrderStatus>(entity =>
            {
                entity.Property(os => os.StatusId).HasColumnName("status_id");
                entity.Property(os => os.StatusName).HasColumnName("status_name");
                entity.Property(os => os.Description).HasColumnName("description");

                entity.HasIndex(os => os.StatusName)
                    .IsUnique();
            });

            // PaymentStatus configuration
            modelBuilder.Entity<PaymentStatus>()
                .ToTable("paymentstatus")
                .HasKey(ps => ps.PaymentStatusId);

            modelBuilder.Entity<PaymentStatus>(entity =>
            {
                entity.Property(ps => ps.PaymentStatusId).HasColumnName("payment_status_id");
                entity.Property(ps => ps.StatusName).HasColumnName("status_name");
                entity.Property(ps => ps.Description).HasColumnName("description");

                entity.HasIndex(ps => ps.StatusName)
                    .IsUnique();
            });

            // PaymentMode configuration
            modelBuilder.Entity<PaymentMode>()
                .ToTable("paymentmode")
                .HasKey(pm => pm.PaymentModeId);

            modelBuilder.Entity<PaymentMode>(entity =>
            {
                entity.Property(pm => pm.PaymentModeId).HasColumnName("payment_mode_id");
                entity.Property(pm => pm.ModeName).HasColumnName("mode_name");
                entity.Property(pm => pm.Description).HasColumnName("description");

                entity.HasIndex(pm => pm.ModeName)
                    .IsUnique();
            });
        }
    }

    // Model Classes
    public class Customer
    {
        [Key]
        public int CustomerId { get; set; }

        [Required]
        [StringLength(100)]
        public string CustomerName { get; set; }

        [Required]
        [StringLength(100)]
        public string BillingName { get; set; }

        [Required]
        [StringLength(15)]
        public string PhoneNumber { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<CustomerAddress> CustomerAddresses { get; set; }
        public virtual ICollection<Order> Orders { get; set; }
    }

    public class Address
    {
        [Key]
        public int AddressId { get; set; }

        [Required]
        [StringLength(100)]
        public string FullName { get; set; }

        [Required]
        [StringLength(15)]
        public string MobileNumber { get; set; }

        [Required]
        [StringLength(6)]
        [RegularExpression("^[0-9]{6}$")]
        public string Pincode { get; set; }

        [Required]
        [StringLength(100)]
        public string FlatHouse { get; set; }

        [Required]
        [StringLength(100)]
        public string AreaStreet { get; set; }

        [StringLength(100)]
        public string? Landmark { get; set; }

        [Required]
        [StringLength(50)]
        public string TownCity { get; set; }

        [Required]
        [StringLength(50)]
        public string State { get; set; }

        [Required]
        [StringLength(50)]
        public string Country { get; set; }

        [Column(TypeName = "decimal(9,6)")]
        public decimal? Latitude { get; set; }

        [Column(TypeName = "decimal(9,6)")]
        public decimal? Longitude { get; set; }

        public string? DeliveryInstructions { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<CustomerAddress> CustomerAddresses { get; set; }
        public virtual ICollection<Dairy> Dairies { get; set; }
        public virtual ICollection<Order> Orders { get; set; }
    }

    public class CustomerAddress
    {
        [Key]
        public int CustomerAddressId { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int AddressId { get; set; }

        [Required]
        public int TimeSlotId { get; set; }

        public bool IsDefault { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual Customer Customer { get; set; }
        public virtual Address Address { get; set; }
        public virtual TimeSlot TimeSlot { get; set; }
    }

    public class TimeSlot
    {
        [Key]
        public int TimeSlotId { get; set; }

        [Required]
        public TimeSpan SlotStart { get; set; }

        [Required]
        public TimeSpan SlotEnd { get; set; }

        [StringLength(50)]
        public string? Description { get; set; }

        // Navigation properties
        public virtual ICollection<CustomerAddress> CustomerAddresses { get; set; }
        public virtual ICollection<Order> Orders { get; set; }
    }

    public class Dairy
    {
        [Key]
        public int DairyId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        public int AddressId { get; set; }

        [Required]
        [StringLength(100)]
        public string OwnerName { get; set; }

        [Required]
        [StringLength(100)]
        public string ManagerName { get; set; }

        [Required]
        [StringLength(15)]
        public string ManagerPhone { get; set; }

        [StringLength(100)]
        public string? ManagerEmail { get; set; }

        [StringLength(50)]
        public string? RegistrationNumber { get; set; }

        [StringLength(50)]
        public string? LicenseNumber { get; set; }

        [Required]
        public TimeSpan OperationalStartTime { get; set; }

        [Required]
        public TimeSpan OperationalEndTime { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual Address Address { get; set; }
        public virtual ICollection<DairyMilkOffering> DairyMilkOfferings { get; set; }
        public virtual ICollection<Order> Orders { get; set; }
    }

    public class MilkType
    {
        [Key]
        public int MilkTypeId { get; set; }

        [Required]
        [StringLength(50)]
        public string TypeName { get; set; }

        public string? Description { get; set; }

        // Navigation properties
        public virtual ICollection<DairyMilkOffering> DairyMilkOfferings { get; set; }
        public virtual ICollection<Order> Orders { get; set; }
    }

    public class DairyMilkOffering
    {
        [Key]
        public int OfferingId { get; set; }

        [Required]
        public int DairyId { get; set; }

        [Required]
        public int MilkTypeId { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerLiter { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal CapacityLiters { get; set; }

        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual Dairy Dairy { get; set; }
        public virtual MilkType MilkType { get; set; }
        public virtual ICollection<DairyMilkOfferingHistory> DairyMilkOfferingHistories { get; set; }
    }

    public class DairyMilkOfferingHistory
    {
        [Key]
        public int HistoryId { get; set; }

        [Required]
        public int OfferingId { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerLiter { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal CapacityLiters { get; set; }

        [Required]
        public DateTime ValidFrom { get; set; }

        public DateTime? ValidTo { get; set; }

        // Navigation properties
        public virtual DairyMilkOffering DairyMilkOffering { get; set; }
    }

    public class DeliveryBoy
    {
        [Key]
        public int DeliveryBoyId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [StringLength(15)]
        public string PhoneNumber { get; set; }

        [Required]
        [StringLength(12)]
        public string UidaiNumber { get; set; }

        [Required]
        [StringLength(30)]
        public string BankAccountNumber { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; }

        [Required]
        public DateTime OnboardingDate { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<DeliveryAssignment> DeliveryAssignments { get; set; }
    }

    public class DeliveryWage
    {
        [Key]
        public int WageId { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal MinDistanceKm { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? MaxDistanceKm { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal WageAmount { get; set; }

        [Required]
        public DateTime ValidFrom { get; set; }

        public DateTime? ValidTo { get; set; }

        // Navigation properties
        public virtual ICollection<DeliveryAssignment> DeliveryAssignments { get; set; }
    }

    public class Route
    {
        [Key]
        public int RouteId { get; set; }

        [Required]
        [Column(TypeName = "decimal(9,6)")]
        public decimal StartLatitude { get; set; }

        [Required]
        [Column(TypeName = "decimal(9,6)")]
        public decimal StartLongitude { get; set; }

        [Required]
        [Column(TypeName = "decimal(9,6)")]
        public decimal EndLatitude { get; set; }

        [Required]
        [Column(TypeName = "decimal(9,6)")]
        public decimal EndLongitude { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal DistanceKm { get; set; }

        [Required]
        public string RouteData { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<DeliveryAssignment> DeliveryAssignments { get; set; }
    }

    public class Order
    {
        [Key]
        public int OrderId { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int DairyId { get; set; }

        [Required]
        public int MilkTypeId { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal VolumeLiters { get; set; }

        [Required]
        public int DeliveryAddressId { get; set; }

        [Required]
        public int TimeSlotId { get; set; }

        [Required]
        public DateTime DeliveryDate { get; set; }

        [Required]
        public int StatusId { get; set; }

        public DateTime CreatedAt { get; set; }

        public int? CreatedBy { get; set; }

        // Navigation properties
        public virtual Customer Customer { get; set; }
        public virtual Dairy Dairy { get; set; }
        public virtual MilkType MilkType { get; set; }
        public virtual Address DeliveryAddress { get; set; }
        public virtual TimeSlot TimeSlot { get; set; }
        public virtual Customer CreatedByCustomer { get; set; }
        public virtual OrderStatus Status { get; set; }
        public virtual ICollection<OrderSchedule> OrderSchedules { get; set; }
        public virtual ICollection<DeliveryAssignment> DeliveryAssignments { get; set; }
        public virtual ICollection<Payment> Payments { get; set; }
    }

    public class OrderSchedule
    {
        [Key]
        public int ScheduleId { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        [StringLength(20)]
        public string Frequency { get; set; }

        [Required]
        [StringLength(20)]
        public string BillingCycle { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        // Navigation properties
        public virtual Order Order { get; set; }
    }

    public class DeliveryAssignment
    {
        [Key]
        public int AssignmentId { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        public int DeliveryBoyId { get; set; }

        [Required]
        public int RouteId { get; set; }

        public int? WageId { get; set; }

        public DateTime AssignedAt { get; set; }

        public DateTime? DeliveryTime { get; set; }

        // Navigation properties
        public virtual Order Order { get; set; }
        public virtual DeliveryBoy DeliveryBoy { get; set; }
        public virtual Route Route { get; set; }
        public virtual DeliveryWage? DeliveryWage { get; set; }
    }

    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        [Required]
        public int PaymentStatusId { get; set; }

        [Required]
        public int PaymentModeId { get; set; }

        [Required]
        [StringLength(100)]
        public string PaymentReferenceNumber { get; set; }

        public DateTime PaymentDate { get; set; }

        // Navigation properties
        public virtual Order Order { get; set; }
        public virtual PaymentStatus PaymentStatus { get; set; }
        public virtual PaymentMode PaymentMode { get; set; }
    }

    public class OrderStatus
    {
        [Key]
        public int StatusId { get; set; }

        [Required]
        [StringLength(20)]
        public string StatusName { get; set; }

        public string? Description { get; set; }

        // Navigation properties
        public virtual ICollection<Order> Orders { get; set; }
    }

    public class PaymentStatus
    {
        [Key]
        public int PaymentStatusId { get; set; }

        [Required]
        [StringLength(20)]
        public string StatusName { get; set; }

        public string? Description { get; set; }

        // Navigation properties
        public virtual ICollection<Payment> Payments { get; set; }
    }

    public class PaymentMode
    {
        [Key]
        public int PaymentModeId { get; set; }

        [Required]
        [StringLength(50)]
        public string ModeName { get; set; }

        public string? Description { get; set; }

        // Navigation properties
        public virtual ICollection<Payment> Payments { get; set; }
    }
}