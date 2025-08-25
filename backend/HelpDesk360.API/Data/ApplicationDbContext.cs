
using Microsoft.EntityFrameworkCore;
using HelpDesk360.API.Models;
using HelpDesk360.API.Data.Configurations;

namespace HelpDesk360.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Request> Requests { get; set; } = null!;
    public DbSet<Department> Departments { get; set; } = null!;
    public DbSet<RequestDepartment> RequestDepartments { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations
        modelBuilder.ApplyConfiguration(new RequestConfiguration());
        modelBuilder.ApplyConfiguration(new DepartmentConfiguration());
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is Request && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entityEntry in entries)
        {
            if (entityEntry.Entity is Request request)
            {
                if (entityEntry.State == EntityState.Added)
                {
                    request.CreatedAt = DateTime.UtcNow;
                }
                request.UpdatedAt = DateTime.UtcNow;

                // Set resolved date when status changes to Resolved
                if (request.Status == "Resolved" && request.ResolvedAt == null)
                {
                    request.ResolvedAt = DateTime.UtcNow;
                }
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
