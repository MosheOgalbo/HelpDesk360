using System.ComponentModel.DataAnnotations;

namespace HelpDesk360.API.DTOs
{
    public class UpdateRequestDto
    {
        [StringLength(200)]
        public string? Title { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        [Range(1, 4)]
        public int? Priority { get; set; }

        [Range(1, 4)]
        public int? Status { get; set; }

        public int? DepartmentId { get; set; }

        [Phone]
        [StringLength(20)]
        public string? RequestorPhone { get; set; }

        [StringLength(100)]
        public string? AssignedTo { get; set; }
    }
}
