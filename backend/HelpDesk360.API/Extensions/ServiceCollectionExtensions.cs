
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using Serilog;
using HelpDesk360.API.Data;
using HelpDesk360.API.Services;
using HelpDesk360.API.Services.Interfaces;
using HelpDesk360.API.DTOs;

namespace HelpDesk360.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // AutoMapper
        services.AddAutoMapper(typeof(Program));

        // FluentValidation
        services.AddValidatorsFromAssemblyContaining<CreateRequestDtoValidator>();

        // Services
        services.AddScoped<IRequestService, RequestService>();
        services.AddScoped<IReportService, ReportService>();

        // CORS
        services.AddCors(options =>
        {
            options.AddPolicy("AllowedOrigins", policy =>
            {
                policy.WithOrigins(
                    "http://localhost:4200",
                    "http://localhost:3000",
                    "https://localhost:4200",
                    "https://localhost:3000")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .SetIsOriginAllowed(_ => true); // Allow any origin in development
            });
        });

        // API Documentation
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new()
            {
                Title = "HelpDesk360 API",
                Version = "v1",
                Description = "Enterprise Help Desk Management System API",
                Contact = new()
                {
                    Name = "HelpDesk360 Support",
                    Email = "support@helpdesk360.com"
                }
            });

            // Include XML comments
            var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath);
            }
        });

        // Health Checks
        services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>();

        return services;
    }

    public static IServiceCollection AddSerilogLogging(this IServiceCollection services, IConfiguration configuration)
    {
        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(configuration)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File("logs/helpdesk360-.txt", rollingInterval: RollingInterval.Day)
            .CreateLogger();

        services.AddSerilog();

        return services;
    }
}
