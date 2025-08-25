
namespace HelpDesk360.API.Models;

public class MonthlyReport
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentCode { get; set; } = string.Empty;
    public int CurrentMonthRequests { get; set; }
    public int PreviousMonthRequests { get; set; }
    public int SameMonthLastYearRequests { get; set; }
    public decimal PercentChangeFromPreviousMonth { get; set; }
    public decimal PercentChangeFromSameMonthLastYear { get; set; }
    public decimal AvgResolutionTimeHours { get; set; }
    public int ReportYear { get; set; }
    public int ReportMonth { get; set; }
    public DateTime GeneratedAt { get; set; }
}

public class ReportSummary
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int TotalRequestsCurrentMonth { get; set; }
    public int TotalActiveDepartments { get; set; }
    public decimal OverallAvgResolutionTimeHours { get; set; }
    public int OpenRequests { get; set; }
    public int ResolvedRequests { get; set; }
    public DateTime GeneratedAt { get; set; }
}
