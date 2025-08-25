
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="error-message bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start space-x-3">
        <mat-icon class="text-red-500 mt-0.5">error</mat-icon>
        <div class="flex-1">
          <h3 class="text-red-800 font-medium">{{ title || 'Error' }}</h3>
          <p class="text-red-700 text-sm mt-1">{{ message }}</p>
          <button
            *ngIf="showRetry"
            mat-button
            color="accent"
            (click)="onRetry()"
            class="mt-2">
            Try Again
          </button>
        </div>
      </div>
    </div>
  `
})
export class ErrorMessageComponent {
  @Input() title?: string;
  @Input() message: string = 'An error occurred';
  @Input() showRetry: boolean = false;

  onRetry(): void {
    // Emit retry event or handle retry logic
    window.location.reload();
  }
}
