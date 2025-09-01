import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
   * שליחת פנייה חדשה
   * POST /api/Requests
   */
  submitContact(contact: ContactRequest): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(`${this.apiUrl}/api/Requests`, contact);
  }

  /**
   * קבלת דוח חודשי מ-Stored Procedure
   * GET /api/Reports/monthly?year=2025&month=12
   */
  getMonthlyReport(year: number, month: number): Observable<MonthlyReportData> {
    return this.http.get<MonthlyReportData>(`${this.apiUrl}/api/Reports/monthly`, {
      params: {
        year: year.toString(),
        month: month.toString()
      }
    });
  }
}
