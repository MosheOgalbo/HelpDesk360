
using HelpDesk360.API.Models;

namespace HelpDesk360.API.Services.Interfaces;

public interface IReportService
{
    Task<IEnumerable<MonthlyReport>> GetMonthlySupportReportAsync(int year, int month);
    Task<ReportSummary> GetReportSummaryAsync(int year, int month);
}
