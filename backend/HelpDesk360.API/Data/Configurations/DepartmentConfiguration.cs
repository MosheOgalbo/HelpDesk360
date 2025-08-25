
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HelpDesk360.API.Models;

namespace HelpDesk360.API.Data.Configurations;

public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("Departments");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.Code)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(d => d.IsActive)
            .HasDefaultValue(true);

        builder.Property(d => d.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(d => d.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Unique constraints
        builder.HasIndex(d => d.Name).IsUnique();
        builder.HasIndex(d => d.Code).IsUnique();

        // Seed data
        builder.HasData(
            new Department { Id = 1, Name = "Information Technology", Code = "IT" },
            new Department { Id = 2, Name = "Human Resources", Code = "HR" },
            new Department { Id = 3, Name = "Finance", Code = "FIN" },
            new Department { Id = 4, Name = "Operations", Code = "OPS" },
            new Department { Id = 5, Name = "Marketing", Code = "MKT" },
            new Department { Id = 6, Name = "Legal", Code = "LEG" },
            new Department { Id = 7, Name = "Administration", Code = "ADM" }
        );
    }
}
