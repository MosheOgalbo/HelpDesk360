
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="flex items-center justify-center" [class]="containerClass">
      <div class="animate-spin rounded-full border-4 border-gray-200 border-t-primary-500"
           [class]="spinnerClass"></div>
      <span *ngIf="message" class="ml-3 text-gray-600" [class]="textClass">{{ message }}</span>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() message?: string;

  get containerClass(): string {
    return this.size === 'sm' ? 'p-2' : this.size === 'lg' ? 'p-8' : 'p-4';
  }

  get spinnerClass(): string {
    return this.size === 'sm' ? 'h-4 w-4' : this.size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  }

  get textClass(): string {
    return this.size === 'sm' ? 'text-sm' : this.size === 'lg' ? 'text-lg' : 'text-base';
  }
}
