
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirmation-dialog">
      <div mat-dialog-title class="flex items-center space-x-3">
        <mat-icon class="text-orange-500">warning</mat-icon>
        <span>{{ data.title }}</span>
      </div>

      <div mat-dialog-content class="py-4">
        <p class="text-gray-700">{{ data.message }}</p>
      </div>

      <div mat-dialog-actions class="flex justify-end space-x-2">
        <button mat-button (click)="onCancel()">
          {{ data.cancelButtonText || 'Cancel' }}
        </button>
        <button
          mat-raised-button
          [color]="data.confirmButtonColor || 'primary'"
          (click)="onConfirm()">
          {{ data.confirmButtonText || 'Confirm' }}
        </button>
      </div>
    </div>
  `
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
