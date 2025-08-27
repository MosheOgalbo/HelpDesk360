using HelpDesk360.API.DTOs;

namespace HelpDesk360.API.Services
{
    public interface IReportService
    {
        Task<MonthlyReportDto?> GetMonthlyReportAsync(int year, int month);
    }
}
