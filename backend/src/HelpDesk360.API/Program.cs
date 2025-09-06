using Microsoft.EntityFrameworkCore;
using HelpDesk360.API.Data;
using HelpDesk360.API.Repositories;
using HelpDesk360.API.Services;
using Serilog;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using HelpDesk360.API.Models;

var builder = WebApplication.CreateBuilder(args);

// ----------------------------
// Configure Serilog Logging
// ----------------------------
builder.Host.UseSerilog((context, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration) // קריאת הגדרות מה-appsettings
        .WriteTo.Console()                               // לוגים בקונסול
        .WriteTo.File("logs/helpdesk360-.txt", rollingInterval: RollingInterval.Day); // לוגים לקובץ יומי
});

// ----------------------------
// Add Services to DI Container
// ----------------------------
builder.Services.AddControllers(); // מוסיף תמיכה ב-Controllers
builder.Services.AddEndpointsApiExplorer(); // מייצר מטא-נתונים עבור Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "HelpDesk360 API", Version = "v1" });

    // Include XML comments (ל־Swagger תיעוד)
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// ----------------------------
// Configure Database (MySQL)
// ----------------------------
builder.Services.AddDbContext<HelpDeskDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

// ----------------------------
// Register Repositories & Services
// ----------------------------
builder.Services.AddScoped<IRequestRepository, RequestRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddScoped<IRequestService, RequestService>();
builder.Services.AddScoped<IReportService, ReportService>();

// ----------------------------
// CORS Configuration
// ----------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // פיתוח - מאפשר localhost לפורטים שונים
            policy.WithOrigins(
                "http://localhost:4200",
                "http://localhost:3000",
                "https://localhost:4200",
                "https://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        }
        else
        {
            // Production - הוספת דומיינים אמיתיים
            policy.WithOrigins(
                "https://yourdomain.com",
                "https://www.yourdomain.com",
                "http://localhost:4200"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithExposedHeaders("X-Total-Count"); // שימוש בכותרות pagination
        }
    });
});

// ----------------------------
// Rate Limiting
// ----------------------------
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter(policyName: "fixed", options =>
    {
        options.PermitLimit = 100;                    // מספר מקסימום בקשות
        options.Window = TimeSpan.FromMinutes(1);    // חלון זמן 1 דקה
        options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        options.QueueLimit = 10;                      // מספר בקשות בתור
    });
});

var app = builder.Build();

// ----------------------------
// Configure Middleware Pipeline
// ----------------------------
app.UseSwagger(); // מאפשר Swagger UI
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "HelpDesk360 API v1");
    c.RoutePrefix = "swagger"; // ניתן לגשת ל- /swagger
});

// Redirect root "/" ל-Swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

// Cors & Rate Limiting middleware
app.UseCors("AllowFrontend");
app.UseRateLimiter();

app.UseAuthorization();
app.MapControllers().RequireRateLimiting("fixed");

