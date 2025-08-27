using Microsoft.EntityFrameworkCore;
using HelpDesk360.API.Data;
using HelpDesk360.API.DTOs;
using HelpDesk360.API.Repositories;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Globalization;

namespace HelpDesk360.API.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly HelpDeskDbContext _context;

        public ReportRepository(HelpDeskDbContext context)
        {
            _context = context;
        }

        public async Task<MonthlyReportDto?> GetMonthlyReportAsync(int year, int month)
        {
            var parameters = new[]
            {
                new SqlParameter("@Year", year),
                new SqlParameter("@Month", month)
            };

            var result = await _context.Database
                .SqlQueryRaw<MonthlyReportResult>("EXEC sp_GetMonthlyRequestsReport @Year, @Month", parameters)
                .ToListAsync();

            if (!result.Any()) return null;

            var mainData = result.First();
            var departmentStats = result.Where(r => r.DepartmentId.HasValue)
                .Select(r => new DepartmentStatDto
                {
                    DepartmentId = r.DepartmentId!.Value,
                    DepartmentName = r.DepartmentName ?? "",
                    RequestCount = r.DeptRequestCount ?? 0,
                    AverageResolutionHours = r.DeptAverageResolutionHours ?? 0,
                    Percentage = r.DeptPercentage ?? 0
                }).ToList();

            return new MonthlyReportDto
            {
                Year = year,
                Month = month,
                MonthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(month),
                TotalRequests = mainData.TotalRequests,
                OpenRequests = mainData.OpenRequests,
                InProgressRequests = mainData.InProgressRequests,
                ResolvedRequests = mainData.ResolvedRequests,
                ClosedRequests = mainData.ClosedRequests,
                AverageResolutionHours = mainData.AverageResolutionHours,
                CriticalRequests = mainData.CriticalRequests,
                HighRequests = mainData.HighRequests,
                MediumRequests = mainData.MediumRequests,
                LowRequests = mainData.LowRequests,
                PreviousMonthTotal = mainData.PreviousMonthTotal,
                TotalChangeFromPrevious = mainData.TotalChangeFromPrevious,
                TotalChangePercentage = mainData.TotalChangePercentage,
                PreviousYearSameMonthTotal = mainData.PreviousYearSameMonthTotal,
                TotalChangeFromPreviousYear = mainData.TotalChangeFromPreviousYear,
                TotalChangePercentageFromPreviousYear = mainData.TotalChangePercentageFromPreviousYear,
                DepartmentStats = departmentStats
            };
        }
    }

    public class MonthlyReportResult
    {
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
        public int PreviousMonthTotal { get; set; }
        public int TotalChangeFromPrevious { get; set; }
        public double TotalChangePercentage { get; set; }
        public int PreviousYearSameMonthTotal { get; set; }
        public int TotalChangeFromPreviousYear { get; set; }
        public double TotalChangePercentageFromPreviousYear { get; set; }

        // Department specific fields
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public int? DeptRequestCount { get; set; }
        public double? DeptAverageResolutionHours { get; set; }
        public double? DeptPercentage { get; set; }
    }
}
