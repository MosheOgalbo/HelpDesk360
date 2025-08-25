using HelpDesk360.API.Data;
using HelpDesk360.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk360.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RequestsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ILogger<RequestsController> _logger;

        public RequestsController(AppDbContext db, ILogger<RequestsController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // GET: api/requests
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SupportRequestDto>>> GetAll()
        {
            var data = await _db.SupportRequests
                .Include(x => x.SupportRequestDepartments)
                .Select(x => new SupportRequestDto(
                    x.Id,
                    x.Name,
                    x.Phone,
                    x.Email,
                    x.SupportRequestDepartments.Select(d => d.DepartmentId).ToList(),
                    x.Description,
                    x.CreatedAtUtc
                ))
                .ToListAsync();
            return Ok(data);
        }

        // GET: api/requests/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<SupportRequestDto>> GetById(int id)
        {
            var x = await _db.SupportRequests
                .Include(s => s.SupportRequestDepartments)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (x == null) return NotFound();

            return Ok(new SupportRequestDto(
                x.Id,
                x.Name,
                x.Phone,
                x.Email,
                x.SupportRequestDepartments.Select(d => d.DepartmentId).ToList(),
                x.Description,
                x.CreatedAtUtc
            ));
        }

        // POST: api/requests
        [HttpPost]
        public async Task<ActionResult<SupportRequestDto>> Create([FromBody] SupportRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entity = new SupportRequest
            {
                Name = dto.Name,
                Phone = dto.Phone,
                Email = dto.Email,
                Description = dto.Description,
                CreatedAtUtc = DateTime.UtcNow
            };

            // attach departments
            var validDeptIds = await _db.Departments
                .Where(d => dto.DepartmentIds.Contains(d.Id))
                .Select(d => d.Id)
                .ToListAsync();

            entity.SupportRequestDepartments = validDeptIds
                .Select(id => new SupportRequestDepartment { DepartmentId = id, SupportRequest = entity })
                .ToList();

            _db.SupportRequests.Add(entity);
            await _db.SaveChangesAsync();

            var result = new SupportRequestDto(
                entity.Id, entity.Name, entity.Phone, entity.Email,
                entity.SupportRequestDepartments.Select(d => d.DepartmentId).ToList(),
                entity.Description, entity.CreatedAtUtc
            );
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, result);
        }

        // PUT: api/requests/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] SupportRequestDto dto)
        {
            var entity = await _db.SupportRequests
                .Include(s => s.SupportRequestDepartments)
                .FirstOrDefaultAsync(s => s.Id == id);
            if (entity == null) return NotFound();

            entity.Name = dto.Name;
            entity.Phone = dto.Phone;
            entity.Email = dto.Email;
            entity.Description = dto.Description;

            // Update departments
            var newDeptIds = new HashSet<int>(dto.DepartmentIds);
            var existing = entity.SupportRequestDepartments.ToList();
            // remove old
            foreach (var link in existing)
            {
                if (!newDeptIds.Contains(link.DepartmentId))
                    _db.SupportRequestDepartments.Remove(link);
            }
            // add new
            var existingIds = new HashSet<int>(existing.Select(l => l.DepartmentId));
            var toAdd = newDeptIds.Except(existingIds).ToList();
            foreach (var idToAdd in toAdd)
            {
                entity.SupportRequestDepartments.Add(new SupportRequestDepartment
                {
                    DepartmentId = idToAdd,
                    SupportRequestId = entity.Id
                });
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/requests/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.SupportRequests.FindAsync(id);
            if (entity == null) return NotFound();
            _db.SupportRequests.Remove(entity);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
