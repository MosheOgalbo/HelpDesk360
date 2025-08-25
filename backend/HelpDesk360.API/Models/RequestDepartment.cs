
namespace HelpDesk360.API.Models;

public class RequestDepartment
{
    public int RequestId { get; set; }
    public int DepartmentId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Request Request { get; set; } = null!;
    public Department Department { get; set; } = null!;
}
