import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { MonthlyReport } from '../../../core/models/request.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MatChipsModule } from '@angular/material/chips';


interface PriorityRow {
  priority: number;
  name: string;
  count: number;
  percentage: number;
}

interface DepartmentRow {
  departmentId: number;
  name: string;
  count: number;
  percentage: number;
}

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
    MatIconModule,
    MatChipsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-6xl mx-auto space-y-6">

      <!-- Report Controls -->
      <mat-card>
        <mat-card-header>
          <mat-card-title class="text-2xl font-bold text-gray-800">
            דוח חודשי
          </mat-card-title>
        </mat-card-header>

        <mat-card-content class="mt-4">
          <form [formGroup]="reportForm" class="flex gap-4 items-end">
            <mat-form-field appearance="outline" class="min-w-[120px]">
              <mat-label>שנה</mat-label>
              <mat-select formControlName="year">
                @for (year of availableYears; track year) {
                  <mat-option [value]="year">{{ year }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="min-w-[120px]">
              <mat-label>חודש</mat-label>
              <mat-select formControlName="month">
                @for (month of availableMonths; track month.value) {
                  <mat-option [value]="month.value">{{ month.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="loadReport()"
                    [disabled]="isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
              }
              טען דוח
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      @if (reportData()) {
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <mat-card class="text-center">
            <mat-card-content class="py-6">
              <div class="text-3xl font-bold text-blue-600">{{ reportData()!.totalRequests }}</div>
              <div class="text-gray-600 mt-2">סה"כ בקשות</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="text-center">
            <mat-card-content class="py-6">
              <div class="text-3xl font-bold text-green-600">{{ reportData()!.averageResolutionTime || 0 | number:'1.1-1' }}</div>
              <div class="text-gray-600 mt-2">זמן פתרון ממוצע (שעות)</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="text-center">
            <mat-card-content class="py-6">
              <div class="text-3xl font-bold text-purple-600">{{ priorityData().length }}</div>
              <div class="text-gray-600 mt-2">רמות דחיפות פעילות</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Priority Breakdown -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>התפלגות לפי רמת דחיפות</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="priorityData()" class="w-full">

              <ng-container matColumnDef="priority">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">רמת דחיפות</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip [class]="getPriorityChipClass(row.priority)">
                    {{ row.name }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="count">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">כמות</th>
                <td mat-cell *matCellDef="let row" class="text-center font-medium">
                  {{ row.count }}
                </td>
              </ng-container>

              <ng-container matColumnDef="percentage">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">אחוז</th>
                <td mat-cell *matCellDef="let row" class="text-center">
                  <div class="flex items-center gap-2">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-600 h-2 rounded-full"
                           [style.width.%]="row.percentage"></div>
                    </div>
                    <span class="text-sm">{{ row.percentage | number:'1.1-1' }}%</span>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="priorityColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: priorityColumns;"></tr>

            </table>
          </mat-card-content>
        </mat-card>

        <!-- Department Breakdown -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>התפלגות לפי מחלקה</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="departmentData()" class="w-full">

              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">מחלקה</th>
                <td mat-cell *matCellDef="let row" class="font-medium">{{ row.name }}</td>
              </ng-container>

              <ng-container matColumnDef="count">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">כמות בקשות</th>
                <td mat-cell *matCellDef="let row" class="text-center font-medium">
                  {{ row.count }}
                </td>
              </ng-container>

              <ng-container matColumnDef="percentage">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">אחוז מכלל הבקשות</th>
                <td mat-cell *matCellDef="let row" class="text-center">
                  <div class="flex items-center gap-2">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div class="bg-green-600 h-2 rounded-full"
                           [style.width.%]="row.percentage"></div>
                    </div>
                    <span class="text-sm">{{ row.percentage | number:'1.1-1' }}%</span>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="departmentColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: departmentColumns;"></tr>

            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `
})
export class MonthlyReportComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  // Signals
  reportData = signal<MonthlyReport | null>(null);
  isLoading = signal(false);

  // Form
  reportForm!: FormGroup;

  // Static data
  availableYears = [2023, 2024, 2025, 2026];
  availableMonths = [
    { value: 1, name: 'ינואר' }, { value: 2, name: 'פברואר' }, { value: 3, name: 'מרץ' },
    { value: 4, name: 'אפריל' }, { value: 5, name: 'מאי' }, { value: 6, name: 'יוני' },
    { value: 7, name: 'יולי' }, { value: 8, name: 'אוגוסט' }, { value: 9, name: 'ספטמבר' },
    { value: 10, name: 'אוקטובר' }, { value: 11, name: 'נובמבר' }, { value: 12, name: 'דצמבר' }
  ];

  // Table columns
  priorityColumns = ['priority', 'count', 'percentage'];
  departmentColumns = ['department', 'count', 'percentage'];

  // Computed data
  priorityData = computed((): PriorityRow[] => {
    const report = this.reportData();
    if (!report) return [];

    const priorities = [
      { priority: 1, name: 'נמוכה' },
      { priority: 2, name: 'בינונית' },
      { priority: 3, name: 'גבוהה' },
      { priority: 4, name: 'קריטית' }
    ];

    return priorities.map(p => ({
      ...p,
      count: report.requestsByPriority[p.priority] || 0,
      percentage: report.totalRequests > 0
        ? ((report.requestsByPriority[p.priority] || 0) / report.totalRequests) * 100
        : 0
    })).filter(row => row.count > 0);
  });

  departmentData = computed((): DepartmentRow[] => {
    const report = this.reportData();
    if (!report) return [];

    const departments = [
      { departmentId: 1, name: 'IT' },
      { departmentId: 2, name: 'משאבי אנוש' },
      { departmentId: 3, name: 'כספים' },
      { departmentId: 4, name: 'שיווק' }
    ];

    return departments.map(d => ({
      ...d,
      count: report.requestsByDepartment[d.departmentId] || 0,
      percentage: report.totalRequests > 0
        ? ((report.requestsByDepartment[d.departmentId] || 0) / report.totalRequests) * 100
        : 0
    })).filter(row => row.count > 0);
  });

  ngOnInit(): void {
    this.initializeForm();
    this.loadCurrentMonthReport();
  }

  private initializeForm(): void {
    const now = new Date();
    this.reportForm = this.fb.group({
      year: [now.getFullYear()],
      month: [now.getMonth() + 1]
    });
  }

  loadReport(): void {
    if (this.reportForm.valid) {
      this.isLoading.set(true);

      const { year, month } = this.reportForm.value;

      this.apiService.getMonthlyReport(year, month).subscribe({
        next: (data: MonthlyReport) => {
          this.reportData.set(data);
          this.isLoading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading report:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

  private loadCurrentMonthReport(): void {
    this.loadReport();
  }

  getPriorityChipClass(priority: number): string {
    const classes: Record<number, string> = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
  }
}
