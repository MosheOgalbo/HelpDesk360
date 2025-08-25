# HelpDesk360 Backend API

Enterprise-grade Help Desk Management System built with .NET Core 8, Entity Framework Core, and SQL Server.

## 🏗️ Architecture Overview

### Clean Architecture Implementation
```
HelpDesk360.API/
├── Controllers/          # API endpoints and HTTP handling
├── Services/            # Business logic layer
├── Data/               # Data access layer (EF Core)
├── Models/             # Domain entities
├── DTOs/               # Data Transfer Objects
├── Middleware/         # Custom middleware components
└── Extensions/         # Service configuration extensions
```

### Key Design Patterns
- **Repository Pattern**: Abstracted data access via Entity Framework Core
- **Dependency Injection**: Built-in .NET DI container for loose coupling
- **CQRS-like Separation**: Read/Write operations handled by dedicated services
- **AutoMapper**: Object-to-object mapping between entities and DTOs
- **FluentValidation**: Declarative validation rules

## 🚀 Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | .NET Core | 8.0 | Cross-platform framework |
| **Web Framework** | ASP.NET Core Web API | 8.0 | RESTful API services |
| **ORM** | Entity Framework Core | 8.0 | Data access and migrations |
| **Database** | SQL Server | 2022 | Primary data store |
| **Validation** | FluentValidation | 11.3.0 | Input validation |
| **Mapping** | AutoMapper | 12.0.1 | Object mapping |
| **Logging** | Serilog | 8.0.0 | Structured logging |
| **Documentation** | Swagger/OpenAPI | 6.5.0 | API documentation |
| **Testing** | xUnit + Moq | Latest | Unit testing |

## 📊 Database Schema

### Core Tables
```sql
Requests
├── Id (Primary Key)
├── Name, Phone, Email
├── Description
├── Status, Priority
├── CreatedAt, UpdatedAt, ResolvedAt
└── Indexes: CreatedAt, Email, Status, Priority

Departments
├── Id (Primary Key)
├── Name (Unique), Code (Unique)
├── IsActive
└── CreatedAt, UpdatedAt

RequestDepartments (Many-to-Many Junction)
├── RequestId, DepartmentId (Composite Primary Key)
└── CreatedAt
```

### Performance Optimizations
- **Composite Indexes**: Multi-column indexes for common query patterns
- **Covering Indexes**: Include columns to avoid key lookups
- **Connection Pooling**: Optimized connection management
- **Stored Procedures**: Complex reporting logic at database level

## 🛠️ Setup Instructions

### Prerequisites
- .NET 8 SDK
- SQL Server 2019+ or SQL Server Docker container
- Visual Studio 2022 or VS Code

### 1. Clone and Setup
```bash
# Create new API project
dotnet new webapi -n HelpDesk360.API
cd HelpDesk360.API

# Restore packages
dotnet restore

# Create test project
dotnet new xunit -n HelpDesk360.Tests
dotnet add HelpDesk360.Tests reference HelpDesk360.API
```

### 2. Database Setup
```bash
# Start SQL Server (Docker)
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Passw0rd" \
   -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest

# Run database setup scripts
sqlcmd -S localhost,1433 -U sa -P "YourStrong!Passw0rd" -i sql/init/01-create-database.sql
sqlcmd -S localhost,1433 -U sa -P "YourStrong!Passw0rd" -i sql/init/02-create-tables.sql
sqlcmd -S localhost,1433 -U sa -P "YourStrong!Passw0rd" -i sql/init/03-create-stored-procedures.sql
```

### 3. Configuration
Update `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=HelpDesk360;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=true"
  }
}
```

### 4. Build and Run
```bash
# Build the solution
dotnet build

# Run the API
dotnet run

# Run tests
dotnet test

# Access Swagger UI
# http://localhost:5000 (API runs on port 5000 by default)
```

## 🔒 Security Features

### Authentication & Authorization
- **CORS Policy**: Configured for frontend origins
- **HTTPS Redirection**: Forced HTTPS in production
- **Input Validation**: FluentValidation rules prevent injection
- **SQL Injection Protection**: Parameterized queries via EF Core

### Data Protection
- **Connection String Encryption**: Secured in production
- **Sensitive Data Logging**: Excluded from logs
- **Error Handling**: Generic error messages to prevent information leakage

### Security Headers
```csharp
// Implemented in middleware
app.UseHsts();
app.UseHttpsRedirection();
app.UseCors("AllowedOrigins");
```

## 🚨 Error Handling Strategy

### Global Error Middleware
```csharp
public class ErrorHandlingMiddleware
{
    // Catches unhandled exceptions
    // Returns structured error responses
    // Logs errors with correlation IDs
    // Prevents sensitive information leakage
}
```

