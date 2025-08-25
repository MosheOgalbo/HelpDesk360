using HelpDesk360.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk360.API.Controllers
{
    public record MonthlyDeptReportDto(string Department, int Total, int PrevMonth, int SameMonthLastYear);

    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ReportsController(AppDbContext db) { _db = db; }

        // GET: api/reports/monthly?year=2025&month=8
        [HttpGet("monthly")]
        public async Task<ActionResult<IEnumerable<MonthlyDeptReportDto>>> GetMonthly([FromQuery] int year, [FromQuery] int month)
        {
            var pYear = new SqlParameter("@Year", year);
            var pMonth = new SqlParameter("@Month", month);

            var data = await _db.Set<MonthlyDeptReportDto>()
                .FromSqlRaw("EXEC dbo.sp_MonthlySupportReport @Year, @Month", pYear, pMonth)
                .ToListAsync();

            return Ok(data);
        }
    }
}
