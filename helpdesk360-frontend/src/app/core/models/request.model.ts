export interface HelpDeskRequest {
  id?: number;
  title: string;
  description: string;
  priority: number;
  departmentId: number;
  requestorName: string;
  requestorEmail: string;
  requestorPhone: string;
  createdAt?: string;
  status?: string;
}

export interface CreateRequestDto {
  title: string;
  description: string;
  priority: number;
  departmentId: number;
  requestorName: string;
  requestorEmail: string;
  requestorPhone: string;
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalRequests: number;
  requestsByPriority: Record<number, number>;
  requestsByDepartment: Record<number, number>;
  averageResolutionTime: number;
}
