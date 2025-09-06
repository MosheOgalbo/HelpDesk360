using HelpDesk360.API.DTOs;
using HelpDesk360.API.Models;
using HelpDesk360.API.Repositories;
using HelpDesk360.API.Services;

namespace HelpDesk360.API.Services
{
    public class RequestService : IRequestService
    {
        private readonly IRequestRepository _requestRepository;

        // הזרקת RequestRepository דרך ה-Constructor
        public RequestService(IRequestRepository requestRepository)
        {
            _requestRepository = requestRepository;
        }

        // מחזיר את כל הבקשות כ-DTOs
        public async Task<IEnumerable<RequestDto>> GetAllRequestsAsync()
        {
            var requests = await _requestRepository.GetAllAsync(); // קריאה ל-Repository
            return requests.Select(MapToDto);                      // ממפה לכל RequestDto
        }

        // מחזיר בקשה לפי ID כ-DTO, או null אם לא קיימת
        public async Task<RequestDto?> GetRequestByIdAsync(int id)
        {
            var request = await _requestRepository.GetByIdAsync(id);
            return request != null ? MapToDto(request) : null;
        }

        // יצירת בקשה חדשה
        public async Task<RequestDto> CreateRequestAsync(CreateRequestDto createRequestDto)
        {
            // ממפה את CreateRequestDto ל-Entity
            var request = new Request
            {
                Title = createRequestDto.Title,
                Description = createRequestDto.Description,
                Priority = createRequestDto.Priority,
                Status = 1, // סטטוס התחלתי = Open
                DepartmentId = createRequestDto.DepartmentId,
                RequestorName = createRequestDto.RequestorName,
                RequestorEmail = createRequestDto.RequestorEmail,
                RequestorPhone = createRequestDto.RequestorPhone,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdRequest = await _requestRepository.CreateAsync(request); // שמירה ב-DB
            return MapToDto(createdRequest);                                   // החזרה כ-DTO
        }

        // עדכון בקשה קיימת
        public async Task<RequestDto?> UpdateRequestAsync(int id, UpdateRequestDto updateRequestDto)
        {
            var existingRequest = await _requestRepository.GetByIdAsync(id);
            if (existingRequest == null) return null;

            // עדכון רק אם יש ערכים לא null
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

            // עדכון במסד
            var updatedRequest = await _requestRepository.UpdateAsync(id, existingRequest);
            return updatedRequest != null ? MapToDto(updatedRequest) : null;
        }

        // מחיקת בקשה לפי ID
        public async Task<bool> DeleteRequestAsync(int id)
        {
            return await _requestRepository.DeleteAsync(id);
        }

        // קבלת בקשות לפי סטטוס
        public async Task<IEnumerable<RequestDto>> GetRequestsByStatusAsync(int status)
        {
            var requests = await _requestRepository.GetByStatusAsync(status);
            return requests.Select(MapToDto);
        }

        // קבלת בקשות לפי מחלקה
        public async Task<IEnumerable<RequestDto>> GetRequestsByDepartmentAsync(int departmentId)
        {
            var requests = await _requestRepository.GetByDepartmentAsync(departmentId);
            return requests.Select(MapToDto);
        }

        // פונקציה פרטית שממפה Entity ל-DTO
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
                DepartmentName = request.Department?.Name ?? "", // שמירה על ערך ריק אם המחלקה null
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
