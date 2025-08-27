using Microsoft.AspNetCore.Mvc;
using HelpDesk360.API.DTOs;
using HelpDesk360.API.Services;

namespace HelpDesk360.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
        {
            _reportService = reportService;
            _logger = logger;
        }

        /// <summary>
        /// Get monthly requests report
        /// </summary>
        [HttpGet("monthly")]
        public async Task<ActionResult<MonthlyReportDto>> GetMonthlyReport(
            [FromQuery] int year,
            [FromQuery] int month)
        {
            try
            {
                if (month < 1 || month > 12)
                {
                    return BadRequest("Month must be between 1 and 12");
                }

                if (year < 2020 || year > DateTime.UtcNow.Year + 1)
                {
                    return BadRequest("Year must be between 2020 and next year");
                }

                var report = await _reportService.GetMonthlyReportAsync(year, month);
                if (report == null)
                {
                    return NotFound($"No data available for {month}/{year}");
                }

                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating monthly report for {Year}-{Month}", year, month);
                return StatusCode(500, "An error occurred while generating the report");
            }
        }

        /// <summary>
        /// Get current month report
        /// </summary>
        [HttpGet("monthly/current")]
        public async Task<ActionResult<MonthlyReportDto>> GetCurrentMonthReport()
        {
            var now = DateTime.UtcNow;
            return await GetMonthlyReport(now.Year, now.Month);
        }

        /// <summary>
        /// Get previous month report
        /// </summary>
        [HttpGet("monthly/previous")]
        public async Task<ActionResult<MonthlyReportDto>> GetPreviousMonthReport()
        {
            var previousMonth = DateTime.UtcNow.AddMonths(-1);
            return await GetMonthlyReport(previousMonth.Year, previousMonth.Month);
        }
    }
}
