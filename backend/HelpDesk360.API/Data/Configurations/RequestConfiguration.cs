
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HelpDesk360.API.Models;

namespace HelpDesk360.API.Data.Configurations;

public class RequestConfiguration : IEntityTypeConfiguration<Request>
{
    public void Configure(EntityTypeBuilder<Request> builder)
    {
        builder.ToTable("Requests");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Phone)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.Email)
            .IsRequired()
            .HasMaxLength(320);

        builder.Property(r => r.Description)
            .IsRequired();

        builder.Property(r => r.Status)
            .HasMaxLength(50)
            .HasDefaultValue("Open");

        builder.Property(r => r.Priority)
            .HasMaxLength(20)
            .HasDefaultValue("Medium");

        builder.Property(r => r.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(r => r.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(r => r.CreatedAt);
        builder.HasIndex(r => r.Email);
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.Priority);

        // Many-to-many relationship with Departments
        builder.HasMany(r => r.Departments)
            .WithMany(d => d.Requests)
            .UsingEntity<RequestDepartment>(
                j => j.HasOne(rd => rd.Department)
                    .WithMany(d => d.RequestDepartments)
                    .HasForeignKey(rd => rd.DepartmentId),
                j => j.HasOne(rd => rd.Request)
                    .WithMany(r => r.RequestDepartments)
                    .HasForeignKey(rd => rd.RequestId),
                j => {
                    j.ToTable("RequestDepartments");
                    j.HasKey(rd => new { rd.RequestId, rd.DepartmentId });
                    j.Property(rd => rd.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                });
    }
}
