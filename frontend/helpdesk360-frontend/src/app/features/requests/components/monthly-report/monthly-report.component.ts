import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ReportService } from '../../../../core/services/report.service';
import { MonthlyReport, ReportSummary } from '../../../../core/models/report.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    BaseChartDirective,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Report Controls -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Monthly Support Report</h1>

        <form [formGroup]="reportForm" class="flex flex-col sm:flex-row gap-4 items-end">
          <mat-form-field appearance="outline" class="w-full sm:w-32">
            <mat-label>Year</mat-label>
            <mat-select formControlName="year">
              <mat-option *ngFor="let year of availableYears" [value]="year">
                {{ year }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full sm:w-40">
            <mat-label>Month</mat-label>
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
            class="w-full sm:w-auto">
            <mat-icon>refresh</mat-icon>
            Generate Report
          </button>
        </form>
      </div>

      <!-- Loading State -->
      <app-loading-spinner
        *ngIf="isLoading"
        size="lg"
        message="Generating report...">
      </app-loading-spinner>

      <!-- Report Summary Cards -->
      <div *ngIf="!isLoading && summary" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <mat-card class="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Total Requests</p>
              <p class="text-2xl font-bold">{{ summary.totalRequestsCurrentMonth }}</p>
            </div>
            <mat-icon class="text-blue-200 text-3xl">assignment</mat-icon>
          </div>
        </mat-card>

        <mat-card class="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">Resolved</p>
              <p class="text-2xl font-bold">{{ summary.resolvedRequests }}</p>
            </div>
            <mat-icon class="text-green-200 text-3xl">check_circle</mat-icon>
          </div>
        </mat-card>

        <mat-card class="p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 text-sm">Open Requests</p>
              <p class="text-2xl font-bold">{{ summary.openRequests }}</p>
            </div>
            <mat-icon class="text-yellow-200 text-3xl">pending</mat-icon>
          </div>
        </mat-card>

        <mat-card class="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm">Avg Resolution (hrs)</p>
              <p class="text-2xl font-bold">{{ summary.overallAvgResolutionTimeHours | number:'1.1-1' }}</p>
            </div>
            <mat-icon class="text-purple-200 text-3xl">schedule</mat-icon>
          </div>
        </mat-card>
      </div>

      <!-- Charts Row -->
      <div *ngIf="!isLoading && reportData.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Requests by Department Chart -->
        <mat-card class="p-6">
          <h3 class="text-lg font-semibold mb-4">Requests by Department</h3>
          <div class="h-64">
            <canvas
              baseChart
              [data]="departmentChartData"
              [options]="chartOptions"
              [type]="'doughnut'">
            </canvas>
          </div>
        </mat-card>

        <!-- Monthly Comparison Chart -->
        <mat-card class="p-6">
          <h3 class="text-lg font-semibold mb-4">Monthly Comparison</h3>
          <div class="h-64">
            <canvas
              baseChart
              [data]="comparisonChartData"
              [options]="barChartOptions"
              [type]="'bar'">
            </canvas>
          </div>
        </mat-card>
      </div>

      <!-- Detailed Report Table -->
      <mat-card *ngIf="!isLoading && reportData.length > 0" class="p-6">
        <h3 class="text-lg font-semibold mb-4">Department Breakdown</h3>

        <div class="overflow-x-auto">
          <table mat-table [dataSource]="reportData" class="w-full">
            <!-- Department Column -->
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef class="font-semibold">Department</th>
              <td mat-cell *matCellDef="let report">
                <div class="flex flex-col">
                  <span class="font-medium">{{ report.departmentName }}</span>
                  <span class="text-sm text-gray-500">{{ report.departmentCode }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Current Month Column -->
            <ng-container matColumnDef="currentMonth">
              <th mat-header-cell *matHeaderCellDef class="font-semibold">Current Month</th>
              <td mat-cell *matCellDef="let report">
                <span class="text-lg font-semibold text-blue-600">{{ report.currentMonthRequests }}</span>
              </td>
            </ng-container>

            <!-- Previous Month Column -->
            <ng-container matColumnDef="previousMonth">
              <th mat-header-cell *matHeaderCellDef class="font-semibold">Previous Month</th>
              <td mat-cell *matCellDef="let report">
                <div class="flex flex-col">
                  <span>{{ report.previousMonthRequests }}</span>
                  <span
                    [class]="getChangeClass(report.percentChangeFromPreviousMonth)"
                    class="text-xs font-medium">
                    {{ report.percentChangeFromPreviousMonth > 0 ? '+' : '' }}{{ report.percentChangeFromPreviousMonth | number:'1.1-1' }}%
                  </span>
                </div>
              </td>
            </ng-container>

            <!-- Same Month Last Year Column -->
            <ng-container matColumnDef="lastYear">
              <th mat-header-cell *matHeaderCellDef class="font-semibold">Same Month Last Year</th>
              <td mat-cell *matCellDef="let report">
                <div class="flex flex-col">
                  <span>{{ report.sameMonthLastYearRequests }}</span>
                  <span
                    [class]="getChangeClass(report.percentChangeFromSameMonthLastYear)"
                    class="text-xs font-medium">
                    {{ report.percentChangeFromSameMonthLastYear > 0 ? '+' : '' }}{{ report.percentChangeFromSameMonthLastYear | number:'1.1-1' }}%
                  </span>
                </div>
              </td>
            </ng-container>

            <!-- Avg Resolution Time Column -->
            <ng-container matColumnDef="avgResolution">
              <th mat-header-cell *matHeaderCellDef class="font-semibold">Avg Resolution</th>
              <td mat-cell *matCellDef="let report">
                <span class="text-sm">{{ report.avgResolutionTimeHours | number:'1.1-1' }}h</span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                class="hover:bg-gray-50"></tr>
          </table>
        </div>
      </mat-card>

      <!-- No Data State -->
      <div *ngIf="!isLoading && reportData.length === 0 && reportForm.get('year')?.value"
           class="text-center py-12 bg-white rounded-lg shadow-md">
        <mat-icon class="text-gray-400 text-6xl mb-4">bar_chart</mat-icon>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No data available</h3>
        <p class="text-gray-500">No support requests found for the selected period.</p>
      </div>
    </div>
  `
})
export class MonthlyReportComponent implements OnInit {
  reportForm!: FormGroup;
  reportData: MonthlyReport[] = [];
  summary?: ReportSummary;
  isLoading = false;

  // Chart data
  departmentChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  comparisonChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  // Chart options
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  availableYears: number[] = [];
  months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];

  displayedColumns = ['department', 'currentMonth', 'previousMonth', 'lastYear', 'avgResolution'];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.generateAvailableYears();
    this.loadReport();
  }

  private initializeForm(): void {
    const now = new Date();
    this.reportForm = this.fb.group({
      year: [now.getFullYear()],
      month: [now.getMonth() + 1]
    });
  }

  private generateAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
  }

  loadReport(): void {
    const { year, month } = this.reportForm.value;
    this.isLoading = true;

    // Load report data and summary in parallel
    Promise.all([
      this.reportService.getMonthlyReport(year, month).toPromise(),
      this.reportService.getReportSummary(year, month).toPromise()
    ]).then(([reportData, summary]) => {
      this.reportData = reportData || [];
      this.summary = summary;
      this.updateCharts();
    }).catch(error => {
      console.error('Error loading report:', error);
      this.reportData = [];
      this.summary = undefined;
    }).finally(() => {
      this.isLoading = false;
    });
  }

  private updateCharts(): void {
    if (this.reportData.length === 0) return;

    // Department pie chart
    this.departmentChartData = {
      labels: this.reportData.map(r => r.departmentCode),
      datasets: [{
        data: this.reportData.map(r => r.currentMonthRequests),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
          '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
        ]
      }]
    };

    // Monthly comparison bar chart
    this.comparisonChartData = {
      labels: this.reportData.map(r => r.departmentCode),
      datasets: [
        {
          label: 'Current Month',
          data: this.reportData.map(r => r.currentMonthRequests),
          backgroundColor: '#3B82F6'
        },
        {
          label: 'Previous Month',
          data: this.reportData.map(r => r.previousMonthRequests),
          backgroundColor: '#10B981'
        },
        {
          label: 'Same Month Last Year',
          data: this.reportData.map(r => r.sameMonthLastYearRequests),
          backgroundColor: '#F59E0B'
        }
      ]
    };
  }

  getChangeClass(percentage: number): string {
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-gray-600';
  }
}
