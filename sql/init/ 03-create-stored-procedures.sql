
-- Stored Procedure: Get Monthly Support Report
CREATE OR ALTER PROCEDURE [dbo].[GetMonthlySupportReport]
    @Year INT,
    @Month INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentMonthStart DATETIME2 = DATEFROMPARTS(@Year, @Month, 1);
    DECLARE @CurrentMonthEnd DATETIME2 = EOMONTH(@CurrentMonthStart);

    DECLARE @PreviousMonthStart DATETIME2 = DATEADD(MONTH, -1, @CurrentMonthStart);
    DECLARE @PreviousMonthEnd DATETIME2 = EOMONTH(@PreviousMonthStart);

    DECLARE @SameMonthLastYearStart DATETIME2 = DATEADD(YEAR, -1, @CurrentMonthStart);
    DECLARE @SameMonthLastYearEnd DATETIME2 = EOMONTH(@SameMonthLastYearStart);

    -- CTE for current month data
    WITH CurrentMonthData AS (
        SELECT
            d.Id as DepartmentId,
            d.Name as DepartmentName,
            d.Code as DepartmentCode,
            COUNT(DISTINCT r.Id) as CurrentMonthRequests,
            AVG(CAST(
                CASE
                    WHEN r.ResolvedAt IS NOT NULL
                    THEN DATEDIFF(HOUR, r.CreatedAt, r.ResolvedAt)
                    ELSE NULL
                END AS FLOAT)
            ) as AvgResolutionTimeHours
        FROM [dbo].[Departments] d
        LEFT JOIN [dbo].[RequestDepartments] rd ON d.Id = rd.DepartmentId
        LEFT JOIN [dbo].[Requests] r ON rd.RequestId = r.Id
            AND r.CreatedAt >= @CurrentMonthStart
            AND r.CreatedAt <= @CurrentMonthEnd
        WHERE d.IsActive = 1
        GROUP BY d.Id, d.Name, d.Code
    ),
    -- CTE for previous month data
    PreviousMonthData AS (
        SELECT
            d.Id as DepartmentId,
            COUNT(DISTINCT r.Id) as PreviousMonthRequests
        FROM [dbo].[Departments] d
        LEFT JOIN [dbo].[RequestDepartments] rd ON d.Id = rd.DepartmentId
        LEFT JOIN [dbo].[Requests] r ON rd.RequestId = r.Id
            AND r.CreatedAt >= @PreviousMonthStart
            AND r.CreatedAt <= @PreviousMonthEnd
        WHERE d.IsActive = 1
        GROUP BY d.Id
    ),
    -- CTE for same month last year data
    SameMonthLastYearData AS (
        SELECT
            d.Id as DepartmentId,
            COUNT(DISTINCT r.Id) as SameMonthLastYearRequests
        FROM [dbo].[Departments] d
        LEFT JOIN [dbo].[RequestDepartments] rd ON d.Id = rd.DepartmentId
        LEFT JOIN [dbo].[Requests] r ON rd.RequestId = r.Id
            AND r.CreatedAt >= @SameMonthLastYearStart
            AND r.CreatedAt <= @SameMonthLastYearEnd
        WHERE d.IsActive = 1
        GROUP BY d.Id
    )

    -- Final result set
    SELECT
        cmd.DepartmentId,
        cmd.DepartmentName,
        cmd.DepartmentCode,
        cmd.CurrentMonthRequests,
        ISNULL(pmd.PreviousMonthRequests, 0) as PreviousMonthRequests,
        ISNULL(smly.SameMonthLastYearRequests, 0) as SameMonthLastYearRequests,

        -- Calculate percentage changes
        CASE
            WHEN ISNULL(pmd.PreviousMonthRequests, 0) = 0 THEN 100.0
            ELSE ROUND(
                ((CAST(cmd.CurrentMonthRequests AS FLOAT) - CAST(pmd.PreviousMonthRequests AS FLOAT))
                / CAST(pmd.PreviousMonthRequests AS FLOAT)) * 100, 2
            )
        END as PercentChangeFromPreviousMonth,

        CASE
            WHEN ISNULL(smly.SameMonthLastYearRequests, 0) = 0 THEN 100.0
            ELSE ROUND(
                ((CAST(cmd.CurrentMonthRequests AS FLOAT) - CAST(smly.SameMonthLastYearRequests AS FLOAT))
                / CAST(smly.SameMonthLastYearRequests AS FLOAT)) * 100, 2
            )
        END as PercentChangeFromSameMonthLastYear,

        ROUND(ISNULL(cmd.AvgResolutionTimeHours, 0), 2) as AvgResolutionTimeHours,
        @Year as ReportYear,
        @Month as ReportMonth,
        GETUTCDATE() as GeneratedAt

    FROM CurrentMonthData cmd
    LEFT JOIN PreviousMonthData pmd ON cmd.DepartmentId = pmd.DepartmentId
    LEFT JOIN SameMonthLastYearData smly ON cmd.DepartmentId = smly.DepartmentId
    ORDER BY cmd.CurrentMonthRequests DESC, cmd.DepartmentName;

    -- Return summary statistics
    SELECT
        @Year as Year,
        @Month as Month,
        SUM(cmd.CurrentMonthRequests) as TotalRequestsCurrentMonth,
        COUNT(DISTINCT cmd.DepartmentId) as TotalActiveDepartments,
        AVG(cmd.AvgResolutionTimeHours) as OverallAvgResolutionTimeHours,
        (SELECT COUNT(*) FROM [dbo].[Requests] WHERE CreatedAt >= @CurrentMonthStart AND CreatedAt <= @CurrentMonthEnd AND Status = 'Open') as OpenRequests,
        (SELECT COUNT(*) FROM [dbo].[Requests] WHERE CreatedAt >= @CurrentMonthStart AND CreatedAt <= @CurrentMonthEnd AND Status = 'Resolved') as ResolvedRequests,
        GETUTCDATE() as GeneratedAt
    FROM CurrentMonthData cmd;
