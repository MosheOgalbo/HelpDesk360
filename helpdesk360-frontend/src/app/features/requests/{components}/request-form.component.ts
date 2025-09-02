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
import { ContactRequest, Priority, Department } from '../../../core/models/contact.model';

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

        <!-- דיבאג אזור - מציג את הנתונים שנשלחים -->
        <div *ngIf="debugMode" class="mb-6">
          <mat-card class="bg-blue-50 border-r-4 border-blue-500">
            <mat-card-header>
              <mat-card-title class="text-blue-800">מצב דיבאג - נתונים לשליחה</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <pre class="text-sm bg-gray-100 p-4 rounded overflow-auto" dir="ltr">{{ debugData | json }}</pre>
              <button mat-button (click)="debugMode = false" class="mt-2">
                <mat-icon>close</mat-icon>
                סגור דיבאג
              </button>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- כרטיס הטופס -->
        <mat-card class="shadow-soft slide-in">
          <mat-card-header>
            <div class="flex items-center w-full justify-between">
              <div class="flex items-center">
                <mat-icon class="text-2xl ml-3">support_agent</mat-icon>
                <mat-card-title>טופס פניה חדשה</mat-card-title>
              </div>
              <button mat-icon-button (click)="toggleDebugMode()"
                      [class.text-blue-600]="debugMode"
                      matTooltip="מצב דיבאג">
                <mat-icon>bug_report</mat-icon>
              </button>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">

              <!-- כותרת הפנייה -->
              <div class="mb-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>כותרת הפנייה</mat-label>
                  <mat-icon matPrefix class="text-gray-400 ml-2">title</mat-icon>
                  <input matInput formControlName="title" placeholder="תאר את הנושא בקצרה">
                  <mat-error *ngIf="contactForm.get('title')?.hasError('required')">
                    שדה חובה
                  </mat-error>
                  <mat-error *ngIf="contactForm.get('title')?.hasError('minlength')">
                    הכותרת חייבת להכיל לפחות 5 תווים
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- שדה שם -->
              <div class="mb-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>שם מלא</mat-label>
                  <mat-icon matPrefix class="text-gray-400 ml-2">person</mat-icon>
                  <input matInput formControlName="requestorName" placeholder="הכנס את שמך המלא">
                  <mat-error *ngIf="contactForm.get('requestorName')?.hasError('required')">
                    שדה חובה
                  </mat-error>
                  <mat-error *ngIf="contactForm.get('requestorName')?.hasError('minlength')">
                    השם חייב להכיל לפחות 2 תווים
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- שורת טלפון ואימייל -->
              <div class="form-row flex flex-col md:flex-row gap-6 mb-6">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>מספר טלפון</mat-label>
                  <mat-icon matPrefix class="text-gray-400 ml-2">phone</mat-icon>
                  <input matInput formControlName="requestorPhone" placeholder="0501234567" dir="ltr">
                  <mat-hint>ללא מקפים - לדוגמה: 0501234567</mat-hint>
                  <mat-error *ngIf="contactForm.get('requestorPhone')?.hasError('required')">
                    שדה חובה
                  </mat-error>
                  <mat-error *ngIf="contactForm.get('requestorPhone')?.hasError('pattern')">
                    מספר טלפון לא תקין (לדוגמה: 0501234567)
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>כתובת אימייל</mat-label>
                  <mat-icon matPrefix class="text-gray-400 ml-2">email</mat-icon>
                  <input matInput type="email" formControlName="requestorEmail"
                         placeholder="example@company.com" dir="ltr">
                  <mat-error *ngIf="contactForm.get('requestorEmail')?.hasError('required')">
                    שדה חובה
                  </mat-error>
                  <mat-error *ngIf="contactForm.get('requestorEmail')?.hasError('email')">
                    כתובת אימייל לא תקינה
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- שורת מחלקה ורמת חשיבות -->
              <div class="form-row flex flex-col md:flex-row gap-6 mb-6">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>מחלקה</mat-label>
                  <mat-icon matPrefix class="text-gray-400 ml-2">business</mat-icon>
                  <mat-select formControlName="departmentId" placeholder="בחר מחלקה">
                    <mat-option *ngFor="let dept of departments" [value]="dept.id">
                      <div class="flex items-center">
                        <mat-icon class="text-sm ml-2">{{ dept.icon }}</mat-icon>
                        {{ dept.name }} (ID: {{ dept.id }})
                      </div>
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="contactForm.get('departmentId')?.hasError('required')">
                    יש לבחור מחלקה
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>רמת חשיבות</mat-label>
                  <mat-icon matPrefix class="text-gray-400 ml-2">priority_high</mat-icon>
                  <mat-select formControlName="priority" placeholder="בחר רמת חשיבות">
                    <mat-option *ngFor="let priority of priorityOptions" [value]="priority.value">
                      <div class="flex items-center">
                        <mat-icon class="text-sm ml-2" [class]="priority.colorClass">{{ priority.icon }}</mat-icon>
                        {{ priority.label }} ({{ priority.value }})
                      </div>
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="contactForm.get('priority')?.hasError('required')">
                    יש לבחור רמת חשיבות
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
            <div class="flex gap-2">
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
                mat-button
                type="button"
                (click)="testConnection()"
                [disabled]="isLoading"
                class="text-blue-600">
                <mat-icon class="ml-2">wifi</mat-icon>
                בדיקת חיבור
              </button>
            </div>

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
                <p class="text-green-700">מספר פנייה: {{ successRequestId }} | נחזור אליך תוך 24 שעות</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- הודעת שגיאה מפורטת -->
        <div *ngIf="lastError" class="mt-6">
          <mat-card class="bg-red-50 border-r-4 border-red-500">
            <mat-card-header>
              <mat-card-title class="text-red-800 flex items-center">
                <mat-icon class="ml-2">error</mat-icon>
                שגיאה בשליחת הפנייה
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="mb-4">
                <strong>סטטוס:</strong> {{ lastError.status }} - {{ lastError.statusText }}
              </div>
              <div class="mb-4">
                <strong>URL:</strong> {{ lastError.url }}
              </div>
              <div *ngIf="lastError.error" class="mb-4">
                <strong>שגיאת שרת:</strong>
                <pre class="text-sm bg-red-100 p-2 rounded mt-2 overflow-auto" dir="ltr">{{ lastError.error | json }}</pre>
              </div>
              <button mat-button (click)="lastError = null" class="text-red-800">
                <mat-icon>close</mat-icon>
                סגור
              </button>
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

    .text-green-400 { color: #4ade80; }
    .text-yellow-500 { color: #eab308; }
    .text-orange-500 { color: #f97316; }
    .text-red-500 { color: #ef4444; }

    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
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
  successRequestId: number | null = null;
  debugMode = false;
  debugData: any = {};
  lastError: any = null;

  // רשימת מחלקות עם מזהים מעודכנים
  departments: Department[] = [
    { id: 1, name: 'מחלקת מחשבים', icon: 'computer' },
    { id: 2, name: 'משאבי אנוש', icon: 'people' },
    { id: 3, name: 'כספים', icon: 'account_balance' },
    { id: 4, name: 'שיווק', icon: 'campaign' },
    { id: 5, name: 'תפעול', icon: 'settings' }
  ];

  // אפשרויות רמת חשיבות
  priorityOptions = [
    { value: Priority.Low, label: 'נמוכה', icon: 'keyboard_arrow_down', colorClass: 'text-green-400' },
    { value: Priority.Medium, label: 'בינונית', icon: 'remove', colorClass: 'text-yellow-500' },
    { value: Priority.High, label: 'גבוהה', icon: 'keyboard_arrow_up', colorClass: 'text-orange-500' },
    { value: Priority.Critical, label: 'קריטית', icon: 'priority_high', colorClass: 'text-red-500' }
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
   * אתחול הטופס
   */
  initForm(): void {
    this.contactForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(200)
      ]],
      requestorName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[א-תa-zA-Z\s\-']+$/) // מתיר גם מקף וגרש
      ]],
      requestorPhone: ['', [
        Validators.required,
        Validators.pattern(/^0[5-9]\d{8}$/) // בדיוק 10 ספרות ללא מקפים
      ]],
      requestorEmail: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]],
      departmentId: [null, [Validators.required]],
      priority: [Priority.Medium, [Validators.required]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000)
      ]]
    });

    // עדכון דיבאג בזמן אמת
    this.contactForm.valueChanges.subscribe(value => {
      this.debugData = { ...value };
    });
  }

  /**
   * הפעלת/כיבוי מצב דיבאג
   */
  toggleDebugMode(): void {
    this.debugMode = !this.debugMode;
    this.debugData = { ...this.contactForm.value };
  }

  /**
   * בדיקת חיבור לשרת
   */
  testConnection(): void {
    this.isLoading = true;

    // ניסיון קריאה לשרת (GET בדרך כלל יותר פשוט)
    fetch('http://localhost:8080/api/Requests')
      .then(response => {
        this.isLoading = false;
        if (response.ok) {
          this.snackBar.open('✅ החיבור לשרת תקין!', 'סגור', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        } else {
          this.snackBar.open(`❌ שגיאת שרת: ${response.status}`, 'סגור', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      })
      .catch(error => {
        this.isLoading = false;
        console.error('שגיאת חיבור:', error);
        this.snackBar.open('❌ אין חיבור לשרת', 'סגור', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      });
  }

  /**
   * שליחת הטופס עם לוג מפורט
   */
  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isLoading = true;
      this.showSuccessMessage = false;
      this.lastError = null;

      const formData: ContactRequest = {
        title: this.contactForm.value.title?.trim(),
        description: this.contactForm.value.description?.trim(),
        priority: parseInt(this.contactForm.value.priority),
        departmentId: parseInt(this.contactForm.value.departmentId),
        requestorName: this.contactForm.value.requestorName?.trim(),
        requestorEmail: this.contactForm.value.requestorEmail?.trim(),
        requestorPhone: this.contactForm.value.requestorPhone?.trim()
      };

      // ווידוא שהנתונים תקינים
      console.log('🔍 נתונים לשליחה:', formData);
      console.log('🔍 טיפוסי נתונים:', {
        title: typeof formData.title,
        description: typeof formData.description,
        priority: typeof formData.priority,
        departmentId: typeof formData.departmentId,
        requestorName: typeof formData.requestorName,
        requestorEmail: typeof formData.requestorEmail,
        requestorPhone: typeof formData.requestorPhone
      });

      this.debugData = formData;

      this.apiService.submitContact(formData).subscribe({
        next: (response) => {
          console.log('✅ תגובת שרת:', response);
          this.isLoading = false;
          this.showSuccessMessage = true;
          this.successRequestId = response.id;

          this.snackBar.open(
            `🎉 הפנייה נשלחה בהצלחה! מספר פנייה: ${response.id}`,
            'סגור',
            {
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );

          setTimeout(() => {
            this.resetForm();
            this.showSuccessMessage = false;
            this.successRequestId = null;
          }, 5000);
        },
        error: (error) => {
          console.error('❌ שגיאה מפורטת:', error);
          console.error('❌ שגיאת HTTP מלאה:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            headers: error.headers,
            error: error.error
          });

          this.isLoading = false;
          this.lastError = {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            error: error.error
          };

          let errorMessage = 'שגיאה לא ידועה';

          if (error.status === 0) {
            errorMessage = 'אין חיבור לשרת - בדוק שהשרת פועל';
          } else if (error.status === 400) {
            errorMessage = 'נתונים לא תקינים - בדוק את השדות';
          } else if (error.status === 500) {
            errorMessage = 'שגיאת שרת פנימית - בדוק את קובץ הלוג של השרת';
          }

          this.snackBar.open(
            `❌ ${errorMessage} (${error.status})`,
            'סגור',
            {
              duration: 10000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    } else {
      this.contactForm.markAllAsTouched();

      // מציג איזה שדות לא תקינים
      const invalidFields = Object.keys(this.contactForm.controls)
        .filter(key => this.contactForm.get(key)?.invalid)
        .join(', ');

      console.log('❌ שדות לא תקינים:', invalidFields);

      this.snackBar.open(
        `⚠️ שדות לא תקינים: ${invalidFields}`,
        'סגור',
        { duration: 6000 }
      );
    }
  }

  /**
   * איפוס הטופס
   */
  resetForm(): void {
    this.contactForm.reset();
    this.showSuccessMessage = false;
    this.successRequestId = null;
    this.lastError = null;

    this.contactForm.patchValue({
      priority: Priority.Medium
    });

    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.setErrors(null);
    });

    this.debugData = {};
    this.snackBar.open('📝 הטופס אופס', 'סגור', { duration: 2000 });
  }
}
