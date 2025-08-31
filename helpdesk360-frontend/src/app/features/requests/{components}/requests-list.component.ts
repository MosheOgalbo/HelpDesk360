import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkVirtualScrollViewport, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { ApiService } from '../../../core/services/api.service';
import { HelpDeskRequest } from '../../../core/models/request.model';
import { inject } from '@angular/core';

@Component({
  selector: 'app-requests-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    CdkVirtualScrollViewport,
    CdkVirtualForOf
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header class="bg-blue-50">
        <mat-card-title class="text-2xl font-bold text-gray-800">
          רשימת בקשות תמיכה
        </mat-card-title>
        <mat-card-subtitle>
          סה"כ {{ totalRequests() }} בקשות
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content class="p-0">
        @if (isLoading()) {
          <div class="flex justify-center items-center h-64">
            <mat-spinner></mat-spinner>
          </div>
        } @else if (requests().length === 0) {
          <div class="text-center py-12">
            <mat-icon class="text-6xl text-gray-400 mb-4">inbox</mat-icon>
            <p class="text-xl text-gray-500">אין בקשות להצגה</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="requests()" class="w-full">

              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">מספר</th>
                <td mat-cell *matCellDef="let request" class="text-sm">{{ request.id }}</td>
              </ng-container>

              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">כותרת</th>
                <td mat-cell *matCellDef="let request" class="max-w-xs">
                  <div class="truncate font-medium">{{ request.title }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="requestorName">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">מבקש</th>
                <td mat-cell *matCellDef="let request" class="text-sm">{{ request.requestorName }}</td>
              </ng-container>

              <ng-container matColumnDef="priority">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">דחיפות</th>
                <td mat-cell *matCellDef="let request">
                  <mat-chip [class]="getPriorityClass(request.priority)">
                    {{ getPriorityText(request.priority) }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="departmentId">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">מחלקה</th>
                <td mat-cell *matCellDef="let request" class="text-sm">
                  {{ getDepartmentName(request.departmentId) }}
                </td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">תאריך יצירה</th>
                <td mat-cell *matCellDef="let request" class="text-sm text-gray-600">
                  {{ formatDate(request.createdAt) }}
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">פעולות</th>
                <td mat-cell *matCellDef="let request">
                  <button mat-icon-button color="primary" (click)="viewRequest(request)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  class="hover:bg-gray-50 cursor-pointer"
                  (click)="viewRequest(row)"></tr>

            </table>
          </div>
        }
      </mat-card-content>

      <mat-card-actions class="flex justify-between items-center p-4 bg-gray-50">
        <span class="text-sm text-gray-600">
          עודכן לאחרונה: {{ lastUpdated() | date:'dd/MM/yyyy HH:mm' }}
        </span>
        <button mat-raised-button color="primary" (click)="loadRequests()">
          <mat-icon>refresh</mat-icon>
          רענן
        </button>
      </mat-card-actions>
    </mat-card>
  `
})
export class RequestsListComponent implements OnInit {
  private readonly apiService = inject(ApiService);

  // Signals
  requests = signal<HelpDeskRequest[]>([]);
  isLoading = signal(false);
  lastUpdated = signal(new Date());

  // Computed
  totalRequests = computed(() => this.requests().length);

  // Table configuration
  displayedColumns: string[] = ['id', 'title', 'requestorName', 'priority', 'departmentId', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading.set(true);

    this.apiService.getRequests().subscribe({
      next: (data) => {
        this.requests.set(data);
        this.lastUpdated.set(new Date());
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.isLoading.set(false);
      }
    });
  }

  // TrackBy function for performance
  trackByRequestId(index: number, request: HelpDeskRequest): number {
    return request.id || index;
  }

  getPriorityText(priority: number): string {
    const priorities: Record<number, string> = {
      1: 'נמוכה',
      2: 'בינונית',
      3: 'גבוהה',
      4: 'קריטית'
    };
    return priorities[priority] || 'לא מוגדר';
  }

  getPriorityClass(priority: number): string {
    const classes: Record<number, string> = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
  }

  getDepartmentName(departmentId: number): string {
    const departments: Record<number, string> = {
      1: 'IT',
      2: 'משאבי אנוש',
      3: 'כספים',
      4: 'שיווק'
    };
    return departments[departmentId] || 'לא מוגדר';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'לא מוגדר';

    try {
      return new Date(dateString).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'תאריך לא תקין';
    }
  }

  viewRequest(request: HelpDeskRequest): void {
    console.log('Viewing request:', request);
    // Implementation for viewing request details
  }
}
