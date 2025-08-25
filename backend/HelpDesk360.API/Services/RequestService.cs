
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using HelpDesk360.API.Data;
using HelpDesk360.API.DTOs;
using HelpDesk360.API.Models;
using HelpDesk360.API.Services.Interfaces;

namespace HelpDesk360.API.Services;

public class RequestService : IRequestService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<RequestService> _logger;

    public RequestService(ApplicationDbContext context, IMapper mapper, ILogger<RequestService> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<RequestResponseDto>> GetAllRequestsAsync(int page = 1, int pageSize = 10)
    {
        try
        {
            var skip = (page - 1) * pageSize;

            var requests = await _context.Requests
                .Include(r => r.Departments)
                .OrderByDescending(r => r.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            return _mapper.Map<IEnumerable<RequestResponseDto>>(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving requests - Page: {Page}, PageSize: {PageSize}", page, pageSize);
            throw;
        }
    }

    public async Task<RequestResponseDto?> GetRequestByIdAsync(int id)
    {
        try
        {
            var request = await _context.Requests
                .Include(r => r.Departments)
                .FirstOrDefaultAsync(r => r.Id == id);

            return request == null ? null : _mapper.Map<RequestResponseDto>(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving request with ID: {RequestId}", id);
            throw;
        }
    }

    public async Task<RequestResponseDto> CreateRequestAsync(CreateRequestDto createRequestDto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Validate departments exist
            var departments = await _context.Departments
                .Where(d => createRequestDto.DepartmentIds.Contains(d.Id) && d.IsActive)
                .ToListAsync();

            if (departments.Count != createRequestDto.DepartmentIds.Count)
            {
                throw new ArgumentException("One or more departments are invalid or inactive");
            }

            var request = _mapper.Map<Request>(createRequestDto);
            request.Departments = departments;

            _context.Requests.Add(request);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Request created successfully with ID: {RequestId}", request.Id);

            // Reload with departments for response
            var createdRequest = await GetRequestByIdAsync(request.Id);
            return createdRequest!;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error creating request for {Email}", createRequestDto.Email);
            throw;
        }
    }

    public async Task<RequestResponseDto?> UpdateRequestAsync(int id, UpdateRequestDto updateRequestDto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var request = await _context.Requests
                .Include(r => r.Departments)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (request == null)
                return null;

            // Validate departments exist
            var departments = await _context.Departments
                .Where(d => updateRequestDto.DepartmentIds.Contains(d.Id) && d.IsActive)
                .ToListAsync();

            if (departments.Count != updateRequestDto.DepartmentIds.Count)
            {
                throw new ArgumentException("One or more departments are invalid or inactive");
            }

            _mapper.Map(updateRequestDto, request);
            request.Departments.Clear();

            foreach (var department in departments)
            {
                request.Departments.Add(department);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Request updated successfully with ID: {RequestId}", request.Id);

            return await GetRequestByIdAsync(id);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error updating request with ID: {RequestId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteRequestAsync(int id)
    {
        try
        {
            var request = await _context.Requests.FindAsync(id);
            if (request == null)
                return false;

            _context.Requests.Remove(request);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Request deleted successfully with ID: {RequestId}", id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting request with ID: {RequestId}", id);
            throw;
        }
    }

    public async Task<int> GetTotalRequestsCountAsync()
    {
        return await _context.Requests.CountAsync();
    }

    public async Task<IEnumerable<RequestResponseDto>> SearchRequestsAsync(string searchTerm)
    {
        try
        {
            var requests = await _context.Requests
                .Include(r => r.Departments)
                .Where(r => r.Name.Contains(searchTerm) ||
                           r.Email.Contains(searchTerm) ||
                           r.Description.Contains(searchTerm) ||
                           r.Departments.Any(d => d.Name.Contains(searchTerm)))
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<RequestResponseDto>>(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching requests with term: {SearchTerm}", searchTerm);
            throw;
        }
    }
}
