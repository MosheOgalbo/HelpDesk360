# HelpDesk360 Backend System

A comprehensive help desk management system built with .NET 8, SQL Server, and Docker.

## 🏗️ Project Structure

```
HelpDesk360/
├── src/
│   ├── HelpDesk360.API/
│   │   ├── Controllers/
│   │   │   ├── RequestsController.cs
│   │   │   └── ReportsController.cs
│   │   ├── DTOs/
│   │   │   ├── RequestDto.cs
│   │   │   ├── CreateRequestDto.cs
│   │   │   ├── UpdateRequestDto.cs
│   │   │   └── MonthlyReportDto.cs
│   │   ├── Services/
│   │   │   ├── IRequestService.cs
│   │   │   ├── RequestService.cs
│   │   │   ├── IReportService.cs
│   │   │   └── ReportService.cs
│   │   ├── Repositories/
│   │   │   ├── IRequestRepository.cs
│   │   │   ├── RequestRepository.cs
│   │   │   ├── IReportRepository.cs
│   │   │   └── ReportRepository.cs
│   │   ├── Models/
│   │   │   ├── Request.cs
│   │   │   └── RequestDepartment.cs
│   │   ├── Data/
│   │   │   └── ApplicationDbContext.cs
│   │   ├── Middleware/
│   │   │   └── ErrorHandlingMiddleware.cs
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── HelpDesk360.API.csproj
│   └── HelpDesk360.Domain/
│       ├── Entities/
│       ├── Enums/
│       └── HelpDesk360.Domain.csproj
├── tests/
│   └── HelpDesk360.Tests/
│       ├── Controllers/
│       ├── Services/
│       ├── Repositories/
│       └── HelpDesk360.Tests.csproj
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── init.sql
├── docs/
│   └── database/
│       ├── DDL.sql
│       └── StoredProcedures.sql
├── README.md
└── HelpDesk360.sln
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- .NET 8 SDK (for development)
- Git

### One-Step Startup (Hebrew Commands)

```bash
# שכפל את הפרויקט
git clone <repository-url>
cd HelpDesk360

# הרץ את כל המערכת בדוקר
docker-compose up --build

# המתן כמה שניות להתחלת המסד נתונים ואז בדוק את ה-API
curl http://localhost:8080/api/requests
```

### Manual Development Setup

```bash
# שחזר חבילות
dotnet restore

# בנה את הפרויקט
dotnet build

# הרץ בסביבת פיתוח
dotnet run --project src/HelpDesk360.API

# הרץ טסטים
dotnet test
```

## 📊 Database Schema

### Tables
- **Requests**: Main help desk requests
- **RequestDepartments**: Department lookup table

### Key Indexes
- Clustered: `IX_Requests_CreatedDate_Status`
- Non-Clustered: `IX_Requests_DepartmentId`, `IX_Requests_Status`

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests` | Get all requests with pagination |
| GET | `/api/requests/{id}` | Get request by ID |
| POST | `/api/requests` | Create new request |
| PUT | `/api/requests/{id}` | Update existing request |
| DELETE | `/api/requests/{id}` | Delete request |
| GET | `/api/reports/monthly?year=2024&month=1` | Monthly reports |

### Request Schema
```json
{
  "id": 1,
  "title": "Login Issue",
  "description": "Cannot access system",
  "status": "Open",
  "priority": "High",
  "departmentId": 1,
  "createdDate": "2024-01-15T10:30:00Z",
  "updatedDate": "2024-01-15T10:30:00Z"
}
```

### Monthly Report Schema
```json
{
  "year": 2024,
  "month": 1,
  "totalRequests": 150,
  "openRequests": 45,
  "closedRequests": 105,
  "avgResolutionTime": 2.5,
  "comparisonWithPreviousMonth": {
    "requestsChange": 15,
    "percentageChange": 11.1
  },
  "comparisonWithSameMonthLastYear": {
    "requestsChange": -5,
    "percentageChange": -3.2
  },
  "departmentBreakdown": [
    {
      "departmentName": "IT",
      "requestCount": 75,
      "percentage": 50.0
    }
  ]
}
```

## 🔒 Security Features

### Authentication & Authorization
- JWT Bearer token authentication
- Role-based access control
- API key authentication for service-to-service calls

### Rate Limiting
```csharp
// 100 requests per minute per client
services.AddRateLimiter(options => {
    options.AddFixedWindowLimiter("ApiPolicy", opt => {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
    });
});
```

