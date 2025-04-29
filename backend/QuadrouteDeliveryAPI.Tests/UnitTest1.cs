// AppDbContextTests.cs
using Microsoft.EntityFrameworkCore;
using QuadrouteDeliveryAPI.Data;
using Npgsql;
using Xunit;

namespace QuadrouteDeliveryAPI.Tests;

public class AppDbContextTests
{
    private readonly string _connectionString = "Host=db.tggxztoybbbawzzagzet.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=Postgre2025";

    [Fact]
    public void CanConnectUsingRawNpgsql()
    {
        using var connection = new NpgsqlConnection(_connectionString);
        connection.Open();
        var canConnect = connection.State == System.Data.ConnectionState.Open;
        Assert.True(canConnect, "Failed to connect using raw Npgsql connection.");
        connection.Close();
    }

    [Fact]
    public void CanConnectToDatabase_WithNetTopologySuite()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_connectionString, npgsqlOptions => npgsqlOptions.UseNetTopologySuite())
            .Options;

        using var context = new AppDbContext(options);
        var canConnect = context.Database.CanConnect();
        Assert.True(canConnect, "Failed to connect to the database with NetTopologySuite.");
    }

    [Fact]
    public void CanQueryCustomers_WithNetTopologySuite()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_connectionString, npgsqlOptions => npgsqlOptions.UseNetTopologySuite())
            .Options;

        using var context = new AppDbContext(options);
        var customerCount = context.Customers.Count();
        Assert.Equal(10, customerCount);
    }

    [Fact]
    public void CanReadCustomerLocation()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_connectionString, npgsqlOptions => npgsqlOptions.UseNetTopologySuite())
            .Options;

        using var context = new AppDbContext(options);
        var customer = context.Customers.First();
        Assert.NotNull(customer.Location);
        Assert.True(customer.Location.X != 0 || customer.Location.Y != 0);
    }
}