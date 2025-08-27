namespace HelpDesk360.API.DTOs
{
    public class MonthlyReportDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public int TotalRequests { get; set; }
        public int OpenRequests { get; set; }
        public int InProgressRequests { get; set; }
        public int ResolvedRequests { get; set; }
        public int ClosedRequests { get; set; }
        public double AverageResolutionHours { get; set; }
        public int CriticalRequests { get; set; }
        public int HighRequests { get; set; }
        public int MediumRequests { get; set; }
        public int LowRequests { get; set; }

        // Comparison with previous month
        public int PreviousMonthTotal { get; set; }
        public int TotalChangeFromPrevious { get; set; }
        public double TotalChangePercentage { get; set; }

        // Comparison with same month previous year
        public int PreviousYearSameMonthTotal { get; set; }
        public int TotalChangeFromPreviousYear { get; set; }
        public double TotalChangePercentageFromPreviousYear { get; set; }

        public List<DepartmentStatDto> DepartmentStats { get; set; } = new();
    }

    public class DepartmentStatDto
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int RequestCount { get; set; }
        public double AverageResolutionHours { get; set; }
        public double Percentage { get; set; }
    }
}
