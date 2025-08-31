import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HelpDeskRequest, CreateRequestDto, MonthlyReport } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Get all requests
  getRequests(): Observable<HelpDeskRequest[]> {
    return this.http.get<HelpDeskRequest[]>(`${this.baseUrl}/Requests`);
  }

  // Create new request
  createRequest(request: CreateRequestDto): Observable<HelpDeskRequest> {
    return this.http.post<HelpDeskRequest>(`${this.baseUrl}/Requests`, request);
  }

  // Get monthly report
  getMonthlyReport(year: number, month: number): Observable<MonthlyReport> {
    return this.http.get<MonthlyReport>(`${this.baseUrl}/Reports/monthly`, {
      params: { year: year.toString(), month: month.toString() }
    });
  }
}
