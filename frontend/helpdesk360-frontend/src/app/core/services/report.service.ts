import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { MonthlyReport, ReportSummary } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private apiService: ApiService) {}

  getMonthlyReport(year?: number, month?: number): Observable<MonthlyReport[]> {
    let params = new HttpParams();

    if (year) {
      params = params.set('year', year.toString());
    }
    if (month) {
      params = params.set('month', month.toString());
    }

    return this.apiService.get<MonthlyReport[]>('reports/monthly', params);
  }

  getReportSummary(year?: number, month?: number): Observable<ReportSummary> {
    let params = new HttpParams();

    if (year) {
      params = params.set('year', year.toString());
    }
    if (month) {
      params = params.set('month', month.toString());
    }

    return this.apiService.get<ReportSummary>('reports/summary', params);
  }
}
