USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'HelpDesk360')
BEGIN
    CREATE DATABASE HelpDesk360;
END
GO

USE HelpDesk360;
GO
