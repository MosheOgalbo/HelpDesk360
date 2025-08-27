using Microsoft.EntityFrameworkCore;
using HelpDesk360.API.Data;
using HelpDesk360.API.Repositories;
using HelpDesk360.API.Services;
using Serilog;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
builder.Host.UseSerilog((context, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .WriteTo.Console()
        .WriteTo.File("logs/helpdesk360-.txt", rollingInterval: RollingInterval.Day);
});

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "HelpDesk360 API", Version = "v1" });

    // Include XML comments
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// Database Configuration
builder.Services.AddDbContext<HelpDeskDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repository and Service Registration
builder.Services.AddScoped<IRequestRepository, RequestRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddScoped<IRequestService, RequestService>();
builder.Services.AddScoped<IReportService, ReportService>();

// CORS Configuration - Ready for Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Development - Allow Angular dev server
            policy.WithOrigins(
                "http://localhost:4200",  // Angular dev server default
                "http://localhost:3000",  // Alternative dev port
                "https://localhost:4200", // HTTPS dev
                "https://localhost:3000"  // HTTPS alternative
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        }
        else
        {
            // Production - Add your production domains
            policy.WithOrigins(
                "https://yourdomain.com",
                "https://www.yourdomain.com",
                "http://localhost:4200"  // Keep for local frontend testing
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithExposedHeaders("X-Total-Count"); // For pagination headers
        }
    });
});

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter(policyName: "fixed", options =>
    {
        options.PermitLimit = 100;
        options.Window = TimeSpan.FromMinutes(1);
        options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        options.QueueLimit = 10;
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseRateLimiter();

app.UseAuthorization();

app.MapControllers().RequireRateLimiting("fixed");

// Database Migration and Seeding
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<HelpDeskDbContext>();
    try
    {
        context.Database.Migrate();
        app.Logger.LogInformation("Database migration completed successfully");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "An error occurred while migrating the database");
    }
}

app.Run();