// ----------------------------
// Database Migration & Seeding
// ----------------------------
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<HelpDeskDbContext>();
    try
    {
        // Apply any pending migrations automatically
        context.Database.Migrate();
        app.Logger.LogInformation("Database migration completed successfully");

        // יצירת Stored Procedure לדוח חודשי
        try
        {
            context.Database.ExecuteSqlRaw("DROP PROCEDURE IF EXISTS sp_GetMonthlyRequestsReport");
            context.Database.ExecuteSqlRaw(@"
                CREATE PROCEDURE sp_GetMonthlyRequestsReport(
                    IN p_Year INT,
                    IN p_Month INT
                )
                BEGIN
                    DECLARE v_StartDate DATETIME;
                    DECLARE v_EndDate DATETIME;

                    SET v_StartDate = STR_TO_DATE(CONCAT(p_Year, '-', LPAD(p_Month, 2, '0'), '-01'), '%Y-%m-%d');
                    SET v_EndDate = DATE_ADD(v_StartDate, INTERVAL 1 MONTH);

                    SELECT
                        COUNT(*) as TotalRequests,
                        COUNT(CASE WHEN Status = 1 THEN 1 END) as OpenRequests,
                        COUNT(CASE WHEN Status = 2 THEN 1 END) as InProgressRequests,
                        COUNT(CASE WHEN Status = 3 THEN 1 END) as ResolvedRequests,
                        COUNT(CASE WHEN Status = 4 THEN 1 END) as ClosedRequests,
                        COALESCE(AVG(CASE WHEN ResolvedAt IS NOT NULL THEN TIMESTAMPDIFF(HOUR, CreatedAt, ResolvedAt) END), 0) as AverageResolutionHours,
                        COUNT(CASE WHEN Priority = 4 THEN 1 END) as CriticalRequests,
                        COUNT(CASE WHEN Priority = 3 THEN 1 END) as HighRequests,
                        COUNT(CASE WHEN Priority = 2 THEN 1 END) as MediumRequests,
                        COUNT(CASE WHEN Priority = 1 THEN 1 END) as LowRequests,
                        0 as PreviousMonthTotal,
                        0 as TotalChangeFromPrevious,
                        0.0 as TotalChangePercentage,
                        0 as PreviousYearSameMonthTotal,
                        0 as TotalChangeFromPreviousYear,
                        0.0 as TotalChangePercentageFromPreviousYear
                    FROM Requests
                    WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate;
                END");
            app.Logger.LogInformation("Stored procedure created successfully");
        }
        catch (Exception ex)
        {
            app.Logger.LogError(ex, "Failed to create stored procedure: {ErrorMessage}", ex.Message);
        }

        // Seed Departments אם אין נתונים
        if (!context.RequestDepartments.Any())
        {
            var departments = new List<RequestDepartment>
            {
                new RequestDepartment { Name = "IT Support", Description = "Information Technology support requests", IsActive = true },
                new RequestDepartment { Name = "HR", Description = "Human Resources related requests", IsActive = true },
                new RequestDepartment { Name = "Finance", Description = "Financial and accounting requests", IsActive = true },
                new RequestDepartment { Name = "Facilities", Description = "Office facilities and maintenance requests", IsActive = true }
            };

            context.RequestDepartments.AddRange(departments);
            context.SaveChanges();
            app.Logger.LogInformation("Database seeded with default departments");
        }

        // Seed Sample Requests אם אין נתונים
        if (!context.Requests.Any())
        {
            var itDepartment = context.RequestDepartments.FirstOrDefault(d => d.Name == "IT Support");
            var hrDepartment = context.RequestDepartments.FirstOrDefault(d => d.Name == "HR");
            var financeDepartment = context.RequestDepartments.FirstOrDefault(d => d.Name == "Finance");

            if (itDepartment != null && hrDepartment != null && financeDepartment != null)
            {
                var requests = new List<Request>
                {
                    new Request
                    {
                        Title = "Test Request - Email Issue",
                        Description = "Cannot access company email since this morning. Need urgent assistance.",
                        Priority = 3,
                        Status = 1,
                        DepartmentId = itDepartment.Id,
                        RequestorName = "John Doe",
                        RequestorEmail = "john@company.com",
                        RequestorPhone = "050-1234567",
                        CreatedAt = DateTime.UtcNow.AddDays(-2),
                        UpdatedAt = DateTime.UtcNow.AddDays(-2)
                    },
                    new Request
                    {
                        Title = "New Employee Setup",
                        Description = "Need laptop and system accounts setup for new hire starting Monday.",
                        Priority = 2,
                        Status = 2,
                        DepartmentId = itDepartment.Id,
                        RequestorName = "HR Manager",
                        RequestorEmail = "hr@company.com",
                        RequestorPhone = "050-7654321",
                        AssignedTo = "IT Team",
                        CreatedAt = DateTime.UtcNow.AddDays(-1),
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Request
                    {
                        Title = "Budget Question",
                        Description = "Need clarification on Q4 budget allocation for department expenses.",
                        Priority = 1,
                        Status = 1,
                        DepartmentId = financeDepartment.Id,
                        RequestorName = "Finance Lead",
                        RequestorEmail = "finance@company.com",
                        RequestorPhone = "050-9876543",
                        CreatedAt = DateTime.UtcNow.AddHours(-6),
                        UpdatedAt = DateTime.UtcNow.AddHours(-6)
                    }
                };

                context.Requests.AddRange(requests);
                context.SaveChanges();
                app.Logger.LogInformation("Database seeded with sample requests");
            }
        }

        var requestCount = context.Requests.Count();
        var departmentCount = context.RequestDepartments.Count();
        app.Logger.LogInformation("Database ready: {DepartmentCount} departments, {RequestCount} requests", departmentCount, requestCount);

    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "An error occurred while migrating or seeding the database. Details: {ErrorMessage}", ex.Message);
        // המשך ריצה גם אם קרתה שגיאה
    }
}

// ----------------------------
// Run the app
// ----------------------------
app.Run();
