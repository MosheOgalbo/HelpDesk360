using HelpDesk360.API.DTOs;

namespace HelpDesk360.API.Repositories
{
    public interface IReportRepository
    {
        Task<MonthlyReportDto?> GetMonthlyReportAsync(int year, int month);
    }
}
