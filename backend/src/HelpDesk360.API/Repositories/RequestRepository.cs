using Microsoft.EntityFrameworkCore;
using HelpDesk360.API.Data;
using HelpDesk360.API.Models;
using HelpDesk360.API.Repositories;

namespace HelpDesk360.API.Repositories
{
    public class RequestRepository : IRequestRepository
    {
        private readonly HelpDeskDbContext _context;

        public RequestRepository(HelpDeskDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Request>> GetAllAsync()
        {
            return await _context.Requests
                .Include(r => r.Department)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<Request?> GetByIdAsync(int id)
        {
            return await _context.Requests
                .Include(r => r.Department)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<Request> CreateAsync(Request request)
        {
            _context.Requests.Add(request);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(request.Id) ?? request;
        }

        public async Task<Request?> UpdateAsync(int id, Request request)
        {
            var existingRequest = await _context.Requests.FindAsync(id);
            if (existingRequest == null) return null;

            existingRequest.Title = request.Title;
            existingRequest.Description = request.Description;
            existingRequest.Priority = request.Priority;
            existingRequest.Status = request.Status;
            existingRequest.DepartmentId = request.DepartmentId;
            existingRequest.AssignedTo = request.AssignedTo;
            existingRequest.UpdatedAt = DateTime.UtcNow;

            if (request.Status == 3 && existingRequest.ResolvedAt == null) // Resolved
            {
                existingRequest.ResolvedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var request = await _context.Requests.FindAsync(id);
            if (request == null) return false;

            _context.Requests.Remove(request);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Request>> GetByStatusAsync(int status)
        {
            return await _context.Requests
                .Include(r => r.Department)
                .Where(r => r.Status == status)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Request>> GetByDepartmentAsync(int departmentId)
        {
            return await _context.Requests
                .Include(r => r.Department)
                .Where(r => r.DepartmentId == departmentId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }
    }
}
