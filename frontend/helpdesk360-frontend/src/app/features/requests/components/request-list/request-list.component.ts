
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Request } from '../../../../core/models/request.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="bg-white rounded-lg shadow-md">
      <!-- Header with Search -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 class="text-xl font-semibold text-gray-900">Support Requests</h2>

          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <mat-form-field appearance="outline" class="w-full sm:w-64">
              <mat-label>Search requests</mat-label>
              <input
                matInput
                [(ngModel)]="searchTerm"
                (keyup.enter)="onSearch()"
                placeholder="Name, email, or description">
              <button
                matSuffix
                mat-icon-button
                (click)="onSearch()"
                [disabled]="isLoading">
                <mat-icon>search</mat-icon>
              </button>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              (click)="onCreateNew()"
              class="whitespace-nowrap">
              <mat-icon>add</mat-icon>
              New Request
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <app-loading-spinner
        *ngIf="isLoading"
        size="lg"
        message="Loading requests...">
      </app-loading-spinner>

      <!-- Request Table -->
      <div *ngIf="!isLoading" class="overflow-x-auto">
        <table mat-table [dataSource]="requests" class="w-full">
          <!-- ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef class="font-semibold">#ID</th>
            <td mat-cell *matCellDef="let request" class="text-sm">
              {{ request.id }}
            </td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef class="font-semibold">Requester</th>
            <td mat-cell *matCellDef="let request">
              <div class="flex flex-col">
                <span class="font-medium text-gray-900">{{ request.name }}</span>
                <span class="text-sm text-gray-500">{{ request.email }}</span>
                <span class="text-xs text-gray-400">{{ request.phone }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Description Column -->
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef class="font-semibold">Description</th>
            <td mat-cell *matCellDef="let request">
              <div class="max-w-xs">
                <p class="text-sm text-gray-700 truncate" [title]="request.description">
                  {{ request.description }}
                </p>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span
                    *ngFor="let dept of request.departments"
                    class="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                    {{ dept.code }}
                  </span>
                </div>
              </div>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef class="font-semibold">Status</th>
            <td mat-cell *matCellDef="let request">
              <mat-chip [class]="getStatusClass(request.status)" class="text-xs">
                {{ request.status }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Priority Column -->
          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef class="font-semibold">Priority</th>
            <td mat-cell *matCellDef="let request">
              <mat-chip [class]="getPriorityClass(request.priority)" class="text-xs">
                {{ request.priority }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Created Date Column -->
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef class="font-semibold">Created</th>
            <td mat-cell *matCellDef="let request">
              <div class="text-sm">
                <div>{{ request.createdAt | date:'MMM d, y' }}</div>
                <div class="text-xs text-gray-500">{{ request.createdAt | date:'h:mm a' }}</div>
              </div>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="font-semibold">Actions</th>
            <td mat-cell *matCellDef="let request">
              <div class="flex gap-2">
                <button
                  mat-icon-button
                  color="primary"
                  (click)="onView(request)"
                  matTooltip="View Details"
                  class="text-blue-600 hover:bg-blue-50">
                  <mat-icon>visibility</mat-icon>
                </button>

                <button
                  mat-icon-button
                  color="accent"
                  (click)="onEdit(request)"
                  matTooltip="Edit Request"
                  class="text-green-600 hover:bg-green-50">
                  <mat-icon>edit</mat-icon>
                </button>

                <button
                  mat-icon-button
                  color="warn"
                  (click)="onDelete(request)"
                  matTooltip="Delete Request"
                  class="text-red-600 hover:bg-red-50">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              class="hover:bg-gray-50 transition-colors duration-150"></tr>
        </table>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && requests.length === 0"
           class="text-center py-12">
        <mat-icon class="text-gray-400 text-6xl mb-4">assignment</mat-icon>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
        <p class="text-gray-500 mb-4">
          {{ searchTerm ? 'No requests match your search criteria.' : 'Get started by creating your first support request.' }}
        </p>
        <button
          mat-raised-button
          color="primary"
          (click)="searchTerm ? onClearSearch() : onCreateNew()">
          {{ searchTerm ? 'Clear Search' : 'Create Request' }}
        </button>
      </div>

      <!-- Pagination -->
      <mat-paginator
        *ngIf="!isLoading && totalCount > 0"
        [length]="totalCount"
        [pageSize]="pageSize"
        [pageSizeOptions]="[10, 25, 50, 100]"
        [pageIndex]="currentPage - 1"
        (page)="onPageChange($event)"
        showFirstLastButtons
        class="border-t border-gray-200">
      </mat-paginator>
    </div>
  `
})
export class RequestListComponent implements OnInit {
  @Input() requests: Request[] = [];
  @Input() isLoading = false;
  @Input() totalCount = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 10;

  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();
  @Output() search = new EventEmitter<string>();
  @Output() createNew = new EventEmitter<void>();
  @Output() viewRequest = new EventEmitter<Request>();
  @Output() editRequest = new EventEmitter<Request>();
  @Output() deleteRequest = new EventEmitter<Request>();

  searchTerm = '';
  displayedColumns: string[] = ['id', 'name', 'description', 'status', 'priority', 'createdAt', 'actions'];

  ngOnInit(): void {
    // Component initialization
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit({
      page: event.pageIndex + 1,
      pageSize: event.pageSize
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.search.emit(this.searchTerm.trim());
    }
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.search.emit('');
  }

  onCreateNew(): void {
    this.createNew.emit();
  }

  onView(request: Request): void {
    this.viewRequest.emit(request);
  }

  onEdit(request: Request): void {
    this.editRequest.emit(request);
  }

  onDelete(request: Request): void {
    this.deleteRequest.emit(request);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Open': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
  }
}
