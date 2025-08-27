using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using HelpDesk360.API.Controllers;
using HelpDesk360.API.DTOs;
using HelpDesk360.API.Services;

namespace HelpDesk360.Tests.Controllers
{
    public class RequestsControllerTests
    {
        private readonly Mock<IRequestService> _mockRequestService;
        private readonly Mock<ILogger<RequestsController>> _mockLogger;
        private readonly RequestsController _controller;

        public RequestsControllerTests()
        {
            _mockRequestService = new Mock<IRequestService>();
            _mockLogger = new Mock<ILogger<RequestsController>>();
            _controller = new RequestsController(_mockRequestService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllRequests_ReturnsOkResult_WithListOfRequests()
        {
            // Arrange
            var requests = new List<RequestDto>
            {
                new RequestDto { Id = 1, Title = "Test Request 1", Status = 1 },
                new RequestDto { Id = 2, Title = "Test Request 2", Status = 2 }
            };
            _mockRequestService.Setup(s => s.GetAllRequestsAsync()).ReturnsAsync(requests);

            // Act
            var result = await _controller.GetAllRequests();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedRequests = Assert.IsType<List<RequestDto>>(okResult.Value);
            Assert.Equal(2, returnedRequests.Count);
        }

        [Fact]
        public async Task GetRequest_ReturnsNotFound_WhenRequestDoesNotExist()
        {
            // Arrange
            _mockRequestService.Setup(s => s.GetRequestByIdAsync(It.IsAny<int>())).ReturnsAsync((RequestDto?)null);

            // Act
            var result = await _controller.GetRequest(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task CreateRequest_ReturnsCreatedAtAction_WithValidRequest()
        {
            // Arrange
            var createRequestDto = new CreateRequestDto
            {
                Title = "New Request",
                Description = "Test Description",
                Priority = 2,
                DepartmentId = 1,
                RequestorName = "Test User",
                RequestorEmail = "test@example.com",
                RequestorPhone = "050-1234567"
            };

            var createdRequest = new RequestDto
            {
                Id = 1,
                Title = createRequestDto.Title,
                Description = createRequestDto.Description,
                Priority = createRequestDto.Priority,
                Status = 1
            };

            _mockRequestService.Setup(s => s.CreateRequestAsync(It.IsAny<CreateRequestDto>())).ReturnsAsync(createdRequest);

            // Act
            var result = await _controller.CreateRequest(createRequestDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal("GetRequest", createdAtActionResult.ActionName);
            Assert.Equal(1, createdAtActionResult.RouteValues!["id"]);
        }

        [Fact]
        public async Task UpdateRequest_ReturnsNotFound_WhenRequestDoesNotExist()
        {
            // Arrange
            var updateRequestDto = new UpdateRequestDto { Title = "Updated Title" };
            _mockRequestService.Setup(s => s.UpdateRequestAsync(It.IsAny<int>(), It.IsAny<UpdateRequestDto>())).ReturnsAsync((RequestDto?)null);

            // Act
            var result = await _controller.UpdateRequest(999, updateRequestDto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task DeleteRequest_ReturnsNoContent_WhenRequestExists()
        {
            // Arrange
            _mockRequestService.Setup(s => s.DeleteRequestAsync(It.IsAny<int>())).ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteRequest(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task GetRequestsByStatus_ReturnsBadRequest_WithInvalidStatus()
        {
            // Act
            var result = await _controller.GetRequestsByStatus(5);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }
    }
}
