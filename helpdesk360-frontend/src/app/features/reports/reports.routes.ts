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
  template: `
    <div class="page-container">

      <!-- כותרת עמוד -->
      <div class="text-center mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-gradient mb-4">
          דוח פניות חודשי
        </h1>
        <p class="text-lg text-gray-600">
          נתונים מפורטים מהמערכת על פניות לקוחות
        </p>
      </div>

      <!-- כרטיס בחירת תקופה -->
      <mat-card class="shadow-soft mb-8 slide-in">
        <mat-card-header>
          <div class="flex items-center w-full">
            <mat-icon class="text-2xl ml-3">date_range</mat-icon>
            <mat-card-title>בחירת תקופת דוח</mat-card-title>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="filterForm" class="form-row flex flex-col md:flex-row gap-6 items-end">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>שנה</mat-label>
              <mat-icon matPrefix class="text-gray-400 ml-2">calendar_today</mat-icon>
              <mat-select formControlName="year">
                <mat-option *ngFor="let year of years" [value]="year">{{ year }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>חודש</mat-label>
              <mat-icon matPrefix class="text-gray-400 ml-2">event</mat-icon>
              <mat-select formControlName="month">
                <mat-option *ngFor="let month of months" [value]="month.value">
                  {{ month.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              (click)="loadReport()"
              [disabled]="isLoading"
              class="gradient-bg min-w-40">
              <mat-spinner diameter="20" *ngIf="isLoading" class="inline ml-2"></mat-spinner>
              <mat-icon *ngIf="!isLoading" class="ml-2">analytics</mat-icon>
              {{ isLoading ? 'טוען...' : 'טען דוח' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- תוצאות הדוח -->
      <div *ngIf="reportData" class="space-y-8">

        <!-- כרטיס סיכום -->
        <div class="summary-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- סה"כ פניות -->
          <mat-card class="gradient-bg text-white shadow-soft slide-in">
            <mat-card-content class="text-center p-8">
              <mat-icon class="text-5xl mb-4 opacity-80">support_agent</mat-icon>
              <div class="text-4xl md:text-5xl font-bold mb-2">{{ reportData.totalRequests }}</div>
              <div class="text-xl opacity-90">סה"כ פניות</div>
              <div class="text-sm opacity-75 mt-2">{{ reportData.month }}/{{ reportData.year }}</div>
            </mat-card-content>
          </mat-card>

          <!-- סטטיסטיקת מחלקות -->
          <mat-card class="bg-green-500 text-white shadow-soft slide-in">
            <mat-card-content class="text-center p-8">
              <mat-icon class="text-5xl mb-4 opacity-80">business</mat-icon>
              <div class="text-4xl md:text-5xl font-bold mb-2">{{ reportData.departmentStats?.length || 0 }}</div>
              <div class="text-xl opacity-90">מחלקות פעילות</div>
              <div class="text-sm opacity-75 mt-2">עם פניות בחודש</div>
            </mat-card-content>
          </mat-card>

          <!-- ממוצע פניות -->
          <mat-card class="bg-purple-500 text-white shadow-soft slide-in">
            <mat-card-content class="text-center p-8">
              <mat-icon class="text-5xl mb-4 opacity-80">trending_up</mat-icon>
              <div class="text-4xl md:text-5xl font-bold mb-2">
                {{ getAveragePerDay() | number:'1.1-1' }}
              </div>
              <div class="text-xl opacity-90">ממוצע יומי</div>
              <div class="text-sm opacity-75 mt-2">פניות ליום</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- טבלת מחלקות -->
        <mat-card *ngIf="reportData.departmentStats?.length" class="shadow-soft slide-in">
          <mat-card-header>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center">
                <mat-icon class="text-2xl ml-3">pie_chart</mat-icon>
                <mat-card-title>התפלגות פניות לפי מחלקות</mat-card-title>
              </div>
              <span class="text-sm text-gray-500">{{ reportData.departmentStats.length }} מחלקות</span>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="table-container overflow-x-auto">
              <table mat-table [dataSource]="reportData.departmentStats" class="w-full">

                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">מחלקה</th>
                  <td mat-cell *matCellDef="let dept" class="font-medium">
                    <div class="flex items-center">
                      <div class="w-3 h-3 rounded-full ml-2"
                           [style.background-color]="getDepartmentColor(dept.departmentName)">
                      </div>
                      {{ dept.departmentName }}
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="count">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-center text-gray-700">כמות פניות</th>
                  <td mat-cell *matCellDef="let dept" class="text-center">
                    <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                      {{ dept.requestCount }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="percentage">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-center text-gray-700">אחוז מהכלל</th>
                  <td mat-cell *matCellDef="let dept" class="text-center">
                    <div class="flex items-center justify-center gap-3">
                      <!-- פס התקדמות מעוצב -->
                      <div class="flex-1 max-w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-500 ease-out"
                          [style.width.%]="dept.percentage"
                          [style.background-color]="getDepartmentColor(dept.departmentName)">
                        </div>
                      </div>
                      <span class="font-bold text-gray-700 min-w-12">
                        {{ dept.percentage | number:'1.1-1' }}%
                      </span>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="departmentColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: departmentColumns;"
                    class="hover:bg-blue-50 transition-colors duration-200"></tr>

              </table>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- טבלת סטטוסים -->
        <mat-card *ngIf="reportData.statusStats?.length" class="shadow-soft slide-in">
          <mat-card-header>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center">
                <mat-icon class="text-2xl ml-3">assignment</mat-icon>
                <mat-card-title>סטטוס פניות</mat-card-title>
              </div>
              <span class="text-sm text-gray-500">{{ reportData.statusStats.length }} סטטוסים</span>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="table-container overflow-x-auto">
              <table mat-table [dataSource]="reportData.statusStats" class="w-full">

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">סטטוס</th>
                  <td mat-cell *matCellDef="let status">
                    <span class="status-chip" [ngClass]="getStatusClass(status.status)">
                      <mat-icon class="text-sm ml-1">{{ getStatusIcon(status.status) }}</mat-icon>
                      {{ getStatusLabel(status.status) }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="count">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-center text-gray-700">כמות</th>
                  <td mat-cell *matCellDef="let status" class="text-center font-bold text-lg">
                    {{ status.count }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="percentage">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-center text-gray-700">אחוז</th>
                  <td mat-cell *matCellDef="let status" class="text-center font-bold text-lg">
                    {{ status.percentage | number:'1.1-1' }}%
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="statusColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: statusColumns;"
                    class="hover:bg-gray-50 transition-colors duration-200"></tr>

              </table>
            </div>
          </mat-card-content>
        </mat-card>

      </div>

      <!-- הודעה כשאין נתונים -->
      <mat-card *ngIf="!reportData && !isLoading && hasSearched"
               class="text-center p-12 shadow-soft slide-in">
        <mat-card-content>
          <mat-icon class="text-8xl text-gray-300 mb-6">inbox</mat-icon>
          <h2 class="text-2xl font-bold text-gray-600 mb-4">אין נתונים להצגה</h2>
          <p class="text-gray-500 text-lg mb-6">לא נמצאו פניות עבור התקופה הנבחרת</p>
          <button mat-raised-button color="primary" (click)="loadReport()">
            <mat-icon class="ml-2">refresh</mat-icon>
            נסה שוב
          </button>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .text-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-bg {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    }

    .slide-in {
      animation: slideIn 0.6s ease-out forwards;
    }

    .slide-in:nth-child(2) { animation-delay: 0.1s; }
    .slide-in:nth-child(3) { animation-delay: 0.2s; }
    .slide-in:nth-child(4) { animation-delay: 0.3s; }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Status chip styles */
    .status-chip {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.875rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .status-open {
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #fbbf24;
    }

    .status-closed {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #10b981;
    }

    .status-pending {
      background-color: #dbeafe;
      color: #1e40af;
      border: 1px solid #3b82f6;
    }

    .status-progress {
      background-color: #fed7d7;
      color: #c53030;
      border: 1px solid #f56565;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .summary-grid {
        grid-template-columns: 1fr !important;
        gap: 1rem !important;
      }

      .text-4xl, .text-5xl {
        font-size: 2rem !important;
      }

      .p-8 {
        padding: 1.5rem !important;
      }

      .table-container {
        font-size: 0.875rem;
      }
    }

    /* Enhanced hover effects */
    .mat-mdc-row:hover {
      background-color: #f8fafc !important;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
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
