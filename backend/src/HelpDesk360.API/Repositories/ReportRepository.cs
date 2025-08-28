using Microsoft.EntityFrameworkCore;
using HelpDesk360.API.Data;
using HelpDesk360.API.DTOs;
using HelpDesk360.API.Repositories;
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
                new MySqlConnector.MySqlParameter("p_Year", year),
                new MySqlConnector.MySqlParameter("p_Month", month)
            };

            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            try
            {
                using var command = connection.CreateCommand();
                command.CommandText = "CALL sp_GetMonthlyRequestsReport(@p_Year, @p_Month)";
                command.Parameters.Add(new MySqlConnector.MySqlParameter("@p_Year", year));
                command.Parameters.Add(new MySqlConnector.MySqlParameter("@p_Month", month));

                using var reader = await command.ExecuteReaderAsync();

                MonthlyReportDto? report = null;
                var departmentStats = new List<DepartmentStatDto>();

                // First result set - main report data
                if (await reader.ReadAsync())
                {
                    report = new MonthlyReportDto
                    {
                        Year = year,
                        Month = month,
                        MonthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(month),
                        TotalRequests = reader.GetInt32(reader.GetOrdinal("TotalRequests")),
                        OpenRequests = reader.GetInt32(reader.GetOrdinal("OpenRequests")),
                        InProgressRequests = reader.GetInt32(reader.GetOrdinal("InProgressRequests")),
                        ResolvedRequests = reader.GetInt32(reader.GetOrdinal("ResolvedRequests")),
                        ClosedRequests = reader.GetInt32(reader.GetOrdinal("ClosedRequests")),
                        AverageResolutionHours = reader.GetDouble(reader.GetOrdinal("AverageResolutionHours")),
                        CriticalRequests = reader.GetInt32(reader.GetOrdinal("CriticalRequests")),
                        HighRequests = reader.GetInt32(reader.GetOrdinal("HighRequests")),
                        MediumRequests = reader.GetInt32(reader.GetOrdinal("MediumRequests")),
                        LowRequests = reader.GetInt32(reader.GetOrdinal("LowRequests")),
                        PreviousMonthTotal = reader.GetInt32(reader.GetOrdinal("PreviousMonthTotal")),
                        TotalChangeFromPrevious = reader.GetInt32(reader.GetOrdinal("TotalChangeFromPrevious")),
                        TotalChangePercentage = reader.GetDouble(reader.GetOrdinal("TotalChangePercentage")),
                        PreviousYearSameMonthTotal = reader.GetInt32(reader.GetOrdinal("PreviousYearSameMonthTotal")),
                        TotalChangeFromPreviousYear = reader.GetInt32(reader.GetOrdinal("TotalChangeFromPreviousYear")),
                        TotalChangePercentageFromPreviousYear = reader.GetDouble(reader.GetOrdinal("TotalChangePercentageFromPreviousYear"))
                    };
                }

                // Second result set - department statistics
                if (await reader.NextResultAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        departmentStats.Add(new DepartmentStatDto
                        {
                            DepartmentId = reader.GetInt32(reader.GetOrdinal("DepartmentId")),
                            DepartmentName = reader.GetString(reader.GetOrdinal("DepartmentName")),
                            RequestCount = reader.GetInt32(reader.GetOrdinal("DeptRequestCount")),
                            AverageResolutionHours = reader.GetDouble(reader.GetOrdinal("DeptAverageResolutionHours")),
                            Percentage = reader.GetDouble(reader.GetOrdinal("DeptPercentage"))
                        });
                    }
                }

                if (report != null)
                {
                    report.DepartmentStats = departmentStats;
                }

                return report;
            }
            finally
            {
                await connection.CloseAsync();
            }
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
