USE HelpDesk360;
GO

-- Create RequestDepartments table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RequestDepartments')
BEGIN
    CREATE TABLE RequestDepartments (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL UNIQUE,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );

    PRINT 'RequestDepartments table created successfully';

    -- Insert default departments
    INSERT INTO RequestDepartments (Name, Description) VALUES
    ('IT Support', 'Information Technology support requests'),
    ('HR', 'Human Resources related requests'),
    ('Finance', 'Financial and accounting requests'),
    ('Facilities', 'Office facilities and maintenance requests');

    PRINT 'Default departments inserted';
END
ELSE
BEGIN
    PRINT 'RequestDepartments table already exists';
END
GO

-- Create Requests table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Requests')
BEGIN
    CREATE TABLE Requests (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(2000) NOT NULL,
        Priority INT NOT NULL CHECK (Priority BETWEEN 1 AND 4), -- 1=Low, 2=Medium, 3=High, 4=Critical
        Status INT NOT NULL CHECK (Status BETWEEN 1 AND 4) DEFAULT 1, -- 1=Open, 2=InProgress, 3=Resolved, 4=Closed
        DepartmentId INT NOT NULL,
        RequestorName NVARCHAR(100) NOT NULL,
        RequestorEmail NVARCHAR(200) NOT NULL,
        RequestorPhone NVARCHAR(20) NOT NULL,
        AssignedTo NVARCHAR(100) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ResolvedAt DATETIME2 NULL,
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT FK_Requests_DepartmentId
            FOREIGN KEY (DepartmentId)
            REFERENCES RequestDepartments(Id)
            ON DELETE RESTRICT
    );

    PRINT 'Requests table created successfully';
END
ELSE
BEGIN
    PRINT 'Requests table already exists';
END
GO
