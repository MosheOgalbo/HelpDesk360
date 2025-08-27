using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using HelpDesk360.API.Controllers;
using HelpDesk360.API.DTOs;
using HelpDesk360.API.Services;

namespace HelpDesk360.Tests.Controllers
{
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
        public async Task GetMonthlyReport_ReturnsOkResult_WithValidParameters()
        {
            // Arrange
            var report = new MonthlyReportDto
            {
                Year = 2024,
                Month = 3,
                MonthName = "March",
                TotalRequests = 10
            };
            _mockReportService.Setup(s => s.GetMonthlyReportAsync(2024, 3)).ReturnsAsync(report);

            // Act
            var result = await _controller.GetMonthlyReport(2024, 3);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedReport = Assert.IsType<MonthlyReportDto>(okResult.Value);
            Assert.Equal(10, returnedReport.TotalRequests);
        }

        [Fact]
        public async Task GetMonthlyReport_ReturnsBadRequest_WithInvalidMonth()
        {
            // Act
            var result = await _controller.GetMonthlyReport(2024, 13);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetMonthlyReport_ReturnsBadRequest_WithInvalidYear()
        {
            // Act
            var result = await _controller.GetMonthlyReport(2019, 3);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetMonthlyReport_ReturnsNotFound_WhenReportNotAvailable()
        {
            // Arrange
            _mockReportService.Setup(s => s.GetMonthlyReportAsync(It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync((MonthlyReportDto?)null);

            // Act
            var result = await _controller.GetMonthlyReport(2024, 3);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetCurrentMonthReport_CallsServiceWithCurrentMonthAndYear()
        {
            // Arrange
            var now = DateTime.UtcNow;
            var report = new MonthlyReportDto { Year = now.Year, Month = now.Month };
            _mockReportService.Setup(s => s.GetMonthlyReportAsync(now.Year, now.Month)).ReturnsAsync(report);

            // Act
            var result = await _controller.GetCurrentMonthReport();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            _mockReportService.Verify(s => s.GetMonthlyReportAsync(now.Year, now.Month), Times.Once);
        }
    }
}
