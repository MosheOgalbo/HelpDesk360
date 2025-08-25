
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Request } from '../../../../core/models/request.model';

@Component({
  selector: 'app-request-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="request-detail-dialog">
      <!-- Dialog Header -->
      <div mat-dialog-title class="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Request Details</h2>
          <p class="text-sm text-gray-500">Request #{{ request.id }}</p>
        </div>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Dialog Content -->
      <div mat-dialog-content class="space-y-6">
        <!-- Status and Priority -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700">Status</label>
            <div class="mt-1">
              <span [class]="getStatusClass(request.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                {{ request.status }}
              </span>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Priority</label>
            <div class="mt-1">
              <span [class]="getPriorityClass(request.priority)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                {{ request.priority }}
              </span>
            </div>
          </div>
        </div>

        <!-- Requester Information -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Requester Information</h3>
          <div class="bg-gray-50 rounded-lg p-4 space-y-2">
            <div class="flex items-center space-x-2">
              <mat-icon class="text-gray-500">person</mat-icon>
              <span class="font-medium">{{ request.name }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <mat-icon class="text-gray-500">email</mat-icon>
              <a [href]="'mailto:' + request.email" class="text-blue-600 hover:text-blue-800">
                {{ request.email }}
              </a>
            </div>
            <div class="flex items-center space-x-2">
              <mat-icon class="text-gray-500">phone</mat-icon>
              <a [href]="'tel:' + request.phone" class="text-blue-600 hover:text-blue-800">
                {{ request.phone }}
              </a>
            </div>
          </div>
        </div>

        <!-- Departments -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Assigned Departments</h3>
          <div class="flex flex-wrap gap-2">
            <mat-chip *ngFor="let dept of request.departments" class="bg-blue-100 text-blue-800">
              {{ dept.name }} ({{ dept.code }})
            </mat-chip>
          </div>
        </div>

        <!-- Description -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-gray-700 whitespace-pre-wrap">{{ request.description }}</p>
          </div>
        </div>

        <!-- Timeline -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <mat-icon class="text-white text-sm">add</mat-icon>
              </div>
              <div>
                <p class="font-medium text-gray-900">Request Created</p>
                <p class="text-sm text-gray-500">{{ request.createdAt | date:'MMM d, y h:mm a' }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-3" *ngIf="request.updatedAt !== request.createdAt">
              <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <mat-icon class="text-white text-sm">edit</mat-icon>
              </div>
              <div>
                <p class="font-medium text-gray-900">Last Updated</p>
                <p class="text-sm text-gray-500">{{ request.updatedAt | date:'MMM d, y h:mm a' }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-3" *ngIf="request.resolvedAt">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <mat-icon class="text-white text-sm">check</mat-icon>
              </div>
              <div>
                <p class="font-medium text-gray-900">Resolved</p>
                <p class="text-sm text-gray-500">{{ request.resolvedAt | date:'MMM d, y h:mm a' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Resolution Time -->
        <div *ngIf="request.resolvedAt" class="bg-green-50 rounded-lg p-4">
          <h4 class="font-medium text-green-900 mb-1">Resolution Time</h4>
          <p class="text-sm text-green-700">
            {{ getResolutionTime() }}
          </p>
        </div>
      </div>

      <!-- Dialog Actions -->
      <div mat-dialog-actions class="flex justify-end space-x-2 pt-4 border-t">
        <button mat-button (click)="onClose()">Close</button>
        <button mat-raised-button color="primary" (click)="onEdit()">
          <mat-icon>edit</mat-icon>
          Edit Request
        </button>
      </div>
    </div>
  `,
  styles: [`
    .request-detail-dialog {
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
    }
  `]
})
export class RequestDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RequestDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public request: Request
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onEdit(): void {
    this.dialogRef.close({ action: 'edit', request: this.request });
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

  getResolutionTime(): string {
    if (!this.request.resolvedAt) return 'N/A';

    const created = new Date(this.request.createdAt);
    const resolved = new Date(this.request.resolvedAt);
    const diffMs = resolved.getTime() - created.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;

    if (diffHours < 24) {
      return `${diffHours} hours`;
    } else {
      const diffDays = Math.round(diffHours / 24 * 10) / 10;
      return `${diffDays} days`;
    }
  }
}
