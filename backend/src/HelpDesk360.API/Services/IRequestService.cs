using HelpDesk360.API.DTOs;

namespace HelpDesk360.API.Services
{
    public interface IRequestService
    {
        Task<IEnumerable<RequestDto>> GetAllRequestsAsync();
        Task<RequestDto?> GetRequestByIdAsync(int id);
        Task<RequestDto> CreateRequestAsync(CreateRequestDto createRequestDto);
        Task<RequestDto?> UpdateRequestAsync(int id, UpdateRequestDto updateRequestDto);
        Task<bool> DeleteRequestAsync(int id);
        Task<IEnumerable<RequestDto>> GetRequestsByStatusAsync(int status);
        Task<IEnumerable<RequestDto>> GetRequestsByDepartmentAsync(int departmentId);
    }
}
