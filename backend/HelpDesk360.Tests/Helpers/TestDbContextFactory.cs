
using Microsoft.EntityFrameworkCore;
using HelpDesk360.API.Data;
using HelpDesk360.API.Models;

namespace HelpDesk360.Tests.Helpers;

public static class TestDbContextFactory
{
    public static ApplicationDbContext CreateInMemoryDbContext(string databaseName = null)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;

        var context = new ApplicationDbContext(options);

        // Seed test data
        SeedTestData(context);

        return context;
    }

    private static void SeedTestData(ApplicationDbContext context)
    {
        // Clear existing data
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();

        // Add test departments
        var departments = new List<Department>
        {
            new Department { Id = 1, Name = "Information Technology", Code = "IT", IsActive = true },
            new Department { Id = 2, Name = "Human Resources", Code = "HR", IsActive = true },
            new Department { Id = 3, Name = "Finance", Code = "FIN", IsActive = true },
            new Department { Id = 4, Name = "Operations", Code = "OPS", IsActive = false }
        };

        context.Departments.AddRange(departments);
        context.SaveChanges();

        // Add test requests
        var requests = new List<Request>
        {
            new Request
            {
                Id = 1,
                Name = "John Doe",
                Phone = "+1-555-0123",
                Email = "john.doe@test.com",
                Description = "Test request description for IT support",
                Status = "Open",
                Priority = "High",
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                UpdatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new Request
            {
                Id = 2,
                Name = "Jane Smith",
                Phone = "+1-555-0124",
                Email = "jane.smith@test.com",
                Description = "HR related query about employee benefits",
                Status = "Resolved",
                Priority = "Medium",
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                UpdatedAt = DateTime.UtcNow.AddDays(-2),
                ResolvedAt = DateTime.UtcNow.AddDays(-2)
            }
        };

        context.Requests.AddRange(requests);
        context.SaveChanges();

        // Add request-department relationships
        var requestDepartments = new List<RequestDepartment>
        {
            new RequestDepartment { RequestId = 1, DepartmentId = 1 },
            new RequestDepartment { RequestId = 2, DepartmentId = 2 }
        };

        context.RequestDepartments.AddRange(requestDepartments);
        context.SaveChanges();
    }
}