### CORS Configuration
```csharp
services.AddCors(options => {
    options.AddPolicy("AllowFrontend", builder => {
        builder.WithOrigins("http://localhost:3000", "https://helpdesk360.com")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
```

### Secrets Management
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=HelpDesk360;User Id=sa;Password=***;TrustServerCertificate=true;"
  },
  "JwtSettings": {
    "SecretKey": "***",
    "Issuer": "HelpDesk360",
    "Audience": "HelpDesk360-Client",
    "ExpirationMinutes": 60
  }
}
```

## 📝 Logging with Serilog

### Configuration
```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/helpdesk-.txt",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7)
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();
```

### Usage in Controllers
```csharp
[HttpPost]
public async Task<IActionResult> CreateRequest(CreateRequestDto dto)
{
    _logger.LogInformation("Creating new request: {Title}", dto.Title);

    try
    {
        var result = await _requestService.CreateRequestAsync(dto);
        _logger.LogInformation("Request created successfully with ID: {RequestId}", result.Id);
        return CreatedAtAction(nameof(GetRequest), new { id = result.Id }, result);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error creating request: {Title}", dto.Title);
        throw;
    }
}
```

## ⚡ Performance Optimization

### Database Level
1. **Indexing Strategy**
   - Clustered index on (CreatedDate, Status) for time-based queries
   - Non-clustered indexes on foreign keys and frequently filtered columns
   - Include columns in indexes to avoid key lookups

2. **Partitioning** (For large datasets)
   ```sql
   -- Partition by CreatedDate (monthly partitions)
   CREATE PARTITION FUNCTION pf_Requests(DATETIME2)
   AS RANGE RIGHT FOR VALUES
   ('2024-01-01', '2024-02-01', '2024-03-01', ...);
   ```

3. **Computed Columns**
   ```sql
   ALTER TABLE Requests
   ADD ResolutionTimeHours AS
   DATEDIFF(HOUR, CreatedDate, ISNULL(ResolvedDate, GETDATE()));
   ```

4. **Archiving Strategy**
   - Move requests older than 2 years to archive tables
   - Implement sliding window maintenance

### Application Level
1. **Caching**
   ```csharp
   services.AddMemoryCache();
   services.AddStackExchangeRedisCache(options => {
       options.Configuration = "localhost:6379";
   });
   ```

2. **Async/Await Pattern**
   - All database operations use async methods
   - Proper ConfigureAwait(false) usage

3. **Connection Pooling**
   ```csharp
   services.AddDbContext<ApplicationDbContext>(options => {
       options.UseSqlServer(connectionString, sqlOptions => {
           sqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
       });
   }, ServiceLifetime.Scoped);
   ```

## 📈 Monitoring & Health Checks

### Health Checks
```csharp
services.AddHealthChecks()
    .AddSqlServer(connectionString)
    .AddCheck("external-api", new ExternalApiHealthCheck());

app.MapHealthChecks("/health");
```

### Metrics
- Request count and duration
- Database query performance
- Error rates by endpoint
- Memory and CPU usage

## 🧪 Testing Strategy

### Unit Tests
- Controllers with mocked dependencies
- Service layer business logic
- Repository data access patterns

### Integration Tests
- API endpoints with test database
- Database stored procedure validation

### Test Commands
```bash
# הרץ כל הטסטים
dotnet test

# הרץ טסטים עם כיסוי קוד
dotnet test --collect:"XPlat Code Coverage"

# הרץ רק טסטים יחידה
dotnet test --filter Category=Unit
```

## 🐳 Docker Configuration

### Multi-stage Dockerfile
- Optimized build process
- Small production image
- Health checks included

### Docker Compose Features
- SQL Server with persistent volume
- Environment variable management
- Network configuration
- Development/Production profiles

## 📦 Deployment

### Production Environment Variables
```bash
export ASPNETCORE_ENVIRONMENT=Production
export CONNECTION_STRINGS__DEFAULTCONNECTION="..."
export JWT_SETTINGS__SECRETKEY="..."
```

### CI/CD Pipeline
1. Build and test
2. Docker image creation
3. Security scanning
4. Deployment to staging
5. Production deployment with blue-green strategy

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # בדוק חיבור למסד נתונים
   docker exec -it helpdesk360-db-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourPassword123!
   ```

2. **Performance Issues**
   - Check query execution plans
   - Monitor index usage
   - Review connection pool metrics

3. **Memory Leaks**
   - Profile with dotMemory or PerfView
   - Review disposal patterns
   - Check event handler subscriptions

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the troubleshooting guide

---

**Version**: 1.0.0
**Last Updated**: January 2025
**License**: MIT
