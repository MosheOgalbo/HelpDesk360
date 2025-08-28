USE HelpDesk360;

CREATE INDEX IF NOT EXISTS IX_Requests_Status ON Requests (Status);
CREATE INDEX IF NOT EXISTS IX_Requests_Priority ON Requests (Priority);
CREATE INDEX IF NOT EXISTS IX_Requests_CreatedAt ON Requests (CreatedAt DESC);
CREATE INDEX IF NOT EXISTS IX_Requests_DepartmentId ON Requests (DepartmentId);
CREATE INDEX IF NOT EXISTS IX_Requests_Status_CreatedAt ON Requests (Status, CreatedAt DESC);
CREATE INDEX IF NOT EXISTS IX_Requests_DepartmentId_Status ON Requests (DepartmentId, Status);
CREATE INDEX IF NOT EXISTS IX_RequestDepartments_IsActive ON RequestDepartments (IsActive);

SELECT 'Indexes created successfully' as message;
