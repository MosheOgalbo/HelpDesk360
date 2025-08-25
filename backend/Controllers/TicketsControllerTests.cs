using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using HelpDesk360.API.Controllers;
using HelpDesk360.API.Models;
using HelpDesk360.API.Services;

namespace HelpDesk360.API.Controllers;
{
    public class TicketsControllerTests
    {
        private readonly Mock<ITicketService> _mockTicketService;
        private readonly TicketsController _controller;

        public TicketsControllerTests()
        {
            _mockTicketService = new Mock<ITicketService>();
            _controller = new TicketsController(_mockTicketService.Object);
        }

        [Fact]
        public async Task GetAllTickets_ReturnsOkResult_WhenTicketsExist()
        {
            // Arrange
            var tickets = new List<Ticket>
            {
                new Ticket { Id = 1, Name = "Test User", Email = "test@test.com", Phone = "123-456-7890", Description = "Test issue" }
            };
            var successResponse = ApiResponse<List<Ticket>>.SuccessResult(tickets);
            _mockTicketService.Setup(s => s.GetAllTicketsAsync()).ReturnsAsync(successResponse);

            // Act
            var result = await _controller.GetAllTickets();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var apiResponse = Assert.IsType<ApiResponse<List<Ticket>>>(okResult.Value);
            Assert.True(apiResponse.Success);
            Assert.Single(apiResponse.Data);
        }

        [Fact]
        public async Task CreateTicket_ReturnsCreatedResult_WhenTicketIsValid()
        {
            // Arrange
            var newTicket = new Ticket
            {
                Name = "Test User",
                Email = "test@test.com",
                Phone = "123-456-7890",
                Description = "Test issue",
                DepartmentIds = new List<int> { 1 }
            };
            var createdTicket = new Ticket { Id = 1, Name = "Test User", Email = "test@test.com", Phone = "123-456-7890", Description = "Test issue" };
            var successResponse = ApiResponse<Ticket>.SuccessResult(createdTicket, "פנייה נוצרה בהצלחה");
            _mockTicketService.Setup(s => s.CreateTicketAsync(It.IsAny<Ticket>())).ReturnsAsync(successResponse);

            // Act
            var result = await _controller.CreateTicket(newTicket);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var apiResponse = Assert.IsType<ApiResponse<Ticket>>(createdResult.Value);
            Assert.True(apiResponse.Success);
            Assert.Equal("פנייה נוצרה בהצלחה", apiResponse.Message);
        }

        [Fact]
        public async Task GetTicket_ReturnsNotFound_WhenTicketDoesNotExist()
        {
            // Arrange
            var errorResponse = ApiResponse<Ticket>.ErrorResult("פנייה לא נמצאה");
            _mockTicketService.Setup(s => s.GetTicketByIdAsync(999)).ReturnsAsync(errorResponse);

            // Act
            var result = await _controller.GetTicket(999);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            var apiResponse = Assert.IsType<ApiResponse<Ticket>>(notFoundResult.Value);
            Assert.False(apiResponse.Success);
        }

        [Fact]
        public async Task DeleteTicket_ReturnsOkResult_WhenTicketExists()
        {
            // Arrange
            var successResponse = ApiResponse<bool>.SuccessResult(true, "פנייה נמחקה בהצלחה");
            _mockTicketService.Setup(s => s.DeleteTicketAsync(1)).ReturnsAsync(successResponse);

            // Act
            var result = await _controller.DeleteTicket(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var apiResponse = Assert.IsType<ApiResponse<bool>>(okResult.Value);
            Assert.True(apiResponse.Success);
            Assert.True(apiResponse.Data);
        }
    }
}
