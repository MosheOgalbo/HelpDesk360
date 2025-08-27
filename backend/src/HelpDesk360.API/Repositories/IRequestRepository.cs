using HelpDesk360.API.Models;

namespace HelpDesk360.API.Repositories
{
    public interface IRequestRepository
    {
        Task<IEnumerable<Request>> GetAllAsync();
        Task<Request?> GetByIdAsync(int id);
        Task<Request> CreateAsync(Request request);
        Task<Request?> UpdateAsync(int id, Request request);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<Request>> GetByStatusAsync(int status);
        Task<IEnumerable<Request>> GetByDepartmentAsync(int departmentId);
    }
}
