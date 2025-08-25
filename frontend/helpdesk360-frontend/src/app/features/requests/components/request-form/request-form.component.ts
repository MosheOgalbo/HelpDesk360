
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Request, CreateRequest, UpdateRequest, REQUEST_PRIORITIES, REQUEST_STATUSES } from '../../../../core/models/request.model';
import { Department } from '../../../../core/models/department.model';
import { DepartmentService } from '../../../../core/services/department.service';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule
  ],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">
        {{ isEditMode ? 'Edit Request' : 'Create New Request' }}
      </h2>

      <form [formGroup]="requestForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Personal Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter your full name">
            <mat-error *ngIf="requestForm.get('name')?.hasError('required')">
              Name is required
            </mat-error>
            <mat-error *ngIf="requestForm.get('name')?.hasError('maxlength')">
              Name cannot exceed 200 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phone" placeholder="+1-555-0123">
            <mat-error *ngIf="requestForm.get('phone')?.hasError('required')">
              Phone number is required
            </mat-error>
            <mat-error *ngIf="requestForm.get('phone')?.hasError('pattern')">
              Please enter a valid phone number
            </mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Email Address</mat-label>
          <input matInput type="email" formControlName="email" placeholder="name@company.com">
          <mat-error *ngIf="requestForm.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="requestForm.get('email')?.hasError('email')">
            Please enter a valid email address
          </mat-error>
        </mat-form-field>

        <!-- Request Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option *ngFor="let priority of priorities" [value]="priority">
                <span [class]="getPriorityClass(priority)" class="px-2 py-1 rounded text-xs font-medium">
                  {{ priority }}
                </span>
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full" *ngIf="isEditMode">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option *ngFor="let status of statuses" [value]="status">
                <span [class]="getStatusClass(status)" class="px-2 py-1 rounded text-xs font-medium">
                  {{ status }}
                </span>
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Departments</mat-label>
          <mat-select formControlName="departmentIds" multiple>
            <mat-option *ngFor="let department of departments" [value]="department.id">
              {{ department.name }} ({{ department.code }})
            </mat-option>
          </mat-select>
          <mat-hint>Select one or more departments that can help with your request</mat-hint>
          <mat-error *ngIf="requestForm.get('departmentIds')?.hasError('required')">
            At least one department must be selected
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="4"
            placeholder="Please describe your issue or request in detail">
          </textarea>
          <mat-hint align="end">
            {{ requestForm.get('description')?.value?.length || 0 }}/1000 characters
          </mat-hint>
          <mat-error *ngIf="requestForm.get('description')?.hasError('required')">
            Description is required
          </mat-error>
          <mat-error *ngIf="requestForm.get('description')?.hasError('minlength')">
            Description must be at least 10 characters
          </mat-error>
        </mat-form-field>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            mat-raised-button
            color="primary"
            [disabled]="requestForm.invalid || isLoading"
            class="w-full sm:w-auto">
            <span *ngIf="!isLoading">
              {{ isEditMode ? 'Update Request' : 'Submit Request' }}
            </span>
            <span *ngIf="isLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isEditMode ? 'Updating...' : 'Submitting...' }}
            </span>
          </button>

          <button
            type="button"
            mat-button
            color="warn"
            (click)="onCancel()"
            [disabled]="isLoading"
            class="w-full sm:w-auto">
            Cancel
          </button>

          <button
            type="button"
            mat-button
            (click)="onReset()"
            [disabled]="isLoading"
            class="w-full sm:w-auto">
            Reset Form
          </button>
        </div>
      </form>
    </div>
  `
})
export class RequestFormComponent implements OnInit {
  @Input() request?: Request;
  @Input() isLoading = false;
  @Output() submitRequest = new EventEmitter<CreateRequest | UpdateRequest>();
  @Output() cancel = new EventEmitter<void>();

  requestForm!: FormGroup;
  departments: Department[] = [];
  priorities = REQUEST_PRIORITIES;
  statuses = REQUEST_STATUSES;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadDepartments();
  }

  get isEditMode(): boolean {
    return !!this.request;
  }

  private initializeForm(): void {
    this.requestForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      phone: ['', [Validators.required, Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(320)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      priority: ['Medium', Validators.required],
      departmentIds: [[], Validators.required],
      ...(this.isEditMode && { status: ['Open', Validators.required] })
    });

    if (this.request) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (this.request) {
      this.requestForm.patchValue({
        name: this.request.name,
        phone: this.request.phone,
        email: this.request.email,
        description: this.request.description,
        priority: this.request.priority,
        status: this.request.status,
        departmentIds: this.request.departments.map(d => d.id)
      });
    }
  }

  private loadDepartments(): void {
    this.departmentService.departments$.subscribe(departments => {
      this.departments = departments;
    });
  }

  onSubmit(): void {
    if (this.requestForm.valid) {
      const formValue = this.requestForm.value;

      if (this.isEditMode) {
        const updateRequest: UpdateRequest = {
          name: formValue.name,
          phone: formValue.phone,
          email: formValue.email,
          description: formValue.description,
          priority: formValue.priority,
          status: formValue.status,
          departmentIds: formValue.departmentIds
        };
        this.submitRequest.emit(updateRequest);
      } else {
        const createRequest: CreateRequest = {
          name: formValue.name,
          phone: formValue.phone,
          email: formValue.email,
          description: formValue.description,
          priority: formValue.priority,
          departmentIds: formValue.departmentIds
        };
        this.submitRequest.emit(createRequest);
      }
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onReset(): void {
    this.requestForm.reset({
      priority: 'Medium',
      status: this.isEditMode ? 'Open' : undefined
    });
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
}
