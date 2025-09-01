// מודל טופס פנייה - בדיוק לפי הדרישות
export interface ContactRequest {
  name: string;           // שם
  phone: string;          // טלפון
  email: string;          // אימייל
  department: string;     // מחלקה []
  description: string;    // תיאור הפנייה
}

// תגובת שרת
export interface ContactResponse {
  id: number;
  name: string;
  phone: string;
  email: string;
  department: string;
  description: string;
  createdAt: string;
  status: string;
}
