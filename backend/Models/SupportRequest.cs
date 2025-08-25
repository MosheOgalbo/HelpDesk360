using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HelpDesk360.API.Models
{
    public class SupportRequest
    {
        public int Id { get; set; }

        [Required, MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(30)]
        public string Phone { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public ICollection<SupportRequestDepartment> SupportRequestDepartments { get; set; } = new List<SupportRequestDepartment>();
    }

    public class Department
    {
        public int Id { get; set; }
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public ICollection<SupportRequestDepartment> SupportRequestDepartments { get; set; } = new List<SupportRequestDepartment>();
    }

    public class SupportRequestDepartment
    {
        public int SupportRequestId { get; set; }
        public SupportRequest SupportRequest { get; set; } = default!;

        public int DepartmentId { get; set; }
        public Department Department { get; set; } = default!;
    }

    public record SupportRequestDto(
        int? Id,
        string Name,
        string Phone,
        string Email,
        List<int> DepartmentIds,
        string Description,
        DateTime? CreatedAtUtc = null
    );
}
