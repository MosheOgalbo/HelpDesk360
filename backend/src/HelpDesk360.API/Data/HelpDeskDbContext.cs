using Microsoft.EntityFrameworkCore;
using HelpDesk360.API.Models;

namespace HelpDesk360.API.Data
{
    public class HelpDeskDbContext : DbContext
    {
        public HelpDeskDbContext(DbContextOptions<HelpDeskDbContext> options) : base(options)
        {
        }

        public DbSet<Request> Requests { get; set; }
        public DbSet<RequestDepartment> RequestDepartments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Request Configuration
            modelBuilder.Entity<Request>(entity =>
            {
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Priority);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.DepartmentId);
                entity.HasIndex(e => new { e.Status, e.CreatedAt });
                entity.HasIndex(e => new { e.DepartmentId, e.Status });

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.UpdatedAt)
                      .HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(d => d.Department)
                      .WithMany(p => p.Requests)
                      .HasForeignKey(d => d.DepartmentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // RequestDepartment Configuration
            modelBuilder.Entity<RequestDepartment>(entity =>
            {
                entity.HasIndex(e => e.Name).IsUnique();
                entity.HasIndex(e => e.IsActive);

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETUTCDATE()");
            });

            // Seed Data
            modelBuilder.Entity<RequestDepartment>().HasData(
                new RequestDepartment { Id = 1, Name = "IT Support", Description = "Information Technology support requests" },
                new RequestDepartment { Id = 2, Name = "HR", Description = "Human Resources related requests" },
                new RequestDepartment { Id = 3, Name = "Finance", Description = "Financial and accounting requests" },
                new RequestDepartment { Id = 4, Name = "Facilities", Description = "Office facilities and maintenance requests" }
            );
        }
    }
}
