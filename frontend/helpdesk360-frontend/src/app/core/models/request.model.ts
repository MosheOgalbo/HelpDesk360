import { Department } from "./department.model";

export interface Request {
  id: number;
  name: string;
  phone: string;
  email: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  departments: Department[];
}

export interface CreateRequest {
  name: string;
  phone: string;
  email: string;
  description: string;
  priority: RequestPriority;
  departmentIds: number[];
}

export interface UpdateRequest extends CreateRequest {
  status: RequestStatus;
}

export type RequestStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Cancelled';
export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export const REQUEST_STATUSES: RequestStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled'];
export const REQUEST_PRIORITIES: RequestPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export interface PaginatedRequests {
  items: Request[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
