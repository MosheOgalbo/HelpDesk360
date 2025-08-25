
using HelpDesk360.API.DTOs;
using HelpDesk360.API.Models;

namespace HelpDesk360.API.Services.Interfaces;

public interface IRequestService
{
    Task<IEnumerable<RequestResponseDto>> GetAllRequestsAsync(int page = 1, int pageSize = 10);
    Task<RequestResponseDto?> GetRequestByIdAsync(int id);
    Task<RequestResponseDto> CreateRequestAsync(CreateRequestDto createRequestDto);
    Task<RequestResponseDto?> UpdateRequestAsync(int id, UpdateRequestDto updateRequestDto);
    Task<bool> DeleteRequestAsync(int id);
    Task<int> GetTotalRequestsCountAsync();
    Task<IEnumerable<RequestResponseDto>> SearchRequestsAsync(string searchTerm);
}
