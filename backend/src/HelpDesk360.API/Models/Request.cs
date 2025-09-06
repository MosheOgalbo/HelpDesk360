using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk360.API.Models
{
    public class Request
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int Priority { get; set; } // 1=Low, 2=Medium, 3=High, 4=Critical

        [Required]
        public int Status { get; set; } // 1=Open, 2=InProgress, 3=Resolved, 4=Closed

        [Required]
        public int DepartmentId { get; set; }

        [Required]
        [StringLength(100)]
        public string RequestorName { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string RequestorEmail { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string RequestorPhone { get; set; } = string.Empty;

        [StringLength(100)]
        public string? AssignedTo { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ResolvedAt { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("DepartmentId")]// יותר מפורש
        // [ForeignKey(nameof(DepartmentId))]
        public RequestDepartment Department { get; set; } = null!;
    }
}

/*
ניתן להוסיף enm :
public enum Priority { Low = 1, Medium = 2, High = 3, Critical = 4 }

*/
