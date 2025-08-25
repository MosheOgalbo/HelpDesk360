export interface MonthlyReport {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  currentMonthRequests: number;
  previousMonthRequests: number;
  sameMonthLastYearRequests: number;
  percentChangeFromPreviousMonth: number;
  percentChangeFromSameMonthLastYear: number;
  avgResolutionTimeHours: number;
  reportYear: number;
  reportMonth: number;
  generatedAt: Date;
}

export interface ReportSummary {
  year: number;
  month: number;
  totalRequestsCurrentMonth: number;
  totalActiveDepartments: number;
  overallAvgResolutionTimeHours: number;
  openRequests: number;
  resolvedRequests: number;
  generatedAt: Date;
}
