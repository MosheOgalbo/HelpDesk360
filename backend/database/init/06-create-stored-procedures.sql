USE HelpDesk360;

DROP PROCEDURE IF EXISTS sp_GetMonthlyRequestsReport;

CREATE PROCEDURE sp_GetMonthlyRequestsReport(
    IN p_Year INT,
    IN p_Month INT
)
BEGIN
    DECLARE v_StartDate DATETIME
    DECLARE v_EndDate DATETIME

    SET v_StartDate = STR_TO_DATE(CONCAT(p_Year, '-', LPAD(p_Month, 2, '0'), '-01'), '%Y-%m-%d')
    SET v_EndDate = DATE_ADD(v_StartDate, INTERVAL 1 MONTH)

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
        0 as PreviousMonthTotal,
        0 as TotalChangeFromPrevious,
        0.0 as TotalChangePercentage,
        0 as PreviousYearSameMonthTotal,
        0 as TotalChangeFromPreviousYear,
        0.0 as TotalChangePercentageFromPreviousYear
    FROM Requests
    WHERE CreatedAt >= v_StartDate AND CreatedAt < v_EndDate;
END

SELECT 'Stored procedure created successfully' as message
