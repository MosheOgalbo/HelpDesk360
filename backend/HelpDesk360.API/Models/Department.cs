
using System.ComponentModel.DataAnnotations;

namespace HelpDesk360.API.Models;

public class Department
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(10)]
    public string Code { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<RequestDepartment> RequestDepartments { get; set; } = new List<RequestDepartment>();
    public ICollection<Request> Requests { get; set; } = new List<Request>();
}
