using Microsoft.EntityFrameworkCore;
using HelpDesk360.API.Data;
using HelpDesk360.API.DTOs;
using HelpDesk360.API.Repositories;
using System.Globalization;
using System.Data;

namespace HelpDesk360.API.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly HelpDeskDbContext _context;

        // הזרקת DbContext דרך ה-Constructor
        public ReportRepository(HelpDeskDbContext context)
        {
            _context = context;
        }

        // פונקציה שמחזירה דוח חודשי (או null אם לא נמצאו נתונים)
        public async Task<MonthlyReportDto?> GetMonthlyReportAsync(int year, int month)
        {
            // קבלת החיבור למסד הנתונים מתוך ה-DbContext
            var connection = _context.Database.GetDbConnection();

            try
            {
                // פתיחת החיבור אם הוא עדיין סגור
                if (connection.State != ConnectionState.Open)
                {
                    await connection.OpenAsync();
                }

                // יצירת פקודה להרצת Stored Procedure
                using var command = connection.CreateCommand();
                command.CommandType = CommandType.StoredProcedure;
                command.CommandText = "sp_GetMonthlyRequestsReport"; // שם הפרוצדורה במסד הנתונים

                // יצירת פרמטר לשנה
                var yearParam = command.CreateParameter();
                yearParam.ParameterName = "p_Year"; // שם הפרמטר בפרוצדורה
                yearParam.Value = year;             // הערך שנשלח
                command.Parameters.Add(yearParam);

                // יצירת פרמטר לחודש
                var monthParam = command.CreateParameter();
                monthParam.ParameterName = "p_Month";
                monthParam.Value = month;
                command.Parameters.Add(monthParam);

                // הרצת הפרוצדורה וקבלת תוצאות
                using var reader = await command.ExecuteReaderAsync();

                MonthlyReportDto? report = null; // הדוח הראשי
                var departmentStats = new List<DepartmentStatDto>(); // רשימת סטטיסטיקות למחלקות

                // קריאת ה-ResultSet הראשון – נתוני סיכום
                if (await reader.ReadAsync())
                {
                    report = new MonthlyReportDto
                    {
                        Year = year,
                        Month = month,
                        // המרת מספר החודש לשם (למשל: January, February וכו')
                        MonthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(month),

                        // מילוי הערכים מה-ResultSet
                        TotalRequests = reader.GetInt32("TotalRequests"),
                        OpenRequests = reader.GetInt32("OpenRequests"),
                        InProgressRequests = reader.GetInt32("InProgressRequests"),
                        ResolvedRequests = reader.GetInt32("ResolvedRequests"),
                        ClosedRequests = reader.GetInt32("ClosedRequests"),
                        AverageResolutionHours = reader.GetDouble("AverageResolutionHours"),
                        CriticalRequests = reader.GetInt32("CriticalRequests"),
                        HighRequests = reader.GetInt32("HighRequests"),
                        MediumRequests = reader.GetInt32("MediumRequests"),
                        LowRequests = reader.GetInt32("LowRequests"),
                        PreviousMonthTotal = reader.GetInt32("PreviousMonthTotal"),
                        TotalChangeFromPrevious = reader.GetInt32("TotalChangeFromPrevious"),
                        TotalChangePercentage = reader.GetDouble("TotalChangePercentage"),
                        PreviousYearSameMonthTotal = reader.GetInt32("PreviousYearSameMonthTotal"),
                        TotalChangeFromPreviousYear = reader.GetInt32("TotalChangeFromPreviousYear"),
                        TotalChangePercentageFromPreviousYear = reader.GetDouble("TotalChangePercentageFromPreviousYear")
                    };
                }

                // קריאת ה-ResultSet השני – פילוח לפי מחלקות
                if (await reader.NextResultAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        departmentStats.Add(new DepartmentStatDto
                        {
                            DepartmentId = reader.GetInt32("DepartmentId"),
                            DepartmentName = reader.GetString("DepartmentName"),
                            RequestCount = reader.GetInt32("DeptRequestCount"),
                            AverageResolutionHours = reader.GetDouble("DeptAverageResolutionHours"),
                            Percentage = reader.GetDouble("DeptPercentage")
                        });
                    }
                }

                // חיבור הנתונים הראשיים עם הסטטיסטיקה למחלקות
                if (report != null)
                {
                    report.DepartmentStats = departmentStats;
                }

                return report;
            }
            finally
            {
                // סגירת החיבור תמיד (גם אם הייתה שגיאה)
                await connection.CloseAsync();
            }
        }
    }

    // מחלקת עזר (לא בשימוש ישיר בקוד אבל מייצגת את הנתונים הגולמיים מהפרוצדורה)
    public class MonthlyReportResult
    {
        public int TotalRequests { get; set; }
        public int OpenRequests { get; set; }
        public int InProgressRequests { get; set; }
        public int ResolvedRequests { get; set; }
        public int ClosedRequests { get; set; }
        public double AverageResolutionHours { get; set; }
        public int CriticalRequests { get; set; }
        public int HighRequests { get; set; }
        public int MediumRequests { get; set; }
        public int LowRequests { get; set; }
        public int PreviousMonthTotal { get; set; }
        public int TotalChangeFromPrevious { get; set; }
        public double TotalChangePercentage { get; set; }
        public int PreviousYearSameMonthTotal { get; set; }
        public int TotalChangeFromPreviousYear { get; set; }
        public double TotalChangePercentageFromPreviousYear { get; set; }

        // שדות ייחודיים לסטטיסטיקה לפי מחלקות
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public int? DeptRequestCount { get; set; }
        public double? DeptAverageResolutionHours { get; set; }
        public double? DeptPercentage { get; set; }
    }
}
