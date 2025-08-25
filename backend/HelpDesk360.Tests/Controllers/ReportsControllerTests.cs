
using Xunit;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using HelpDesk360.API.Controllers;
using HelpDesk360.API.Services.Interfaces;
using HelpDesk360.API.Models;

namespace HelpDesk360.Tests.Controllers;

public class ReportsControllerTests
{
    private readonly Mock<IReportService> _mockReportService;
    private readonly Mock<ILogger<ReportsController>> _mockLogger;
    private readonly ReportsController _controller;

    public ReportsControllerTests()
    {
        _mockReportService = new Mock<IReportService>();
        _mockLogger = new Mock<ILogger<ReportsController>>();
        _controller = new ReportsController(_mockReportService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetMonthlyReport_WithValidParameters_ShouldReturnOkResult()
    {
        // Arrange
        var year = 2024;
        var month = 1;
        var reports = new List<MonthlyReport>
        {
            new MonthlyReport
            {
                DepartmentId = 1,
                DepartmentName = "IT",
                CurrentMonthRequests = 10,
                ReportYear = year,
                ReportMonth = month
            }
        };

        _mockReportService
            .Setup(x => x.GetMonthlySupportReportAsync(year, month))
            .ReturnsAsync(reports);

        // Act
        var result = await _controller.GetMonthlyReport(year, month);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(reports);
    }

    [Fact]
    public async Task GetMonthlyReport_WithInvalidMonth_ShouldReturnBadRequest()
    {
        // Act
        var result = await _controller.GetMonthlyReport(2024, 13);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task GetReportSummary_WithValidParameters_ShouldReturnOkResult()
    {
        // Arrange
        var year = 2024;
        var month = 1;
        var summary = new ReportSummary
        {
            Year = year,
            Month = month,
            TotalRequestsCurrentMonth = 25,
            TotalActiveDepartments = 7
        };

        _mockReportService
            .Setup(x => x.GetReportSummaryAsync(year, month))
            .ReturnsAsync(summary);

        // Act
        var result = await _controller.GetReportSummary(year, month);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(summary);
    }
}
