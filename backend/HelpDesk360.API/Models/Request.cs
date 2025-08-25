
using System.ComponentModel.DataAnnotations;

namespace HelpDesk360.API.Models;

public class Request
{
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    [Phone]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [StringLength(320)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [StringLength(50)]
    public string Status { get; set; } = "Open";

    [StringLength(20)]
    public string Priority { get; set; } = "Medium";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }

    // Navigation properties
    public ICollection<RequestDepartment> RequestDepartments { get; set; } = new List<RequestDepartment>();
    public ICollection<Department> Departments { get; set; } = new List<Department>();
}
