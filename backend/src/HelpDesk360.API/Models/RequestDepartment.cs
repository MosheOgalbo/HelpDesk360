using System.ComponentModel.DataAnnotations;

namespace HelpDesk360.API.Models
{
    public class RequestDepartment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Request> Requests { get; set; } = new List<Request>();
    }
}
