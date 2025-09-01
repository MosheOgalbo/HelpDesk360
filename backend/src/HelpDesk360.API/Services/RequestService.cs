using HelpDesk360.API.DTOs;
using HelpDesk360.API.Models;
using HelpDesk360.API.Repositories;
using HelpDesk360.API.Services;

namespace HelpDesk360.API.Services
{
    public class RequestService : IRequestService
    {
        private readonly IRequestRepository _requestRepository;

        public RequestService(IRequestRepository requestRepository)
        {
            _requestRepository = requestRepository;
        }

        public async Task<IEnumerable<RequestDto>> GetAllRequestsAsync()
        {
            var requests = await _requestRepository.GetAllAsync();
            return requests.Select(MapToDto);
        }

        public async Task<RequestDto?> GetRequestByIdAsync(int id)
        {
            var request = await _requestRepository.GetByIdAsync(id);
            return request != null ? MapToDto(request) : null;
        }

        public async Task<RequestDto> CreateRequestAsync(CreateRequestDto createRequestDto)
        {
            var request = new Request
            {
                Title = createRequestDto.Title,
                Description = createRequestDto.Description,
                Priority = createRequestDto.Priority,
                Status = 1, // Open
                DepartmentId = createRequestDto.DepartmentId,
                RequestorName = createRequestDto.RequestorName,
                RequestorEmail = createRequestDto.RequestorEmail,
                RequestorPhone = createRequestDto.RequestorPhone,  // ✅ זה בסדר
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdRequest = await _requestRepository.CreateAsync(request);
            return MapToDto(createdRequest);
        }

        public async Task<RequestDto?> UpdateRequestAsync(int id, UpdateRequestDto updateRequestDto)
        {
            var existingRequest = await _requestRepository.GetByIdAsync(id);
            if (existingRequest == null) return null;

            // Update only non-null fields
            if (updateRequestDto.Title != null)
                existingRequest.Title = updateRequestDto.Title;
            if (updateRequestDto.Description != null)
                existingRequest.Description = updateRequestDto.Description;
            if (updateRequestDto.Priority.HasValue)
                existingRequest.Priority = updateRequestDto.Priority.Value;
            if (updateRequestDto.Status.HasValue)
                existingRequest.Status = updateRequestDto.Status.Value;
            if (updateRequestDto.DepartmentId.HasValue)
                existingRequest.DepartmentId = updateRequestDto.DepartmentId.Value;
            if (updateRequestDto.RequestorPhone != null)
                existingRequest.RequestorPhone = updateRequestDto.RequestorPhone;
            if (updateRequestDto.AssignedTo != null)
                existingRequest.AssignedTo = updateRequestDto.AssignedTo;

            var updatedRequest = await _requestRepository.UpdateAsync(id, existingRequest);
            return updatedRequest != null ? MapToDto(updatedRequest) : null;
        }

        public async Task<bool> DeleteRequestAsync(int id)
        {
            return await _requestRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<RequestDto>> GetRequestsByStatusAsync(int status)
        {
            var requests = await _requestRepository.GetByStatusAsync(status);
            return requests.Select(MapToDto);
        }

        public async Task<IEnumerable<RequestDto>> GetRequestsByDepartmentAsync(int departmentId)
        {
            var requests = await _requestRepository.GetByDepartmentAsync(departmentId);
            return requests.Select(MapToDto);
        }

        private static RequestDto MapToDto(Request request)
        {
            return new RequestDto
            {
                Id = request.Id,
                Title = request.Title,
                Description = request.Description,
                Priority = request.Priority,
                Status = request.Status,
                DepartmentId = request.DepartmentId,
                DepartmentName = request.Department?.Name ?? "",
                RequestorName = request.RequestorName,
                RequestorEmail = request.RequestorEmail,
                RequestorPhone = request.RequestorPhone,
                AssignedTo = request.AssignedTo,
                CreatedAt = request.CreatedAt,
                ResolvedAt = request.ResolvedAt,
                UpdatedAt = request.UpdatedAt
            };
        }
    }
}
