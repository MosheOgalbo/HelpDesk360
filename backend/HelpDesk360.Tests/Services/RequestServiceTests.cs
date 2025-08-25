
using Xunit;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using AutoMapper;
using HelpDesk360.API.Services;
using HelpDesk360.API.DTOs;
using HelpDesk360.API.MappingProfiles;
using HelpDesk360.Tests.Helpers;

namespace HelpDesk360.Tests.Services;

public class RequestServiceTests : IDisposable
{
    private readonly Mock<ILogger<RequestService>> _mockLogger;
    private readonly IMapper _mapper;
    private readonly RequestService _requestService;
    private readonly Data.ApplicationDbContext _context;

    public RequestServiceTests()
    {
        _mockLogger = new Mock<ILogger<RequestService>>();

        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<RequestMappingProfile>();
        });
        _mapper = config.CreateMapper();

        _context = TestDbContextFactory.CreateInMemoryDbContext();
        _requestService = new RequestService(_context, _mapper, _mockLogger.Object);
    }

    [Fact]
    public async Task GetAllRequestsAsync_ShouldReturnPagedResults()
    {
        // Arrange
        var page = 1;
        var pageSize = 10;

        // Act
        var result = await _requestService.GetAllRequestsAsync(page, pageSize);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.First().Name.Should().Be("Jane Smith"); // Most recent first
    }

    [Fact]
    public async Task GetRequestByIdAsync_WithValidId_ShouldReturnRequest()
    {
        // Arrange
        var requestId = 1;

        // Act
        var result = await _requestService.GetRequestByIdAsync(requestId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(requestId);
        result.Name.Should().Be("John Doe");
        result.Departments.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetRequestByIdAsync_WithInvalidId_ShouldReturnNull()
    {
        // Arrange
        var requestId = 999;

        // Act
        var result = await _requestService.GetRequestByIdAsync(requestId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateRequestAsync_WithValidData_ShouldCreateRequest()
    {
        // Arrange
        var createDto = new CreateRequestDto
        {
            Name = "Test User",
            Phone = "+1-555-9999",
            Email = "test@test.com",
            Description = "Test description for new request",
            Priority = "High",
            DepartmentIds = new List<int> { 1, 2 }
        };

        // Act
        var result = await _requestService.CreateRequestAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(createDto.Name);
        result.Email.Should().Be(createDto.Email);
        result.Departments.Should().HaveCount(2);
        result.Status.Should().Be("Open");
    }

    [Fact]
    public async Task CreateRequestAsync_WithInvalidDepartment_ShouldThrowException()
    {
        // Arrange
        var createDto = new CreateRequestDto
        {
            Name = "Test User",
            Phone = "+1-555-9999",
            Email = "test@test.com",
            Description = "Test description",
            DepartmentIds = new List<int> { 999 } // Invalid department
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await _requestService.CreateRequestAsync(createDto));
    }

    [Fact]
    public async Task UpdateRequestAsync_WithValidData_ShouldUpdateRequest()
    {
        // Arrange
        var requestId = 1;
        var updateDto = new UpdateRequestDto
        {
            Name = "Updated Name",
            Phone = "+1-555-0123",
            Email = "john.doe@test.com",
            Description = "Updated description",
            Status = "In Progress",
            Priority = "Critical",
            DepartmentIds = new List<int> { 1 }
        };

        // Act
        var result = await _requestService.UpdateRequestAsync(requestId, updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be(updateDto.Name);
        result.Status.Should().Be(updateDto.Status);
        result.Priority.Should().Be(updateDto.Priority);
    }

    [Fact]
    public async Task UpdateRequestAsync_WithInvalidId_ShouldReturnNull()
    {
        // Arrange
        var requestId = 999;
        var updateDto = new UpdateRequestDto
        {
            Name = "Updated Name",
            Phone = "+1-555-0123",
            Email = "test@test.com",
            Description = "Updated description",
            DepartmentIds = new List<int> { 1 }
        };

        // Act
        var result = await _requestService.UpdateRequestAsync(requestId, updateDto);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task DeleteRequestAsync_WithValidId_ShouldReturnTrue()
    {
        // Arrange
        var requestId = 1;

        // Act
        var result = await _requestService.DeleteRequestAsync(requestId);

        // Assert
        result.Should().BeTrue();

        // Verify deletion
        var deletedRequest = await _requestService.GetRequestByIdAsync(requestId);
        deletedRequest.Should().BeNull();
    }

    [Fact]
    public async Task DeleteRequestAsync_WithInvalidId_ShouldReturnFalse()
    {
        // Arrange
        var requestId = 999;

        // Act
        var result = await _requestService.DeleteRequestAsync(requestId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SearchRequestsAsync_ShouldReturnMatchingRequests()
    {
        // Arrange
        var searchTerm = "john";

        // Act
        var result = await _requestService.SearchRequestsAsync(searchTerm);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result.First().Name.Should().Contain("John", StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetTotalRequestsCountAsync_ShouldReturnCorrectCount()
    {
        // Act
        var result = await _requestService.GetTotalRequestsCountAsync();

        // Assert
        result.Should().Be(2);
    }

    public void Dispose()
    {
        _context?.Dispose();
    }
}
