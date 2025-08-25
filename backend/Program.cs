using HelpDesk360.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// CORS
var corsPolicy = "AllowFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicy,
        policy =>
        {
            policy
                .WithOrigins(builder.Configuration.GetValue<string>("Cors:AllowedOrigins")?.Split(',') ?? new[] { "http://localhost:4200" })
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// EF Core - SQL Server
var connStr = builder.Configuration.GetConnectionString("DefaultConnection") 
              ?? "Server=sqlserver,1433;Database=HelpDesk360;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;";
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(connStr));

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = ctx =>
        {
            var problem = new ValidationProblemDetails(ctx.ModelState);
            return new BadRequestObjectResult(problem);
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "HelpDesk360 API", Version = "v1" });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors(corsPolicy);

app.MapControllers();

// Migrate & seed
using var loggerFactory = LoggerFactory.Create(lb => lb.AddConsole());
await DbInitializer.MigrateAndSeedAsync(app, loggerFactory.CreateLogger("DbInit"));

app.Run();
