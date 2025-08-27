USE HelpDesk360;
GO

-- Insert sample data for testing
IF NOT EXISTS (SELECT 1 FROM Requests)
BEGIN
    PRINT 'Inserting sample data...';

    -- Insert some sample requests
    INSERT INTO Requests (Title, Description, Priority, Status, DepartmentId, RequestorName, RequestorEmail, RequestorPhone, AssignedTo, CreatedAt, ResolvedAt, UpdatedAt)
    VALUES
    ('Email server down', 'Unable to access email server since morning', 4, 3, 1, 'John Doe', 'john.doe@company.com', '050-1234567', 'IT Admin', DATEADD(day, -30, GETUTCDATE()), DATEADD(day, -29, GETUTCDATE()), DATEADD(day, -29, GETUTCDATE())),
    ('New employee setup', 'Need to setup workstation for new hire', 2, 4, 1, 'HR Manager', 'hr@company.com', '050-2345678', 'IT Admin', DATEADD(day, -25, GETUTCDATE()), DATEADD(day, -20, GETUTCDATE()), DATEADD(day, -20, GETUTCDATE())),
    ('Payroll question', 'Question about overtime calculation', 3, 3, 2, 'Jane Smith', 'jane.smith@company.com', '050-3456789', 'HR Specialist', DATEADD(day, -20, GETUTCDATE()), DATEADD(day, -18, GETUTCDATE()), DATEADD(day, -18, GETUTCDATE())),
    ('Office AC not working', 'Air conditioning in floor 3 is not working', 3, 2, 4, 'Mike Johnson', 'mike.johnson@company.com', '050-4567890', 'Facilities Team', DATEADD(day, -15, GETUTCDATE()), NULL, DATEADD(day, -10, GETUTCDATE())),
    ('Software license renewal', 'Need to renew Adobe Creative Suite licenses', 2, 1, 1, 'Design Team Lead', 'design@company.com', '050-5678901', NULL, DATEADD(day, -10, GETUTCDATE()), NULL, DATEADD(day, -10, GETUTCDATE())),
    ('Budget approval needed', 'Q4 marketing budget needs approval', 3, 2, 3, 'Marketing Manager', 'marketing@company.com', '050-6789012', 'CFO', DATEADD(day, -8, GETUTCDATE()), NULL, DATEADD(day, -5, GETUTCDATE())),
    ('Printer jam issue', 'Main office printer keeps jamming', 1, 1, 1, 'Office Admin', 'admin@company.com', '050-7890123', NULL, DATEADD(day, -5, GETUTCDATE()), NULL, DATEADD(day, -5, GETUTCDATE())),
    ('Conference room booking', 'Need to book large conference room for next week', 1, 4, 4, 'Project Manager', 'pm@company.com', '050-8901234', 'Facilities Team', DATEADD(day, -3, GETUTCDATE()), DATEADD(day, -2, GETUTCDATE()), DATEADD(day, -2, GETUTCDATE()));

    -- Insert requests from previous months for comparison
    INSERT INTO Requests (Title, Description, Priority, Status, DepartmentId, RequestorName, RequestorEmail, RequestorPhone, AssignedTo, CreatedAt, ResolvedAt, UpdatedAt)
    VALUES
    ('Previous month request 1', 'Test request from previous month', 2, 3, 1, 'User 1', 'user1@company.com', '050-1111111', 'IT Admin', DATEADD(month, -1, GETUTCDATE()), DATEADD(day, -35, GETUTCDATE()), DATEADD(day, -35, GETUTCDATE())),
    ('Previous month request 2', 'Another test request from previous month', 3, 4, 2, 'User 2', 'user2@company.com', '050-2222222', 'HR Team', DATEADD(month, -1, GETUTCDATE()), DATEADD(day, -32, GETUTCDATE()), DATEADD(day, -32, GETUTCDATE())),
    ('Previous year request 1', 'Test request from same month last year', 2, 4, 1, 'User 3', 'user3@company.com', '050-3333333', 'IT Admin', DATEADD(year, -1, GETUTCDATE()), DATEADD(year, -1, DATEADD(day, -2, GETUTCDATE())), DATEADD(year, -1, DATEADD(day, -2, GETUTCDATE())));

    PRINT 'Sample data inserted successfully';
END
ELSE
BEGIN
    PRINT 'Sample data already exists';
END
GO
