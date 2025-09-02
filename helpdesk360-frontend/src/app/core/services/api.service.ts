import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactRequest, ContactResponse } from '../models/contact.model';
import { MonthlyReportData } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * שליחת פנייה חדשה עם לוגים מפורטים
   * POST /api/Requests
   */
  submitContact(contact: ContactRequest): Observable<ContactResponse> {
    console.log('🚀 API Service - שליחת פנייה');
    console.log('📡 URL:', `${this.apiUrl}/Requests`);
    console.log('📦 נתונים:', contact);

    // וידוא שכל השדות קיימים ולא null/undefined
    const cleanedContact = {
      title: contact.title || '',
      description: contact.description || '',
      priority: Number(contact.priority) || 2,
      departmentId: Number(contact.departmentId) || 1,
      requestorName: contact.requestorName || '',
      requestorEmail: contact.requestorEmail || '',
      requestorPhone: contact.requestorPhone || ''
    };

    console.log('🧹 נתונים מנוקים:', cleanedContact);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('📋 Headers:', headers);

    return this.http.post<ContactResponse>(`${this.apiUrl}/Requests`, cleanedContact, { headers })
      .pipe(
        tap(response => {
          console.log('✅ תגובה הצליחה:', response);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('❌ שגיאה בשליחת הפנייה:');
          console.error('Status:', error.status);
          console.error('StatusText:', error.statusText);
          console.error('URL:', error.url);
          console.error('Headers:', error.headers);
          console.error('Error Body:', error.error);

          // אם השרת החזיר הודעת שגיאה מפורטת
          if (error.error && typeof error.error === 'object') {
            console.error('פירוט שגיאת השרת:', error.error);
          }

          throw error;
        })
      );
  }

  /**
   * בדיקת זמינות השרת
   */
  checkServerHealth(): Observable<any> {
    console.log('🏥 בודק זמינות השרת...');

    return this.http.get(`${this.apiUrl}/health`)
      .pipe(
        tap(response => console.log('✅ השרת זמין:', response)),
        catchError(error => {
          console.error('❌ השרת לא זמין:', error);
          throw error;
        })
      );
  }

  /**
   * קבלת כל הפניות
   */
  getAllRequests(): Observable<ContactResponse[]> {
    console.log('📋 מקבל את כל הפניות...');

    return this.http.get<ContactResponse[]>(`${this.apiUrl}/Requests`)
      .pipe(
        tap(response => console.log('✅ התקבלו פניות:', response.length)),
        catchError(error => {
          console.error('❌ שגיאה בקבלת פניות:', error);
          throw error;
        })
      );
  }

  /**
   * קבלת פנייה לפי מזהה
   */
  getRequestById(id: number): Observable<ContactResponse> {
    console.log(`🔍 מחפש פנייה מספר: ${id}`);

    return this.http.get<ContactResponse>(`${this.apiUrl}/Requests/${id}`)
      .pipe(
        tap(response => console.log('✅ פנייה נמצאה:', response)),
        catchError(error => {
          console.error(`❌ שגיאה בחיפוש פנייה ${id}:`, error);
          throw error;
        })
      );
  }

  /**
   * בדיקת פשוטה של חיבור לשרת
   */
  testConnection(): Promise<boolean> {
    console.log('🔌 בודק חיבור לשרת...');

    return fetch(`${this.apiUrl}/Requests`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('📡 תגובת OPTIONS:', response.status);
      return response.ok || response.status === 405;
    })
    .catch(error => {
      console.error('❌ אין חיבור לשרת:', error);
      return false;
    });
  }

  /**
   * קבלת דוח חודשי
   */
  getMonthlyReport(year: number, month: number): Observable<MonthlyReportData> {
    return this.http.get<MonthlyReportData>(`${this.apiUrl}/Reports/monthly`, {
      params: {
        year: year.toString(),
        month: month.toString()
      }
    });
  }
}
