import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/services/api.service';
import { MonthlyReportData } from '../../core/models/request.model';

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './report.component.html',
  styleUrl:'./report.component.css',
})
export class MonthlyReportComponent implements OnInit {
  filterForm!: FormGroup;
  reportData: MonthlyReportData | null = null;
  isLoading = false;
  hasSearched = false;

  // עמודות הטבלאות
  departmentColumns = ['department', 'count', 'percentage'];
  statusColumns = ['status', 'count', 'percentage'];

  // נתונים לטפסים
  years = [2023, 2024, 2025, 2026];
  months = [
    { value: 1, name: 'ינואר' }, { value: 2, name: 'פברואר' }, { value: 3, name: 'מרץ' },
    { value: 4, name: 'אפריל' }, { value: 5, name: 'מאי' }, { value: 6, name: 'יוני' },
    { value: 7, name: 'יולי' }, { value: 8, name: 'אוגוסט' }, { value: 9, name: 'ספטמבר' },
    { value: 10, name: 'אוקטובר' }, { value: 11, name: 'נובמבר' }, { value: 12, name: 'דצמבר' }
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCurrentMonth();
  }

  /**
   * אתחול טופס הפילטרים
   */
  initForm(): void {
    const now = new Date();
    this.filterForm = this.fb.group({
      year: [now.getFullYear()],
      month: [now.getMonth() + 1]
    });
  }

  /**
   * טעינת דוח מהשרת (Stored Procedure)
   */
  loadReport(): void {
    this.isLoading = true;
    this.hasSearched = true;

    const { year, month } = this.filterForm.value;

    this.apiService.getMonthlyReport(year, month).subscribe({
      next: (data) => {
        this.reportData = data;
        this.isLoading = false;
        console.log('דוח נטען:', data);
      },
      error: (error) => {
        this.isLoading = false;
        this.reportData = null;
        console.error('שגיאה בטעינת הדוח:', error);
      }
    });
  }

  /**
   * טעינה אוטומטית של החודש הנוכחי
   */
  loadCurrentMonth(): void {
    setTimeout(() => this.loadReport(), 800);
  }

  /**
   * חישוב ממוצע פניות ליום
   */
  getAveragePerDay(): number {
    if (!this.reportData?.totalRequests) return 0;

    const daysInMonth = new Date(this.reportData.year, this.reportData.month, 0).getDate();
    return this.reportData.totalRequests / daysInMonth;
  }

  /**
   * צבע למחלקה
   */
  getDepartmentColor(department: string): string {
    const colors: {[key: string]: string} = {
      'IT': '#3b82f6',
      'HR': '#10b981',
      'Finance': '#f59e0b',
      'Marketing': '#ef4444',
      'Operations': '#8b5cf6'
    };
    return colors[department] || '#6b7280';
  }

  /**
   * תווית סטטוס בעברית
   */
  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'Open': 'פתוח',
      'Closed': 'סגור',
      'Pending': 'ממתין',
      'InProgress': 'בטיפול'
    };
    return labels[status] || status;
  }

  /**
   * אייקון לסטטוס
   */
  getStatusIcon(status: string): string {
    const icons: {[key: string]: string} = {
      'Open': 'radio_button_unchecked',
      'Closed': 'check_circle',
      'Pending': 'schedule',
      'InProgress': 'hourglass_empty'
    };
    return icons[status] || 'help';
  }

  /**
   * סגנון לסטטוס
   */
  getStatusClass(status: string): string {
    const classes: {[key: string]: string} = {
      'Open': 'status-open',
      'Closed': 'status-closed',
      'Pending': 'status-pending',
      'InProgress': 'status-progress'
    };
    return classes[status] || 'status-open';
  }
}
