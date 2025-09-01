using System.ComponentModel.DataAnnotations;

namespace HelpDesk360.API.DTOs
{
    public class CreateRequestDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(1, 4)]
        public int Priority { get; set; }

        [Required]
        public int DepartmentId { get; set; }

        [Required]
        [StringLength(100)]
        public string RequestorName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string RequestorEmail { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^[\d\-\+\(\)\s]+$", ErrorMessage = "Phone number format is invalid")]
        [StringLength(20)]
        public string RequestorPhone { get; set; } = string.Empty;
    }
}
