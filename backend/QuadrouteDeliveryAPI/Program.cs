// Program.cs
using Microsoft.EntityFrameworkCore;
using QuadrouteDeliveryAPI.Data;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text.Json;
using System.Text.Json.Serialization;
using NetTopologySuite.Geometries;
using DotNetEnv;

Env.Load(); // Load .env file

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new PointConverter());
    });

// Construct the connection string using the password from .env
var password = Env.GetString("SUPABASE_PASSWORD");
var host = Env.GetString("Host")??"localhost";
var port = Env.GetString("Port")??"5432";
var userName = Env.GetString("Username")??"postgres";
var database = Env.GetString("Database")?? "postgres";

var connectionString = $"Host={host};Port={port};Database={database};Username={userName};Password={password}";

Console.WriteLine($"Loaded Connection String: {connectionString}");

if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Connection string is null or empty.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    try
    {
        options.UseNpgsql(connectionString,
            npgsqlOptions =>
            {
                npgsqlOptions.UseNetTopologySuite();
                npgsqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
            })
            .LogTo(Console.WriteLine, LogLevel.Information);
    }
    catch (Npgsql.NpgsqlException ex)
    {
        Console.WriteLine($"Npgsql Error: {ex.Message}");
        throw;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"DbContext Error: {ex.Message}");
        throw;
    }
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Quadroute Delivery API", Version = "v1" });
});

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Quadroute Delivery API v1"));
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Custom JsonConverter for Point
public class PointConverter : JsonConverter<Point>
{
    public override Point Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.StartObject)
        {
            throw new JsonException("Expected StartObject for Point");
        }

        double x = 0, y = 0;
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndObject)
            {
                break;
            }

            if (reader.TokenType == JsonTokenType.PropertyName)
            {
                var propertyName = reader.GetString();
                reader.Read();
                if (propertyName == "x")
                {
                    x = reader.GetDouble();
                }
                else if (propertyName == "y")
                {
                    y = reader.GetDouble();
                }
            }
        }

        return new Point(x, y) { SRID = 4326 };
    }

    public override void Write(Utf8JsonWriter writer, Point value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        writer.WriteNumber("x", value.X);
        writer.WriteNumber("y", value.Y);
        writer.WriteEndObject();
    }
}