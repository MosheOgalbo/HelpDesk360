// דוח חודשי מ-Stored Procedure
export interface MonthlyReportData {
  month: number;
  year: number;
  totalRequests: number;
  departmentStats: DepartmentStat[];
  statusStats: StatusStat[];
}

export interface DepartmentStat {
  departmentName: string;
  requestCount: number;
  percentage: number;
}

export interface StatusStat {
  status: string;
  count: number;
  percentage: number;
}
