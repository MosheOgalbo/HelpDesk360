using Microsoft.EntityFrameworkCore;
using Xunit;
using HelpDesk360.API.Data;
using HelpDesk360.API.DTOs;
using HelpDesk360.API.Models;
using HelpDesk360.API.Repositories;
using HelpDesk360.API.Services;

namespace HelpDesk360.Tests.Services
{
    public class RequestServiceTests : IDisposable
    {
        private readonly HelpDeskDbContext _context;
        private readonly RequestRepository _repository;
        private readonly RequestService _service;

        public RequestServiceTests()
        {
            var options = new DbContextOptionsBuilder<HelpDeskDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new HelpDeskDbContext(options);

            // Seed test data
            SeedTestData();

            _repository = new RequestRepository(_context);
            _service = new RequestService(_repository);
        }

        private void SeedTestData()
        {
            var departments = new List<RequestDepartment>
            {
                new RequestDepartment { Id = 1, Name = "IT Support", Description = "IT Department" },
                new RequestDepartment { Id = 2, Name = "HR", Description = "Human Resources" }
            };

            var requests = new List<Request>
            {
                new Request
                {
                    Id = 1,
                    Title = "Test Request 1",
                    Description = "Test Description 1",
                    Priority = 2,
                    Status = 1,
                    DepartmentId = 1,
                    RequestorName = "John Doe",
                    RequestorEmail = "john@example.com",
                    RequestorPhone = "050-1234567"
                },
                new Request
                {
                    Id = 2,
                    Title = "Test Request 2",
                    Description = "Test Description 2",
                    Priority = 3,
                    Status = 2,
                    DepartmentId = 2,
                    RequestorName = "Jane Smith",
                    RequestorEmail = "jane@example.com",
                    RequestorPhone = "050-7654321"
                }
            };

            _context.RequestDepartments.AddRange(departments);
            _context.Requests.AddRange(requests);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetAllRequestsAsync_ReturnsAllRequests()
        {
            // Act
            var result = await _service.GetAllRequestsAsync();

            // Assert
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetRequestByIdAsync_ReturnsCorrectRequest()
        {
            // Act
            var result = await _service.GetRequestByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Test Request 1", result.Title);
            Assert.Equal("IT Support", result.DepartmentName);
        }

        [Fact]
        public async Task CreateRequestAsync_CreatesNewRequest()
        {
            // Arrange
            var createDto = new CreateRequestDto
            {
                Title = "New Request",
                Description = "New Description",
                Priority = 1,
                DepartmentId = 1,
                RequestorName = "Test User",
                RequestorEmail = "test@example.com",
                RequestorPhone = "050-9999999"
            };

            // Act
            var result = await _service.CreateRequestAsync(createDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New Request", result.Title);
            Assert.Equal(1, result.Status); // Should be Open by default
        }

        [Fact]
        public async Task UpdateRequestAsync_UpdatesExistingRequest()
        {
            // Arrange
            var updateDto = new UpdateRequestDto
            {
                Title = "Updated Title",
                Status = 3 // Resolved
            };

            // Act
            var result = await _service.UpdateRequestAsync(1, updateDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Title", result.Title);
            Assert.Equal(3, result.Status);
        }

        [Fact]
        public async Task DeleteRequestAsync_RemovesRequest()
        {
            // Act
            var result = await _service.DeleteRequestAsync(1);
            var deletedRequest = await _service.GetRequestByIdAsync(1);

            // Assert
            Assert.True(result);
            Assert.Null(deletedRequest);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
