import { Component, input, output, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { CreateRequestDto } from '../../../core/models/request.model';
import { inject } from '@angular/core';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="max-w-2xl mx-auto">
      <mat-card-header>
        <mat-card-title class="text-2xl font-bold text-gray-800">
          יצירת בקשת תמיכה חדשה
        </mat-card-title>
      </mat-card-header>

      <mat-card-content class="mt-4">
        <form [formGroup]="requestForm" (ngSubmit)="onSubmit()" class="space-y-4">

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>כותרת</mat-label>
            <input matInput formControlName="title" placeholder="תאר את הבעיה בקצרה">
            @if (requestForm.get('title')?.errors?.['required'] && requestForm.get('title')?.touched) {
              <mat-error>שדה חובה</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>תיאור מפורט</mat-label>
            <textarea matInput formControlName="description" rows="4"
                     placeholder="תאר את הבעיה בפירוט"></textarea>
            @if (requestForm.get('description')?.errors?.['required'] && requestForm.get('description')?.touched) {
              <mat-error>שדה חובה</mat-error>
            }
          </mat-form-field>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>רמת דחיפות</mat-label>
              <mat-select formControlName="priority">
                <mat-option [value]="1">נמוכה</mat-option>
                <mat-option [value]="2">בינונית</mat-option>
                <mat-option [value]="3">גבוהה</mat-option>
                <mat-option [value]="4">קריטית</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>מחלקה</mat-label>
              <mat-select formControlName="departmentId">
                <mat-option [value]="1">IT</mat-option>
                <mat-option [value]="2">משאבי אנוש</mat-option>
                <mat-option [value]="3">כספים</mat-option>
                <mat-option [value]="4">שיווק</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>שם מלא</mat-label>
              <input matInput formControlName="requestorName" placeholder="שם המבקש">
              @if (requestForm.get('requestorName')?.errors?.['required'] && requestForm.get('requestorName')?.touched) {
                <mat-error>שדה חובה</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>אימייל</mat-label>
              <input matInput type="email" formControlName="requestorEmail" placeholder="example@company.com">
              @if (requestForm.get('requestorEmail')?.errors?.['required'] && requestForm.get('requestorEmail')?.touched) {
                <mat-error>שדה חובה</mat-error>
              }
              @if (requestForm.get('requestorEmail')?.errors?.['email'] && requestForm.get('requestorEmail')?.touched) {
                <mat-error>כתובת אימייל לא תקינה</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>טלפון</mat-label>
              <input matInput formControlName="requestorPhone" placeholder="050-1234567">
            </mat-form-field>
          </div>

        </form>
      </mat-card-content>

      <mat-card-actions class="flex justify-end gap-2 p-4">
        <button mat-button type="button" (click)="resetForm()"
                [disabled]="isLoading()">
          איפוס
        </button>
        <button mat-raised-button color="primary"
                (click)="onSubmit()"
                [disabled]="requestForm.invalid || isLoading()"
                class="min-w-[120px]">
          @if (isLoading()) {
            <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
          }
          שלח בקשה
        </button>
      </mat-card-actions>
    </mat-card>
  `
})
export class RequestFormComponent implements OnInit {
  // Inputs
  initialData = input<CreateRequestDto | null>(null);

  // Outputs
  formSubmit = output<CreateRequestDto>();

  // Services
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);

  // Signals
  isLoading = signal(false);
  submitSuccess = signal(false);

  // Form
  requestForm!: FormGroup;

  // Computed
  canSubmit = computed(() =>
    this.requestForm?.valid && !this.isLoading()
  );

  ngOnInit(): void {
    this.initializeForm();

    // Watch for initial data changes
    const initial = this.initialData();
    if (initial) {
      this.requestForm.patchValue(initial);
    }
  }

  private initializeForm(): void {
    this.requestForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority: [2, [Validators.required, Validators.min(1), Validators.max(4)]],
      departmentId: [1, [Validators.required]],
      requestorName: ['', [Validators.required]],
      requestorEmail: ['', [Validators.required, Validators.email]],
      requestorPhone: ['']
    });
  }

  onSubmit(): void {
    if (this.requestForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.submitSuccess.set(false);

      const formData: CreateRequestDto = this.requestForm.value;

      this.apiService.createRequest(formData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.submitSuccess.set(true);
          this.snackBar.open('הבקשה נשלחה בהצלחה!', 'סגור', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.formSubmit.emit(formData);
          this.resetForm();
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error creating request:', error);
        }
      });
    }
  }

  resetForm(): void {
    this.requestForm.reset();
    this.requestForm.patchValue({
      priority: 2,
      departmentId: 1
    });
    this.submitSuccess.set(false);
  }
}
