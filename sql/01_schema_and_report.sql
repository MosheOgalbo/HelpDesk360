
-- Create schema and tables
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'dbo') EXEC('CREATE SCHEMA dbo');

IF OBJECT_ID('dbo.SupportRequests', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SupportRequests (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(120) NOT NULL,
        Phone NVARCHAR(30) NOT NULL,
        Email NVARCHAR(200) NOT NULL,
        Description NVARCHAR(2000) NOT NULL,
        CreatedAtUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;

IF OBJECT_ID('dbo.Departments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Departments (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL UNIQUE
    );

    INSERT INTO dbo.Departments(Name) VALUES (N'IT'),(N'HR'),(N'Finance'),(N'Facilities');
END;

IF OBJECT_ID('dbo.SupportRequestDepartments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SupportRequestDepartments (
        SupportRequestId INT NOT NULL,
        DepartmentId INT NOT NULL,
        CONSTRAINT PK_SupportRequestDepartments PRIMARY KEY (SupportRequestId, DepartmentId),
        CONSTRAINT FK_SRD_Request FOREIGN KEY (SupportRequestId) REFERENCES dbo.SupportRequests(Id) ON DELETE CASCADE,
        CONSTRAINT FK_SRD_Department FOREIGN KEY (DepartmentId) REFERENCES dbo.Departments(Id) ON DELETE CASCADE
    );
END;

GO

-- Monthly report stored procedure
IF OBJECT_ID('dbo.sp_MonthlySupportReport', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_MonthlySupportReport;
GO

CREATE PROCEDURE dbo.sp_MonthlySupportReport
    @Year INT,
    @Month INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @StartDate DATE = DATEFROMPARTS(@Year, @Month, 1);
    DECLARE @EndDate DATE = DATEADD(MONTH, 1, @StartDate);

    DECLARE @PrevStart DATE = DATEADD(MONTH, -1, @StartDate);
    DECLARE @PrevEnd   DATE = @StartDate;

    DECLARE @LyStart DATE = DATEADD(YEAR, -1, @StartDate);
    DECLARE @LyEnd   DATE = DATEADD(MONTH, 1, @LyStart);

    ;WITH CurrentMonth AS (
        SELECT d.Name AS Department, COUNT(*) AS Total
        FROM dbo.SupportRequests r
        JOIN dbo.SupportRequestDepartments rd ON rd.SupportRequestId = r.Id
        JOIN dbo.Departments d ON d.Id = rd.DepartmentId
        WHERE r.CreatedAtUtc >= @StartDate AND r.CreatedAtUtc < @EndDate
        GROUP BY d.Name
    ),
    PrevMonth AS (
        SELECT d.Name AS Department, COUNT(*) AS Total
        FROM dbo.SupportRequests r
        JOIN dbo.SupportRequestDepartments rd ON rd.SupportRequestId = r.Id
        JOIN dbo.Departments d ON d.Id = rd.DepartmentId
        WHERE r.CreatedAtUtc >= @PrevStart AND r.CreatedAtUtc < @PrevEnd
        GROUP BY d.Name
    ),
    LastYear AS (
        SELECT d.Name AS Department, COUNT(*) AS Total
        FROM dbo.SupportRequests r
        JOIN dbo.SupportRequestDepartments rd ON rd.SupportRequestId = r.Id
        JOIN dbo.Departments d ON d.Id = rd.DepartmentId
        WHERE r.CreatedAtUtc >= @LyStart AND r.CreatedAtUtc < @LyEnd
        GROUP BY d.Name
    )
    SELECT 
        COALESCE(c.Department, p.Department, l.Department) AS Department,
        ISNULL(c.Total, 0) AS Total,
        ISNULL(p.Total, 0) AS PrevMonth,
        ISNULL(l.Total, 0) AS SameMonthLastYear
    FROM CurrentMonth c
    FULL OUTER JOIN PrevMonth p ON p.Department = c.Department
    FULL OUTER JOIN LastYear l ON l.Department = COALESCE(c.Department, p.Department)
    ORDER BY Department;
END;
GO

-- Suggested indexes for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SupportRequests_CreatedAtUtc' AND object_id = OBJECT_ID('dbo.SupportRequests'))
    CREATE INDEX IX_SupportRequests_CreatedAtUtc ON dbo.SupportRequests (CreatedAtUtc);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SRD_Department' AND object_id = OBJECT_ID('dbo.SupportRequestDepartments'))
    CREATE INDEX IX_SRD_Department ON dbo.SupportRequestDepartments (DepartmentId);
