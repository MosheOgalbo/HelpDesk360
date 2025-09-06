using Microsoft.EntityFrameworkCore;
using HelpDesk360.API.Data;
using HelpDesk360.API.Models;
using HelpDesk360.API.Repositories;

namespace HelpDesk360.API.Repositories
{
    public class RequestRepository : IRequestRepository
    {
        private readonly HelpDeskDbContext _context;

        // הזרקת DbContext דרך ה-Constructor
        public RequestRepository(HelpDeskDbContext context)
        {
            _context = context;
        }

        // מחזיר את כל הבקשות מהמסד כולל מחלקה, ממוינות לפי תאריך יצירה (מהחדש לישן)
        public async Task<IEnumerable<Request>> GetAllAsync()
        {
            return await _context.Requests
                .Include(r => r.Department)               // טוען גם את המחלקה (Eager Loading)
                .OrderByDescending(r => r.CreatedAt)      // ממיין מהחדש לישן
                .ToListAsync();
        }

        // מחפש בקשה לפי ID, כולל מידע על המחלקה
        public async Task<Request?> GetByIdAsync(int id)
        {
            return await _context.Requests
                .Include(r => r.Department)
                .FirstOrDefaultAsync(r => r.Id == id);    // מחזיר null אם לא נמצא
        }

        // יצירת בקשה חדשה
        public async Task<Request> CreateAsync(Request request)
        {
            _context.Requests.Add(request);               // מוסיף את הבקשה החדשה ל-DbSet
            await _context.SaveChangesAsync();            // שומר במסד הנתונים

            // מחזיר את הבקשה עם הניווט ל-Department (כדי לקבל את כל הנתונים)
            return await GetByIdAsync(request.Id) ?? request;
        }

        // עדכון בקשה קיימת
        public async Task<Request?> UpdateAsync(int id, Request request)
        {
            var existingRequest = await _context.Requests.FindAsync(id); // מחפש במסד
            if (existingRequest == null) return null;                    // אם לא קיים מחזיר null

            // עדכון שדות
            existingRequest.Title = request.Title;
            existingRequest.Description = request.Description;
            existingRequest.Priority = request.Priority;
            existingRequest.Status = request.Status;
            existingRequest.DepartmentId = request.DepartmentId;
            existingRequest.AssignedTo = request.AssignedTo;
            existingRequest.UpdatedAt = DateTime.UtcNow; // עדכון תאריך עדכון

            // אם הבקשה סומנה כ-Resolved (סטטוס = 3) ועדיין אין ResolvedAt -> מוסיף תאריך פתרון
            if (request.Status == 3 && existingRequest.ResolvedAt == null)
            {
                existingRequest.ResolvedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();            // שומר שינויים
            return await GetByIdAsync(id);                // מחזיר את הבקשה המעודכנת כולל Department
        }

        // מחיקת בקשה לפי ID
        public async Task<bool> DeleteAsync(int id)
        {
            var request = await _context.Requests.FindAsync(id);
            if (request == null) return false;            // אם לא קיים – נכשל

            _context.Requests.Remove(request);            // מוחק מה-DbSet
            await _context.SaveChangesAsync();            // שומר במסד
            return true;
        }

        // מחזיר בקשות לפי סטטוס מסוים
        public async Task<IEnumerable<Request>> GetByStatusAsync(int status)
        {
            return await _context.Requests
                .Include(r => r.Department)               // טוען גם את המחלקה
                .Where(r => r.Status == status)           // מסנן לפי סטטוס
                .OrderByDescending(r => r.CreatedAt)      // מהחדש לישן
                .ToListAsync();
        }

        // מחזיר בקשות לפי מחלקה מסוימת
        public async Task<IEnumerable<Request>> GetByDepartmentAsync(int departmentId)
        {
            return await _context.Requests
                .Include(r => r.Department)
                .Where(r => r.DepartmentId == departmentId) // מסנן לפי מחלקה
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }
    }
}
