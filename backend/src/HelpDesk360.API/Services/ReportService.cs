using HelpDesk360.API.DTOs;
using HelpDesk360.API.Repositories;
using HelpDesk360.API.Services;

namespace HelpDesk360.API.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;

        public ReportService(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        public async Task<MonthlyReportDto?> GetMonthlyReportAsync(int year, int month)
        {
            if (month < 1 || month > 12)
                return null;

            if (year < 2020 || year > DateTime.UtcNow.Year + 1)
                return null;

            return await _reportRepository.GetMonthlyReportAsync(year, month);
        }
    }
}
