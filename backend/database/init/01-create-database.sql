-- Create HelpDesk360 Database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HelpDesk360')
BEGIN
    CREATE DATABASE HelpDesk360;
    PRINT 'HelpDesk360 database created successfully';
END
ELSE
BEGIN
    PRINT 'HelpDesk360 database already exists';
END
GO

USE HelpDesk360;
GO
