USE HelpDesk360;

DROP PROCEDURE IF EXISTS sp_GetMonthlyRequestsReport;

DELIMITER //

CREATE PROCEDURE sp_GetMonthlyRequestsReport(
    IN p_Year INT,
    IN p_Month INT
)
BEGIN
    DECLARE v_StartDate DATETIME;
    DECLARE v_EndDate DATETIME;
    DECLARE v_PrevStartDate DATETIME;
    DECLARE v_PrevEndDate DATETIME;
    DECLARE v_PrevYearStartDate DATETIME;
    DECLARE v_PrevYearEndDate DATETIME;

    -- Calculate dates
    SET v_StartDate = STR_TO_DATE(CONCAT(p_Year, '-', LPAD(p_Month, 2, '0'), '-01'), '%Y-%m-%d');
    SET v_EndDate = DATE_ADD(v_StartDate, INTERVAL 1 MONTH);

    -- Previous month
    SET v_PrevStartDate = DATE_SUB(v_StartDate, INTERVAL 1 MONTH);
    SET v_PrevEndDate = v_StartDate;

    -- Previous year same month
    SET v_PrevYearStartDate = DATE_SUB(v_StartDate, INTERVAL 1 YEAR);
    SET v_PrevYearEndDate = DATE_SUB(v_EndDate, INTERVAL 1 YEAR);

    -- Main report data
    SELECT
        COUNT(*) as TotalRequests,
        COUNT(CASE WHEN Status = 1 THEN 1 END) as OpenRequests,
        COUNT(CASE WHEN Status = 2 THEN 1 END) as InProgressRequests,
        COUNT(CASE WHEN Status = 3 THEN 1 END) as ResolvedRequests,
        COUNT(CASE WHEN Status = 4 THEN 1 END) as ClosedRequests,
        COALESCE(AVG(CASE WHEN ResolvedAt IS NOT NULL THEN TIMESTAMPDIFF(HOUR, CreatedAt, ResolvedAt) END), 0) as AverageResolutionHours,
        COUNT(CASE WHEN Priority = 4 THEN 1 END) as CriticalRequests,
        COUNT(CASE WHEN Priority = 3 THEN 1 END) as HighRequests,
        COUNT(CASE WHEN Priority = 2 THEN 1 END) as MediumRequests,
        COUNT(CASE WHEN Priority = 1 THEN 1 END) as LowRequests,
        -- Previous comparisons
        (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevStartDate AND CreatedAt < v_PrevEndDate) as PreviousMonthTotal,
        (COUNT(*) - (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevStartDate AND CreatedAt < v_PrevEndDate)) as TotalChangeFromPrevious,
        CASE
            WHEN (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevStartDate AND CreatedAt < v_PrevEndDate) = 0 THEN 0
            ELSE ROUND((COUNT(*) - (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevStartDate AND CreatedAt < v_PrevEndDate)) * 100.0 / (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevStartDate AND CreatedAt < v_PrevEndDate), 2)
        END as TotalChangePercentage,
        -- Previous year
        (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevYearStartDate AND CreatedAt < v_PrevYearEndDate) as PreviousYearSameMonthTotal,
        (COUNT(*) - (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevYearStartDate AND CreatedAt < v_PrevYearEndDate)) as TotalChangeFromPreviousYear,
        CASE
            WHEN (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevYearStartDate AND CreatedAt < v_PrevYearEndDate) = 0 THEN 0
            ELSE ROUND((COUNT(*) - (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevYearStartDate AND CreatedAt < v_PrevYearEndDate)) * 100.0 / (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevYearStartDate AND CreatedAt < v_PrevYearEndDate), 2)
        END as TotalChangePercentageFromPreviousYear,
        -- Null department fields for main record
        NULL as DepartmentId,
        NULL as DepartmentName,
        NULL as DeptRequestCount,
        NULL as DeptAverageResolutionHours,
        NULL as DeptPercentage
    FROM Requests
    WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate;

    -- Department statistics
    SELECT
        -- Main data again for consistency
        (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) as TotalRequests,
        (SELECT COUNT(CASE WHEN Status = 1 THEN 1 END) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) as OpenRequests,
        (SELECT COUNT(CASE WHEN Status = 2 THEN 1 END) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) as InProgressRequests,
        (SELECT COUNT(CASE WHEN Status = 3 THEN 1 END) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) as ResolvedRequests,
        (SELECT COUNT(CASE WHEN Status = 4 THEN 1 END) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) as ClosedRequests,
        (SELECT COALESCE(AVG(CASE WHEN ResolvedAt IS NOT NULL THEN TIMESTAMPDIFF(HOUR, CreatedAt, ResolvedAt) END), 0) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) as AverageResolutionHours,
        (SELECT COUNT(CASE WHEN Priority = 4 THEN 1 END) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) as CriticalRequests,
        (SELECT COUNT(CASE WHEN Priority = 3 THEN 1 END) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) as HighRequests,
        (SELECT COUNT(CASE WHEN Priority = 2 THEN 1 END) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) as MediumRequests,
        (SELECT COUNT(CASE WHEN Priority = 1 THEN 1 END) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) as LowRequests,
        (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevStartDate AND CreatedAt < v_PrevEndDate) as PreviousMonthTotal,
        ((SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) - (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevStartDate AND CreatedAt < v_PrevEndDate)) as TotalChangeFromPrevious,
        CASE
            WHEN (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevStartDate AND CreatedAt < v_PrevEndDate) = 0 THEN 0
            ELSE ROUND(((SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) - (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevStartDate AND CreatedAt < v_PrevEndDate)) * 100.0 / (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevStartDate AND CreatedAt < v_PrevEndDate), 2)
        END as TotalChangePercentage,
        (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevYearStartDate AND CreatedAt < v_PrevYearEndDate) as PreviousYearSameMonthTotal,
        ((SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) - (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevYearStartDate AND CreatedAt < v_PrevYearEndDate)) as TotalChangeFromPreviousYear,
        CASE
            WHEN (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevYearStartDate AND CreatedAt < v_PrevYearEndDate) = 0 THEN 0
            ELSE ROUND(((SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate) - (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevYearStartDate AND CreatedAt < v_PrevYearEndDate)) * 100.0 / (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_PrevYearStartDate AND CreatedAt < v_PrevYearEndDate), 2)
        END as TotalChangePercentageFromPreviousYear,
        -- Department specific data
        r.DepartmentId,
        rd.Name as DepartmentName,
        COUNT(*) as DeptRequestCount,
        COALESCE(AVG(CASE WHEN r.ResolvedAt IS NOT NULL THEN TIMESTAMPDIFF(HOUR, r.CreatedAt, r.ResolvedAt) END), 0) as DeptAverageResolutionHours,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Requests WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate), 2) as DeptPercentage
    FROM Requests r
    INNER JOIN RequestDepartments rd ON r.DepartmentId = rd.Id
    WHERE r.CreatedAt >= v_StartDate AND r.CreatedAt < v_EndDate
    GROUP BY r.DepartmentId, rd.Name;

END //

DELIMITER ;

SELECT 'Stored procedure created successfully' as message;
