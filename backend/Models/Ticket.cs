using System.ComponentModel.DataAnnotations;

namespace HelpDesk360.API.Models
{
    public class Ticket
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "שם הוא שדה חובה")]
        [StringLength(255, ErrorMessage = "שם לא יכול להיות יותר מ-255 תווים")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "טלפון הוא שדה חובה")]
        [Phone(ErrorMessage = "פורמט טלפון לא תקין")]
        public string Phone { get; set; } = string.Empty;

        [Required(ErrorMessage = "אימייל הוא שדה חובה")]
        [EmailAddress(ErrorMessage = "פורמט אימייל לא תקין")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "חובה לבחור לפחות מחלקה אחת")]
        [MinLength(1, ErrorMessage = "חובה לבחור לפחות מחלקה אחת")]
        public List<int> DepartmentIds { get; set; } = new();

        [Required(ErrorMessage = "תיאור הוא שדה חובה")]
        [StringLength(2000, MinimumLength = 10, ErrorMessage = "התיאור חייב להיות בין 10 ל-2000 תווים")]
        public string Description { get; set; } = string.Empty;

        public string Status { get; set; } = "Open";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual List<Department> Departments { get; set; } = new();
    }

    public class Department
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public virtual List<Ticket> Tickets { get; set; } = new();
    }
}
