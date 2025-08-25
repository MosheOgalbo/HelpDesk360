
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using HelpDesk360.API.Data;
using HelpDesk360.API.Models;
using HelpDesk360.API.Services.Interfaces;

namespace HelpDesk360.API.Services;

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ReportService> _logger;

    public ReportService(ApplicationDbContext context, ILogger<ReportService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<MonthlyReport>> GetMonthlySupportReportAsync(int year, int month)
    {
        try
        {
            var yearParam = new SqlParameter("@Year", year);
            var monthParam = new SqlParameter("@Month", month);

            var reports = await _context.Database
                .SqlQueryRaw<MonthlyReport>(
                    "EXEC GetMonthlySupportReport @Year, @Month",
                    yearParam, monthParam)
                .ToListAsync();

            _logger.LogInformation("Retrieved monthly report for {Year}-{Month}", year, month);
            return reports;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving monthly report for {Year}-{Month}", year, month);
            throw;
        }
    }

    public async Task<ReportSummary> GetReportSummaryAsync(int year, int month)
    {
        try
        {
            var yearParam = new SqlParameter("@Year", year);
            var monthParam = new SqlParameter("@Month", month);

            var summary = await _context.Database
                .SqlQueryRaw<ReportSummary>(
                    "EXEC GetMonthlySupportReport @Year, @Month",
                    yearParam, monthParam)
                .FirstOrDefaultAsync();

            _logger.LogInformation("Retrieved report summary for {Year}-{Month}", year, month);
            return summary ?? new ReportSummary { Year = year, Month = month };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving report summary for {Year}-{Month}", year, month);
            throw;
        }
    }
}
