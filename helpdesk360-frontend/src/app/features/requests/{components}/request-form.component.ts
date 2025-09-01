import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { ContactRequest } from '../../../core/models/contact.model';

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
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="max-w-4xl mx-auto">

        <!-- כותרת עמוד -->
        <div class="text-center mb-8">
          <h1 class="text-3xl md:text-4xl font-bold text-gradient mb-4">
            מערכת פניות לקוחות
          </h1>
          <p class="text-lg text-gray-600">
            מלא את הפרטים למטה ואנחנו נחזור אליך בהקדם
          </p>
        </div>

        <!-- כרטיס הטופס -->
        <mat-card class="shadow-soft slide-in">
          <mat-card-header>
            <div class="flex items-center w-full">
              <mat-icon class="text-2xl ml-3">support_agent</mat-icon>
              <mat-card-title>טופס פניה חדשה</mat-card-title>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">

              <!-- שדה שם -->
              <div class="mb-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>שם מלא</mat-label>
                  <mat-icon matPrefix class="text-gray-400 ml-2">person</mat-icon>
                  <input matInput formControlName="name" placeholder="הכנס את שמך המלא">
                  <mat-error *ngIf="contactForm.get('name')?.hasError('required')">
                    שדה חובה
                  </mat-error>
                  <mat-error *ngIf="contactForm.get('name')?.hasError('minlength')">
                    השם חייב להכיל לפחות 2 תווים
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- שורת טלפון ואימייל -->
              <div class="form-row flex flex-col md:flex-row gap-6 mb-6">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>מספר טלפון</mat-label>
                  <mat-icon matPrefix class="text-gray-400 ml-2">phone</mat-icon>
                  <input matInput formControlName="phone" placeholder="050-1234567" dir="ltr">
                  <mat-error *ngIf="contactForm.get('phone')?.hasError('required')">
                    שדה חובה
                  </mat-error>
                  <mat-error *ngIf="contactForm.get('phone')?.hasError('pattern')">
                    מספר טלפון לא תקין (לדוגמה: 050-1234567)
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>כתובת אימייל</mat-label>
                  <mat-icon matPrefix class="text-gray-400 ml-2">email</mat-icon>
                  <input matInput type="email" formControlName="email"
                         placeholder="example@company.com" dir="ltr">
                  <mat-error *ngIf="contactForm.get('email')?.hasError('required')">
                    שדה חובה
                  </mat-error>
                  <mat-error *ngIf="contactForm.get('email')?.hasError('email')">
                    כתובת אימייל לא תקינה
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- בחירת מחלקה -->
              <div class="mb-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>מחלקה</mat-label>
                  <mat-icon matPrefix class="text-gray-400 ml-2">business</mat-icon>
                  <mat-select formControlName="department" placeholder="בחר מחלקה">
                    <mat-option *ngFor="let dept of departments" [value]="dept.value">
                      <div class="flex items-center">
                        <mat-icon class="text-sm ml-2">{{ dept.icon }}</mat-icon>
                        {{ dept.label }}
                      </div>
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="contactForm.get('department')?.hasError('required')">
                    יש לבחור מחלקה
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- תיאור הפנייה -->
              <div class="mb-8">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>תיאור הפנייה</mat-label>
                  <mat-icon matPrefix class="text-gray-400 ml-2 self-start mt-4">description</mat-icon>
                  <textarea
                    matInput
                    formControlName="description"
                    rows="5"
                    placeholder="תאר את הבעיה או הבקשה בפירוט כדי שנוכל לעזור לך בצורה הטובה ביותר..."
                    class="resize-none">
                  </textarea>
                  <mat-hint>מינימום 10 תווים</mat-hint>
                  <mat-error *ngIf="contactForm.get('description')?.hasError('required')">
                    שדה חובה
                  </mat-error>
                  <mat-error *ngIf="contactForm.get('description')?.hasError('minlength')">
                    התיאור חייב להכיל לפחות 10 תווים
                  </mat-error>
                </mat-form-field>
              </div>

            </form>
          </mat-card-content>

          <!-- כפתורי פעולה -->
          <mat-card-actions class="flex justify-between items-center p-6 bg-gray-50 rounded-b-xl">
            <button
              mat-button
              type="button"
              (click)="resetForm()"
              [disabled]="isLoading"
              class="text-gray-600">
              <mat-icon class="ml-2">refresh</mat-icon>
              איפוס טופס
            </button>

            <button
              mat-raised-button
              color="primary"
              (click)="onSubmit()"
              [disabled]="contactForm.invalid || isLoading"
              class="min-w-40 gradient-bg">
              <mat-spinner diameter="20" *ngIf="isLoading" class="inline ml-2"></mat-spinner>
              <mat-icon *ngIf="!isLoading" class="ml-2">send</mat-icon>
              {{ isLoading ? 'שולח...' : 'שלח פנייה' }}
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- הודעת הצלחה -->
        <div *ngIf="showSuccessMessage" class="mt-6 slide-in">
          <mat-card class="bg-green-50 border-r-4 border-green-500">
            <mat-card-content class="flex items-center p-4">
              <mat-icon class="text-green-600 ml-3">check_circle</mat-icon>
              <div>
                <h3 class="text-lg font-semibold text-green-800 mb-1">הפנייה נשלחה בהצלחה!</h3>
                <p class="text-green-700">נחזור אליך תוך 24 שעות</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .text-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .mat-mdc-form-field-prefix mat-icon {
      margin-left: 8px;
    }

    .gradient-bg {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    }

    .slide-in {
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Mobile improvements */
    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .text-3xl {
        font-size: 1.875rem;
      }

      .text-4xl {
        font-size: 2.25rem;
      }
    }
  `]
})
export class RequestFormComponent implements OnInit {
  contactForm!: FormGroup;
  isLoading = false;
  showSuccessMessage = false;

  // רשימת מחלקות עם אייקונים
  departments = [
    { value: 'IT', label: 'מחלקת מחשבים', icon: 'computer' },
    { value: 'HR', label: 'משאבי אנוש', icon: 'people' },
    { value: 'Finance', label: 'כספים', icon: 'account_balance' },
    { value: 'Marketing', label: 'שיווק', icon: 'campaign' },
    { value: 'Operations', label: 'תפעול', icon: 'settings' }
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * אתחול הטופס עם בדיקות מתקדמות
   */
  initForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[א-תa-zA-Z\s]+$/) // רק אותיות ורווחים
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^0[5-9]\d{1}-?\d{7}$/) // טלפון ישראלי
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]],
      department: ['', [Validators.required]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000)
      ]]
    });
  }

  /**
   * שליחת הטופס עם אנימציות
   */
  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isLoading = true;
      this.showSuccessMessage = false;

      const formData: ContactRequest = this.contactForm.value;

      this.apiService.submitContact(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showSuccessMessage = true;

          // הודעת הצלחה
          this.snackBar.open(
            `🎉 הפנייה נשלחה בהצלחה! מספר פנייה: ${response.id}`,
            'סגור',
            {
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );

          // איפוס הטופס אחרי 3 שניות
          setTimeout(() => {
            this.resetForm();
            this.showSuccessMessage = false;
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('שגיאה בשליחת הפנייה:', error);

          this.snackBar.open(
            '❌ שגיאה בשליחת הפנייה. אנא נסה שוב או פנה לתמיכה טכנית',
            'סגור',
            {
              duration: 7000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    } else {
      // הדגשת שדות שגויים
      this.contactForm.markAllAsTouched();

      this.snackBar.open(
        '⚠️ אנא מלא את כל השדות החובה בצורה תקינה',
        'סגור',
        { duration: 4000 }
      );
    }
  }

  /**
   * איפוס הטופס עם אנימציה
   */
  resetForm(): void {
    this.contactForm.reset();
    this.showSuccessMessage = false;

    // איפוס מצב השגיאות
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.setErrors(null);
    });

    this.snackBar.open('📝 הטופס אופס', 'סגור', { duration: 2000 });
  }
}
