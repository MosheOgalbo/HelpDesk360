namespace HelpDesk360.API.DTOs
{
    public class RequestDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Priority { get; set; }
        public string PriorityName => GetPriorityName(Priority);
        public int Status { get; set; }
        public string StatusName => GetStatusName(Status);
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string RequestorName { get; set; } = string.Empty;
        public string RequestorEmail { get; set; } = string.Empty;
        public string RequestorPhone { get; set; } = string.Empty;
        public string? AssignedTo { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        private static string GetPriorityName(int priority) => priority switch
        {
            1 => "Low",
            2 => "Medium",
            3 => "High",
            4 => "Critical",
            _ => "Unknown"
        };

        private static string GetStatusName(int status) => status switch
        {
            1 => "Open",
            2 => "In Progress",
            3 => "Resolved",
            4 => "Closed",
            _ => "Unknown"
        };
    }
}
