USE HelpDesk360;
GO

-- Indexes for Requests table
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Requests_Status' AND object_id = OBJECT_ID('Requests'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Requests_Status ON Requests (Status);
    PRINT 'Index IX_Requests_Status created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Requests_Priority' AND object_id = OBJECT_ID('Requests'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Requests_Priority ON Requests (Priority);
    PRINT 'Index IX_Requests_Priority created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Requests_CreatedAt' AND object_id = OBJECT_ID('Requests'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Requests_CreatedAt ON Requests (CreatedAt DESC);
    PRINT 'Index IX_Requests_CreatedAt created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Requests_DepartmentId' AND object_id = OBJECT_ID('Requests'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Requests_DepartmentId ON Requests (DepartmentId);
    PRINT 'Index IX_Requests_DepartmentId created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Requests_Status_CreatedAt' AND object_id = OBJECT_ID('Requests'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Requests_Status_CreatedAt ON Requests (Status, CreatedAt DESC);
    PRINT 'Composite index IX_Requests_Status_CreatedAt created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Requests_DepartmentId_Status' AND object_id = OBJECT_ID('Requests'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Requests_DepartmentId_Status ON Requests (DepartmentId, Status);
    PRINT 'Composite index IX_Requests_DepartmentId_Status created';
END

-- Indexes for RequestDepartments table
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_RequestDepartments_IsActive' AND object_id = OBJECT_ID('RequestDepartments'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_RequestDepartments_IsActive ON RequestDepartments (IsActive);
    PRINT 'Index IX_RequestDepartments_IsActive created';
END

-- Performance index for reporting queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Requests_CreatedAt_Status_Priority' AND object_id = OBJECT_ID('Requests'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Requests_CreatedAt_Status_Priority
    ON Requests (CreatedAt DESC)
    INCLUDE (Status, Priority, DepartmentId, ResolvedAt);
    PRINT 'Performance index IX_Requests_CreatedAt_Status_Priority created';
END
GO
