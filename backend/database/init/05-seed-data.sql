USE HelpDesk360;

INSERT IGNORE INTO Requests (Title, Description, Priority, Status, DepartmentId, RequestorName, RequestorEmail, RequestorPhone, AssignedTo, CreatedAt, ResolvedAt, UpdatedAt)
VALUES
('Email server down', 'Unable to access email server since morning', 4, 3, 1, 'John Doe', 'john.doe@company.com', '050-1234567', 'IT Admin',
 DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 29 DAY), DATE_SUB(NOW(), INTERVAL 29 DAY)),
('New employee setup', 'Need to setup workstation for new hire', 2, 4, 1, 'HR Manager', 'hr@company.com', '050-2345678', 'IT Admin',
 DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
('Payroll question', 'Question about overtime calculation', 3, 3, 2, 'Jane Smith', 'jane.smith@company.com', '050-3456789', 'HR Specialist',
 DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
('Office AC not working', 'Air conditioning in floor 3 is not working', 3, 2, 4, 'Mike Johnson', 'mike.johnson@company.com', '050-4567890', 'Facilities Team',
 DATE_SUB(NOW(), INTERVAL 15 DAY), NULL, DATE_SUB(NOW(), INTERVAL 10 DAY)),
('Software license renewal', 'Need to renew Adobe Creative Suite licenses', 2, 1, 1, 'Design Team Lead', 'design@company.com', '050-5678901', NULL,
 DATE_SUB(NOW(), INTERVAL 10 DAY), NULL, DATE_SUB(NOW(), INTERVAL 10 DAY)),
('Budget approval needed', 'Q4 marketing budget needs approval', 3, 2, 3, 'Marketing Manager', 'marketing@company.com', '050-6789012', 'CFO',
 DATE_SUB(NOW(), INTERVAL 8 DAY), NULL, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('Printer jam issue', 'Main office printer keeps jamming', 1, 1, 1, 'Office Admin', 'admin@company.com', '050-7890123', NULL,
 DATE_SUB(NOW(), INTERVAL 5 DAY), NULL, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('Conference room booking', 'Need to book large conference room for next week', 1, 4, 4, 'Project Manager', 'pm@company.com', '050-8901234', 'Facilities Team',
 DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Previous months data
INSERT IGNORE INTO Requests (Title, Description, Priority, Status, DepartmentId, RequestorName, RequestorEmail, RequestorPhone, AssignedTo, CreatedAt, ResolvedAt, UpdatedAt)
VALUES
('Previous month request 1', 'Test request from previous month', 2, 3, 1, 'User 1', 'user1@company.com', '050-1111111', 'IT Admin',
 DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 34 DAY), DATE_SUB(NOW(), INTERVAL 34 DAY)),
('Previous month request 2', 'Another test request from previous month', 3, 4, 2, 'User 2', 'user2@company.com', '050-2222222', 'HR Team',
 DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 38 DAY), DATE_SUB(NOW(), INTERVAL 38 DAY)),
('Previous year request 1', 'Test request from same month last year', 2, 4, 1, 'User 3', 'user3@company.com', '050-3333333', 'IT Admin',
 DATE_SUB(NOW(), INTERVAL 365 DAY), DATE_SUB(NOW(), INTERVAL 363 DAY), DATE_SUB(NOW(), INTERVAL 363 DAY));

SELECT 'Sample data inserted successfully' as message;