END
GO

-- Performance optimization: Create additional indexes
CREATE NONCLUSTERED INDEX IX_Requests_CreatedAt_Status_Include
ON [dbo].[Requests] ([CreatedAt], [Status])
INCLUDE ([Id], [ResolvedAt]);

CREATE NONCLUSTERED INDEX IX_RequestDepartments_Composite
ON [dbo].[RequestDepartments] ([DepartmentId], [RequestId])
INCLUDE ([CreatedAt]);

-- Update statistics for better query performance
UPDATE STATISTICS [dbo].[Requests];
UPDATE STATISTICS [dbo].[Departments];
UPDATE STATISTICS [dbo].[RequestDepartments];

-- =============================================
-- Sample Data for Testing
-- =============================================

-- Insert sample requests for testing
DECLARE @ITDeptId INT = (SELECT Id FROM [dbo].[Departments] WHERE Code = 'IT');
DECLARE @HRDeptId INT = (SELECT Id FROM [dbo].[Departments] WHERE Code = 'HR');
DECLARE @FINDeptId INT = (SELECT Id FROM [dbo].[Departments] WHERE Code = 'FIN');

-- Current month requests
INSERT INTO [dbo].[Requests] ([Name], [Phone], [Email], [Description], [Status], [CreatedAt], [ResolvedAt]) VALUES
('John Doe', '+1-555-0123', 'john.doe@company.com', 'Password reset required for email account', 'Resolved', DATEADD(DAY, -5, GETUTCDATE()), DATEADD(DAY, -4, GETUTCDATE())),
('Jane Smith', '+1-555-0124', 'jane.smith@company.com', 'New employee laptop setup needed', 'Open', DATEADD(DAY, -3, GETUTCDATE()), NULL),
('Bob Johnson', '+1-555-0125', 'bob.johnson@company.com', 'Payroll discrepancy investigation', 'Resolved', DATEADD(DAY, -7, GETUTCDATE()), DATEADD(DAY, -2, GETUTCDATE()));

-- Link requests to departments
INSERT INTO [dbo].[RequestDepartments] ([RequestId], [DepartmentId]) VALUES
(1, @ITDeptId),
(2, @ITDeptId),
(2, @HRDeptId),
(3, @FINDeptId),
(3, @HRDeptId);

PRINT 'Database setup completed successfully!';
PRINT 'Sample data inserted for testing.';
PRINT 'To test the stored procedure, run: EXEC GetMonthlySupportReport @Year = YEAR(GETDATE()), @Month = MONTH(GETDATE());';
