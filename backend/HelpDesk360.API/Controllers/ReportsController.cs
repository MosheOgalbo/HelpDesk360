
using Microsoft.AspNetCore.Mvc;
using HelpDesk360.API.Models;
using HelpDesk360.API.Services.Interfaces;

namespace HelpDesk360.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
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
    /// Get monthly support report
    /// </summary>
    /// <param name="year">Report year</param>
    /// <param name="month">Report month (1-12)</param>
    /// <returns>Monthly report data</returns>
    [HttpGet("monthly")]
    [ProducesResponseType(typeof(IEnumerable<MonthlyReport>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<MonthlyReport>>> GetMonthlyReport(
        [FromQuery] int year = 0,
        [FromQuery] int month = 0)
    {
        // Default to current month if not provided
        if (year == 0 || month == 0)
        {
            var now = DateTime.Now;
            year = year == 0 ? now.Year : year;
            month = month == 0 ? now.Month : month;
        }

        if (month < 1 || month > 12)
        {
            return BadRequest("Month must be between 1 and 12");
        }

        if (year < 2000 || year > DateTime.Now.Year + 1)
        {
            return BadRequest("Year must be between 2000 and next year");
        }

        var report = await _reportService.GetMonthlySupportReportAsync(year, month);

        _logger.LogInformation("Monthly report requested for {Year}-{Month}", year, month);

        return Ok(report);
    }

    /// <summary>
    /// Get report summary statistics
    /// </summary>
    /// <param name="year">Report year</param>
    /// <param name="month">Report month (1-12)</param>
    /// <returns>Report summary</returns>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ReportSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ReportSummary>> GetReportSummary(
        [FromQuery] int year = 0,
        [FromQuery] int month = 0)
    {
        // Default to current month if not provided
        if (year == 0 || month == 0)
        {
            var now = DateTime.Now;
            year = year == 0 ? now.Year : year;
            month = month == 0 ? now.Month : month;
        }

        if (month < 1 || month > 12)
        {
            return BadRequest("Month must be between 1 and 12");
        }

        if (year < 2000 || year > DateTime.Now.Year + 1)
        {
            return BadRequest("Year must be between 2000 and next year");
        }

        var summary = await _reportService.GetReportSummaryAsync(year, month);

        return Ok(summary);
    }
}
