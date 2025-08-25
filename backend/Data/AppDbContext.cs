using HelpDesk360.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk360.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<SupportRequest> SupportRequests => Set<SupportRequest>();
        public DbSet<Department> Departments => Set<Department>();
        public DbSet<SupportRequestDepartment> SupportRequestDepartments => Set<SupportRequestDepartment>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<SupportRequestDepartment>()
                .HasKey(x => new { x.SupportRequestId, x.DepartmentId });

            modelBuilder.Entity<SupportRequestDepartment>()
                .HasOne(srd => srd.SupportRequest)
                .WithMany(sr => sr.SupportRequestDepartments)
                .HasForeignKey(srd => srd.SupportRequestId);

            modelBuilder.Entity<SupportRequestDepartment>()
                .HasOne(srd => srd.Department)
                .WithMany(d => d.SupportRequestDepartments)
                .HasForeignKey(srd => srd.DepartmentId);

            // Seed a few departments
            modelBuilder.Entity<Department>().HasData(
                new Department { Id = 1, Name = "IT" },
                new Department { Id = 2, Name = "HR" },
                new Department { Id = 3, Name = "Finance" },
                new Department { Id = 4, Name = "Facilities" }
            );
        }
    }

    public static class DbInitializer
    {
        public static async Task MigrateAndSeedAsync(IApplicationBuilder app, ILogger logger)
        {
            using var scope = app.ApplicationServices.CreateScope();
            var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await ctx.Database.MigrateAsync();

            // Ensure seed departments exist (in case migration didn't run seed for some providers)
            if (!ctx.Departments.Any())
            {
                ctx.Departments.AddRange(
                    new Department { Name = "IT" },
                    new Department { Name = "HR" },
                    new Department { Name = "Finance" },
                    new Department { Name = "Facilities" }
                );
                await ctx.SaveChangesAsync();
            }
            logger.LogInformation("Database migrated and seeded");
        }
    }
}
