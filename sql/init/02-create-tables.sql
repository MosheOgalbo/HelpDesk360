
-- Departments Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Departments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Departments] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL UNIQUE,
        [Code] NVARCHAR(10) NOT NULL UNIQUE,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- Requests Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Requests]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Requests] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(200) NOT NULL,
        [Phone] NVARCHAR(50) NOT NULL,
        [Email] NVARCHAR(320) NOT NULL,
        [Description] NVARCHAR(MAX) NOT NULL,
        [Status] NVARCHAR(50) NOT NULL DEFAULT 'Open',
        [Priority] NVARCHAR(20) NOT NULL DEFAULT 'Medium',
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [ResolvedAt] DATETIME2 NULL,

        -- Indexes for performance
        INDEX IX_Requests_CreatedAt NONCLUSTERED (CreatedAt DESC),
        INDEX IX_Requests_Email NONCLUSTERED (Email),
        INDEX IX_Requests_Status NONCLUSTERED (Status),
        INDEX IX_Requests_Priority NONCLUSTERED (Priority)
    );
END
GO

-- Request-Department junction table (many-to-many)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RequestDepartments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RequestDepartments] (
        [RequestId] INT NOT NULL,
        [DepartmentId] INT NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

        PRIMARY KEY ([RequestId], [DepartmentId]),

        CONSTRAINT FK_RequestDepartments_Request
            FOREIGN KEY ([RequestId]) REFERENCES [dbo].[Requests]([Id]) ON DELETE CASCADE,
        CONSTRAINT FK_RequestDepartments_Department
            FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Departments]([Id]) ON DELETE CASCADE,

        -- Indexes for performance
        INDEX IX_RequestDepartments_DepartmentId NONCLUSTERED (DepartmentId),
        INDEX IX_RequestDepartments_RequestId NONCLUSTERED (RequestId)
    );
END
GO

-- Insert sample departments
IF NOT EXISTS (SELECT 1 FROM [dbo].[Departments])
BEGIN
    INSERT INTO [dbo].[Departments] ([Name], [Code]) VALUES
    ('Information Technology', 'IT'),
    ('Human Resources', 'HR'),
    ('Finance', 'FIN'),
    ('Operations', 'OPS'),
    ('Marketing', 'MKT'),
    ('Legal', 'LEG'),
    ('Administration', 'ADM');
END
GO
