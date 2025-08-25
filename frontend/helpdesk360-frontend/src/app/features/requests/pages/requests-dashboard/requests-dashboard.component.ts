
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequestService } from '../../../../core/services/request.service';
import { Request, CreateRequest, UpdateRequest } from '../../../../core/models/request.model';
import { RequestListComponent } from '../../components/request-list/request-list.component';
import { RequestFormComponent } from '../../components/request-form/request-form.component';
import { RequestDetailDialogComponent } from '../../components/request-detail/request-detail-dialog.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-requests-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RequestListComponent,
    RequestFormComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Dashboard Header -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Support Requests Dashboard</h1>
            <p class="text-gray-600 mt-1">Manage and track all support requests</p>
          </div>

          <!-- Quick Stats -->
          <div class="flex flex-wrap gap-4">
            <div class="bg-blue-50 px-4 py-2 rounded-lg">
              <p class="text-blue-600 text-sm font-medium">Total Requests</p>
              <p class="text-blue-900 text-lg font-bold">{{ totalRequests }}</p>
            </div>
            <div class="bg-yellow-50 px-4 py-2 rounded-lg">
              <p class="text-yellow-600 text-sm font-medium">Open</p>
              <p class="text-yellow-900 text-lg font-bold">{{ openRequests }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Create New Request Form -->
      <div *ngIf="showCreateForm" class="animate-fade-in">
        <app-request-form
          [isLoading]="isCreating"
          (submitRequest)="onCreateRequest($event)"
          (cancel)="onCancelCreate()">
        </app-request-form>
      </div>

      <!-- Edit Request Form -->
      <div *ngIf="showEditForm && selectedRequest" class="animate-fade-in">
        <app-request-form
          [request]="selectedRequest"
          [isLoading]="isUpdating"
          (submitRequest)="onUpdateRequest($event)"
          (cancel)="onCancelEdit()">
        </app-request-form>
      </div>

      <!-- Requests List -->
      <div *ngIf="!showCreateForm && !showEditForm">
        <app-request-list
          [requests]="requests"
          [isLoading]="isLoading"
          [totalCount]="totalCount"
          [currentPage]="currentPage"
          [pageSize]="pageSize"
          (pageChange)="onPageChange($event)"
          (search)="onSearch($event)"
          (createNew)="onShowCreateForm()"
          (viewRequest)="onViewRequest($event)"
          (editRequest)="onEditRequest($event)"
          (deleteRequest)="onDeleteRequest($event)">
        </app-request-list>
      </div>
    </div>
  `
})
export class RequestsDashboardComponent implements OnInit {
  requests: Request[] = [];
  selectedRequest?: Request;

  isLoading = false;
  isCreating = false;
  isUpdating = false;

  showCreateForm = false;
  showEditForm = false;

  // Pagination
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;

  // Quick stats
  totalRequests = 0;
  openRequests = 0;

  constructor(
    private requestService: RequestService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
    this.loadQuickStats();
  }

  loadRequests(page: number = 1, pageSize: number = 10): void {
    this.isLoading = true;
    this.currentPage = page;
    this.pageSize = pageSize;

    this.requestService.getRequests(page, pageSize).subscribe({
      next: (result) => {
        this.requests = result.items;
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.showErrorMessage('Failed to load requests');
        this.isLoading = false;
      }
    });
  }

  loadQuickStats(): void {
    // This would typically be a separate API call for dashboard statistics
    this.requestService.requests$.subscribe(requests => {
      this.totalRequests = requests.length;
      this.openRequests = requests.filter(r => r.status === 'Open').length;
    });
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.loadRequests(event.page, event.pageSize);
  }

  onSearch(searchTerm: string): void {
    if (searchTerm.trim()) {
      this.isLoading = true;
      this.requestService.searchRequests(searchTerm).subscribe({
        next: (requests) => {
          this.requests = requests;
          this.totalCount = requests.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error searching requests:', error);
          this.showErrorMessage('Failed to search requests');
          this.isLoading = false;
        }
      });
    } else {
      this.loadRequests(1, this.pageSize);
    }
  }

  onShowCreateForm(): void {
    this.showCreateForm = true;
    this.showEditForm = false;
    this.selectedRequest = undefined;
  }

  onCreateRequest(createRequest: CreateRequest): void {
    this.isCreating = true;

    this.requestService.createRequest(createRequest).subscribe({
      next: (newRequest) => {
        this.showSuccessMessage('Request created successfully');
        this.showCreateForm = false;
        this.isCreating = false;
        this.loadRequests(this.currentPage, this.pageSize);
      },
      error: (error) => {
        console.error('Error creating request:', error);
        this.showErrorMessage('Failed to create request');
        this.isCreating = false;
      }
    });
  }

  onCancelCreate(): void {
    this.showCreateForm = false;
  }

  onViewRequest(request: Request): void {
    const dialogRef = this.dialog.open(RequestDetailDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: request
    });
  }

  onEditRequest(request: Request): void {
    this.selectedRequest = request;
    this.showEditForm = true;
    this.showCreateForm = false;
  }

  onUpdateRequest(updateRequest: UpdateRequest): void {
    if (!this.selectedRequest) return;

    this.isUpdating = true;

    this.requestService.updateRequest(this.selectedRequest.id, updateRequest).subscribe({
      next: (updatedRequest) => {
        this.showSuccessMessage('Request updated successfully');
        this.showEditForm = false;
        this.selectedRequest = undefined;
        this.isUpdating = false;
        this.loadRequests(this.currentPage, this.pageSize);
      },
      error: (error) => {
        console.error('Error updating request:', error);
        this.showErrorMessage('Failed to update request');
        this.isUpdating = false;
      }
    });
  }

  onCancelEdit(): void {
    this.showEditForm = false;
    this.selectedRequest = undefined;
  }

  onDeleteRequest(request: Request): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Request',
        message: `Are you sure you want to delete request #${request.id}?`,
        confirmButtonText: 'Delete',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.requestService.deleteRequest(request.id).subscribe({
          next: () => {
            this.showSuccessMessage('Request deleted successfully');
            this.loadRequests(this.currentPage, this.pageSize);
          },
          error: (error) => {
            console.error('Error deleting request:', error);
            this.showErrorMessage('Failed to delete request');
          }
        });
      }
    });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
