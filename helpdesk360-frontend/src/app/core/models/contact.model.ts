// מודל טופס פנייה - מותאם לשרת
export interface ContactRequest {
  title: string;           // כותרת הפנייה
  description: string;     // תיאור הפנייה
  priority: number;        // רמת חשיבות (1-4)
  departmentId: number;    // מזהה מחלקה
  requestorName: string;   // שם המבקש
  requestorEmail: string;  // אימייל המבקש
  requestorPhone: string;  // טלפון המבקש
}

// תגובת שרת
export interface ContactResponse {
  id: number;
  title: string;
  description: string;
  priority: number;
  priorityName: string;
  status: number;
  statusName: string;
  departmentId: number;
  departmentName: string;
  requestorName: string;
  requestorEmail: string;
  requestorPhone: string;
  assignedTo: string | null;
  createdAt: string;
  resolvedAt: string | null;
  updatedAt: string;
}

// אפשרויות רמת חשיבות
export enum Priority {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

// מבנה מחלקות
export interface Department {
  id: number;
  name: string;
  icon: string;
}
