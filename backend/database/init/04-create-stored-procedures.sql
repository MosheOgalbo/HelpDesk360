USE HelpDesk360;
GO

-- Drop existing stored procedure if exists
IF OBJECT_ID('sp_GetMonthlyRequestsReport', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE sp_GetMonthlyRequestsReport;
    PRINT 'Existing sp_GetMonthlyRequestsReport procedure dropped';
END
GO

-- Create the monthly requests report stored procedure
CREATE PROCEDURE sp_GetMonthlyRequestsReport
    @Year INT,
    @Month INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @StartDate DATETIME2 = DATEFROMPARTS(@Year, @Month, 1);
    DECLARE @EndDate DATETIME2 = DATEADD(MONTH, 1, @StartDate);

    -- Previous month calculations
    DECLARE @PrevMonth INT = CASE WHEN @Month = 1 THEN 12 ELSE @Month - 1 END;
    DECLARE @PrevYear INT = CASE WHEN @Month = 1 THEN @Year - 1 ELSE @Year END;
    DECLARE @PrevStartDate DATETIME2 = DATEFROMPARTS(@PrevYear, @PrevMonth, 1);
    DECLARE @PrevEndDate DATETIME2 = DATEADD(MONTH, 1, @PrevStartDate);

    -- Previous year same month calculations
    DECLARE @PrevYearStartDate DATETIME2 = DATEFROMPARTS(@Year - 1, @Month, 1);
    DECLARE @PrevYearEndDate DATETIME2 = DATEADD(MONTH, 1, @PrevYearStartDate);

    -- Main report data
    WITH CurrentMonthData AS (
        SELECT
            COUNT(*) as TotalRequests,
            COUNT(CASE WHEN Status = 1 THEN 1 END) as OpenRequests,
            COUNT(CASE WHEN Status = 2 THEN 1 END) as InProgressRequests,
            COUNT(CASE WHEN Status = 3 THEN 1 END) as ResolvedRequests,
            COUNT(CASE WHEN Status = 4 THEN 1 END) as ClosedRequests,
            COUNT(CASE WHEN Priority = 4 THEN 1 END) as CriticalRequests,
            COUNT(CASE WHEN Priority = 3 THEN 1 END) as HighRequests,
            COUNT(CASE WHEN Priority = 2 THEN 1 END) as MediumRequests,
            COUNT(CASE WHEN Priority = 1 THEN 1 END) as LowRequests,
            COALESCE(AVG(
                CASE
                    WHEN ResolvedAt IS NOT NULL
                    THEN DATEDIFF(HOUR, CreatedAt, ResolvedAt)
                END
            ), 0) as AverageResolutionHours
        FROM Requests
        WHERE CreatedAt >= @StartDate AND CreatedAt < @EndDate
    ),
    PreviousMonthData AS (
        SELECT COUNT(*) as PreviousMonthTotal
        FROM Requests
        WHERE CreatedAt >= @PrevStartDate AND CreatedAt < @PrevEndDate
    ),
    PreviousYearData AS (
        SELECT COUNT(*) as PreviousYearSameMonthTotal
        FROM Requests
        WHERE CreatedAt >= @PrevYearStartDate AND CreatedAt < @PrevYearEndDate
    ),
    DepartmentStats AS (
        SELECT
            r.DepartmentId,
            rd.Name as DepartmentName,
            COUNT(*) as RequestCount,
            COALESCE(AVG(
                CASE
                    WHEN r.ResolvedAt IS NOT NULL
                    THEN DATEDIFF(HOUR, r.CreatedAt, r.ResolvedAt)
                END
            ), 0) as AverageResolutionHours,
            CAST(COUNT(*) * 100.0 / (SELECT TotalRequests FROM CurrentMonthData) as DECIMAL(5,2)) as Percentage
        FROM Requests r
        INNER JOIN RequestDepartments rd ON r.DepartmentId = rd.Id
        WHERE r.CreatedAt >= @StartDate AND r.CreatedAt < @EndDate
        GROUP BY r.DepartmentId, rd.Name
    )

    -- Main result set
    SELECT
        cmd.TotalRequests,
        cmd.OpenRequests,
        cmd.InProgressRequests,
        cmd.ResolvedRequests,
        cmd.ClosedRequests,
        cmd.AverageResolutionHours,
        cmd.CriticalRequests,
        cmd.HighRequests,
        cmd.MediumRequests,
        cmd.LowRequests,
        pmd.PreviousMonthTotal,
        (cmd.TotalRequests - pmd.PreviousMonthTotal) as TotalChangeFromPrevious,
        CASE
            WHEN pmd.PreviousMonthTotal = 0 THEN 0
            ELSE CAST((cmd.TotalRequests - pmd.PreviousMonthTotal) * 100.0 / pmd.PreviousMonthTotal as DECIMAL(5,2))
        END as TotalChangePercentage,
        pyd.PreviousYearSameMonthTotal,
        (cmd.TotalRequests - pyd.PreviousYearSameMonthTotal) as TotalChangeFromPreviousYear,
        CASE
            WHEN pyd.PreviousYearSameMonthTotal = 0 THEN 0
            ELSE CAST((cmd.TotalRequests - pyd.PreviousYearSameMonthTotal) * 100.0 / pyd.PreviousYearSameMonthTotal as DECIMAL(5,2))
        END as TotalChangePercentageFromPreviousYear,
        -- Department data (will be null for main record)
        CAST(NULL as INT) as DepartmentId,
        CAST(NULL as NVARCHAR(100)) as DepartmentName,
        CAST(NULL as INT) as DeptRequestCount,
        CAST(NULL as DECIMAL(10,2)) as DeptAverageResolutionHours,
        CAST(NULL as DECIMAL(5,2)) as DeptPercentage
    FROM CurrentMonthData cmd
    CROSS JOIN PreviousMonthData pmd
    CROSS JOIN PreviousYearData pyd

    UNION ALL

    -- Department stats
    SELECT
        cmd.TotalRequests,
        cmd.OpenRequests,
        cmd.InProgressRequests,
        cmd.ResolvedRequests,
        cmd.ClosedRequests,
        cmd.AverageResolutionHours,
        cmd.CriticalRequests,
        cmd.HighRequests,
        cmd.MediumRequests,
        cmd.LowRequests,
        pmd.PreviousMonthTotal,
        (cmd.TotalRequests - pmd.PreviousMonthTotal) as TotalChangeFromPrevious,
        CASE
            WHEN pmd.PreviousMonthTotal = 0 THEN 0
            ELSE CAST((cmd.TotalRequests - pmd.PreviousMonthTotal) * 100.0 / pmd.PreviousMonthTotal as DECIMAL(5,2))
        END as TotalChangePercentage,
        pyd.PreviousYearSameMonthTotal,
        (cmd.TotalRequests - pyd.PreviousYearSameMonthTotal) as TotalChangeFromPreviousYear,
        CASE
            WHEN pyd.PreviousYearSameMonthTotal = 0 THEN 0
            ELSE CAST((cmd.TotalRequests - pyd.PreviousYearSameMonthTotal) * 100.0 / pyd.PreviousYearSameMonthTotal as DECIMAL(5,2))
        END as TotalChangePercentageFromPreviousYear,
        -- Department specific data
        ds.DepartmentId,
        ds.DepartmentName,
        ds.RequestCount as DeptRequestCount,
        ds.AverageResolutionHours as DeptAverageResolutionHours,
        ds.Percentage as DeptPercentage
    FROM DepartmentStats ds
    CROSS JOIN CurrentMonthData cmd
    CROSS JOIN PreviousMonthData pmd
    CROSS JOIN PreviousYearData pyd;
END
GO

PRINT 'sp_GetMonthlyRequestsReport procedure created successfully';
GO
