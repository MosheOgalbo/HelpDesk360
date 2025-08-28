USE HelpDesk360;

-- Create RequestDepartments table
CREATE TABLE IF NOT EXISTS RequestDepartments (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description VARCHAR(500) NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default departments
INSERT IGNORE INTO RequestDepartments (Name, Description) VALUES
('IT Support', 'Information Technology support requests'),
('HR', 'Human Resources related requests'),
('Finance', 'Financial and accounting requests'),
('Facilities', 'Office facilities and maintenance requests');

-- Create Requests table
CREATE TABLE IF NOT EXISTS Requests (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    Priority INT NOT NULL CHECK (Priority BETWEEN 1 AND 4),
    Status INT NOT NULL CHECK (Status BETWEEN 1 AND 4) DEFAULT 1,
    DepartmentId INT NOT NULL,
    RequestorName VARCHAR(100) NOT NULL,
    RequestorEmail VARCHAR(200) NOT NULL,
    RequestorPhone VARCHAR(20) NOT NULL,
    AssignedTo VARCHAR(100) NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ResolvedAt TIMESTAMP NULL,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT FK_Requests_DepartmentId
        FOREIGN KEY (DepartmentId)
        REFERENCES RequestDepartments(Id)
        ON DELETE RESTRICT
);

SELECT 'Tables created successfully' as message;
