
using Xunit;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using FluentValidation;
using FluentValidation.Results;
using HelpDesk360.API.Controllers;
using HelpDesk360.API.Services.Interfaces;
using HelpDesk360.API.DTOs;

namespace HelpDesk360.Tests.Controllers;

public class RequestsControllerTests
{
    private readonly Mock<IRequestService> _mockRequestService;
    private readonly Mock<IValidator<CreateRequestDto>> _mockCreateValidator;
    private readonly Mock<IValidator<UpdateRequestDto>> _mockUpdateValidator;
    private readonly Mock<ILogger<RequestsController>> _mockLogger;
    private readonly RequestsController _controller;

    public RequestsControllerTests()
    {
        _mockRequestService = new Mock<IRequestService>();
        _mockCreateValidator = new Mock<IValidator<CreateRequestDto>>();
        _mockUpdateValidator = new Mock<IValidator<UpdateRequestDto>>();
        _mockLogger = new Mock<ILogger<RequestsController>>();

        _controller = new RequestsController(
            _mockRequestService.Object,
            _mockCreateValidator.Object,
            _mockUpdateValidator.Object,
            _mockLogger.Object);
    }

    [Fact]
    public async Task GetAllRequests_WithValidParameters_ShouldReturnOkResult()
    {
        // Arrange
        var requests = new List<RequestResponseDto>
        {
            new RequestResponseDto { Id = 1, Name = "Test Request" }
        };

        _mockRequestService
            .Setup(x => x.GetAllRequestsAsync(1, 10))
            .ReturnsAsync(requests);
        _mockRequestService
            .Setup(x => x.GetTotalRequestsCountAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _controller.GetAllRequests(1, 10);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(requests);
    }

    [Fact]
    public async Task GetAllRequests_WithInvalidPage_ShouldReturnBadRequest()
    {
        // Act
        var result = await _controller.GetAllRequests(0, 10);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task GetRequest_WithValidId_ShouldReturnOkResult()
    {
        // Arrange
        var request = new RequestResponseDto { Id = 1, Name = "Test Request" };
        _mockRequestService
            .Setup(x => x.GetRequestByIdAsync(1))
            .ReturnsAsync(request);

        // Act
        var result = await _controller.GetRequest(1);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(request);
    }

    [Fact]
    public async Task GetRequest_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        _mockRequestService
            .Setup(x => x.GetRequestByIdAsync(999))
            .ReturnsAsync((RequestResponseDto?)null);

        // Act
        var result = await _controller.GetRequest(999);

        // Assert
        result.Result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task CreateRequest_WithValidData_ShouldReturnCreatedResult()
    {
        // Arrange
        var createDto = new CreateRequestDto
        {
            Name = "Test User",
            Email = "test@test.com",
            Phone = "+1-555-0123",
            Description = "Test description",
            DepartmentIds = new List<int> { 1 }
        };

        var createdRequest = new RequestResponseDto { Id = 1, Name = "Test User" };

        _mockCreateValidator
            .Setup(x => x.ValidateAsync(createDto, default))
            .ReturnsAsync(new ValidationResult());

        _mockRequestService
            .Setup(x => x.CreateRequestAsync(createDto))
            .ReturnsAsync(createdRequest);

        // Act
        var result = await _controller.CreateRequest(createDto);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.Value.Should().BeEquivalentTo(createdRequest);
    }

    [Fact]
    public async Task CreateRequest_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        var createDto = new CreateRequestDto();
        var validationResult = new ValidationResult(new List<ValidationFailure>
        {
            new ValidationFailure("Name", "Name is required")
        });

        _mockCreateValidator
            .Setup(x => x.ValidateAsync(createDto, default))
            .ReturnsAsync(validationResult);

        // Act
        var result = await _controller.CreateRequest(createDto);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task UpdateRequest_WithValidData_ShouldReturnOkResult()
    {
        // Arrange
        var updateDto = new UpdateRequestDto
        {
            Name = "Updated Name",
            Email = "test@test.com",
            Phone = "+1-555-0123",
            Description = "Updated description",
            DepartmentIds = new List<int> { 1 }
        };

        var updatedRequest = new RequestResponseDto { Id = 1, Name = "Updated Name" };

        _mockUpdateValidator
            .Setup(x => x.ValidateAsync(updateDto, default))
            .ReturnsAsync(new ValidationResult());

        _mockRequestService
            .Setup(x => x.UpdateRequestAsync(1, updateDto))
            .ReturnsAsync(updatedRequest);

        // Act
        var result = await _controller.UpdateRequest(1, updateDto);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(updatedRequest);
    }

    [Fact]
    public async Task DeleteRequest_WithValidId_ShouldReturnNoContent()
    {
        // Arrange
        _mockRequestService
            .Setup(x => x.DeleteRequestAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteRequest(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task DeleteRequest_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        _mockRequestService
            .Setup(x => x.DeleteRequestAsync(999))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteRequest(999);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task SearchRequests_WithValidTerm_ShouldReturnOkResult()
    {
        // Arrange
        var searchTerm = "test";
        var requests = new List<RequestResponseDto>
        {
            new RequestResponseDto { Id = 1, Name = "Test Request" }
        };

        _mockRequestService
            .Setup(x => x.SearchRequestsAsync(searchTerm))
            .ReturnsAsync(requests);

        // Act
        var result = await _controller.SearchRequests(searchTerm);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(requests);
    }

    [Fact]
    public async Task SearchRequests_WithEmptyTerm_ShouldReturnBadRequest()
    {
        // Act
        var result = await _controller.SearchRequests("");

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }
}