### Error Response Format
```json
{
  "error": {
    "message": "User-friendly error message",
    "type": "ArgumentException",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### HTTP Status Codes
| Code | Scenario | Example |
|------|----------|---------|
| 200 | Success | Request retrieved |
| 201 | Created | Request created successfully |
| 400 | Bad Request | Invalid input data |
| 404 | Not Found | Request ID doesn't exist |
| 500 | Internal Error | Database connection failure |

## 📝 API Endpoints

### Requests Management
```http
GET    /api/requests?page=1&pageSize=10     # List with pagination
GET    /api/requests/{id}                   # Get specific request
POST   /api/requests                        # Create new request
PUT    /api/requests/{id}                   # Update existing request
DELETE /api/requests/{id}                   # Delete request
GET    /api/requests/search?term=keyword    # Search requests
```

### Reports & Analytics
```http
GET /api/reports/monthly?year=2024&month=1  # Monthly department report
GET /api/reports/summary?year=2024&month=1  # Report summary statistics
```

### Departments
```http
GET /api/departments                        # List active departments
```

### Sample Request Body
```json
{
  "name": "John Doe",
  "phone": "+1-555-0123",
  "email": "john.doe@company.com",
  "description": "Password reset needed for email account",
  "priority": "High",
  "departmentIds": [1, 2]
}
```

## 🧪 Testing Strategy

### Unit Tests Coverage
- **Services Layer**: Business logic validation
- **Controllers**: HTTP request/response handling
- **Validation**: FluentValidation rules
- **Database**: EF Core configurations

### Test Structure
```
HelpDesk360.Tests/
├── Controllers/         # API endpoint tests
├── Services/           # Business logic tests
├── Helpers/            # Test utilities
└── TestDbContextFactory # In-memory database setup
```

### Running Tests
```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test class
dotnet test --filter "FullyQualifiedName~RequestServiceTests"
```

## 📈 Performance Optimizations

### Database Level
- **Indexing Strategy**: Composite indexes on common query patterns
- **Query Optimization**: INCLUDE columns for covering indexes
- **Stored Procedures**: Complex reports executed at database level
- **Connection Pooling**: Managed by EF Core

### Application Level
- **Async/Await**: Non-blocking operations throughout
- **Pagination**: Large result sets split into pages
- **Caching**: Response caching headers set
- **Memory Optimization**: Using statements for proper disposal

### Monitoring & Profiling
```csharp
// Performance monitoring
services.AddApplicationInsights();
services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>();

// Endpoint: GET /health
```

## 📋 Component Analysis

### Pros ✅
- **Scalability**: Clean architecture supports growth
- **Maintainability**: Separation of concerns and DI
- **Testability**: High test coverage with mocking
- **Performance**: Optimized queries and async operations
- **Security**: Input validation and error handling
- **Documentation**: Swagger/OpenAPI integration
- **Monitoring**: Structured logging with Serilog

### Cons ⚠️
- **Complexity**: Multiple layers might be overkill for simple use cases
- **Learning Curve**: Requires understanding of multiple patterns
- **Initial Setup**: More configuration required than minimal APIs
- **Memory Overhead**: AutoMapper and DI container overhead

### Alternative Approaches
- **Minimal APIs**: For simpler scenarios
- **GraphQL**: For complex client data requirements
- **gRPC**: For high-performance service-to-service communication
- **Event Sourcing**: For complex business domains

## 🔄 CI/CD Integration

### Build Pipeline
```yaml
# Sample GitHub Actions workflow
name: Build and Test API
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      - run: dotnet restore
      - run: dotnet build
      - run: dotnet test --logger trx --collect:"XPlat Code Coverage"
```

### Deployment Commands
```bash
# Development
dotnet run --environment Development

# Production build
dotnet publish -c Release -o ./publish

# Docker deployment
docker build -t helpdesk360-api .
docker run -p 8080:8080 helpdesk360-api
```

## 📚 Documentation

- **Swagger UI**: Available at `/` when running
- **API Specification**: OpenAPI 3.0 compliant
- **Code Documentation**: XML documentation comments
- **Database Schema**: ERD available in `/docs/architecture/`

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Check connection string and SQL Server status
2. **CORS Errors**: Verify frontend origin in allowed CORS origins
3. **Validation Failures**: Check FluentValidation rules and error messages
4. **Performance Issues**: Enable query logging to identify slow queries

### Debug Configuration
```json
{
  "Logging": {
    "LogLevel": {
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
```

---

## 📞 Support

For technical support and questions:
- **Documentation**: Check inline XML comments
- **Issues**: Create GitHub issue with reproduction steps
- **Performance**: Enable detailed logging for analysis
