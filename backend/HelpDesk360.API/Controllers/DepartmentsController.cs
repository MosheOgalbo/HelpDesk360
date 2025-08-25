
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HelpDesk360.API.Data;
using HelpDesk360.API.DTOs;

namespace HelpDesk360.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DepartmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DepartmentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all active departments
    /// </summary>
    /// <returns>List of departments</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<DepartmentResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<DepartmentResponseDto>>> GetDepartments()
    {
        var departments = await _context.Departments
            .Where(d => d.IsActive)
            .Select(d => new DepartmentResponseDto
            {
                Id = d.Id,
                Name = d.Name,
                Code = d.Code,
                IsActive = d.IsActive
            })
            .OrderBy(d => d.Name)
            .ToListAsync();

        return Ok(departments);
    }
}
