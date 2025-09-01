import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactRequest, ContactResponse } from '../models/contact.model';
import { MonthlyReportData } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('API Service initialized with URL:', this.apiUrl);
  }

  /**
   * שליחת פנייה חדשה - בדיוק לפי הפורמט של הבקאנד
   * POST /api/Requests
   */
  submitContact(request: ContactRequest): Observable<ContactResponse> {
    const payload = {
      title: request.title,
      description: request.description,
      priority: request.priority,
      departmentId: request.departmentId,
      requestorName: request.requestorName,
      requestorEmail: request.requestorEmail,
      requestorPhone: request.requestorPhone
    };

    console.log('Sending request to backend:', payload);

    return this.http.post<ContactResponse>(`${this.apiUrl}/api/Requests`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'accept': 'text/plain'
      }
    });
  }

  /**
   * קבלת דוח חודשי מה-Stored Procedure
   * GET /api/Reports/monthly?year=2025&month=1
   * מחזיר בדיוק את הפורמט שהראית
   */
  getMonthlyReport(year: number, month: number): Observable<MonthlyReportData> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    console.log(`Loading monthly report for ${year}/${month}`);

    return this.http.get<MonthlyReportData>(`${this.apiUrl}/api/Reports/monthly`, {
      params,
      headers: {
        'accept': 'text/plain'
      }
    });
  }
}
