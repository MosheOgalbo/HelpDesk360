import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { ContactRequest, Priority, Department } from '../../../../core/models/contact.model';

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
  templateUrl: './request-form.component.html',
  styleUrl: './request-form.component.css',
})
export class RequestFormComponent implements OnInit, OnDestroy {
  // Subject לניהול subscriptions
  private destroy$ = new Subject<void>();

  contactForm!: FormGroup;
  isLoading = false;
  showSuccessMessage = false;
  successRequestId: number | null = null;
  debugMode = false;
  debugData: any = {};
  lastError: any = null;

  // משתנים לשמירת IDs של timeouts
  private resetTimeoutId?: number;
  private successTimeoutId?: number;

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
  ) { }

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

    // עדכון דיבאג בזמן אמת - עם takeUntil
    this.contactForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
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
   * בדיקת חיבור לשרת באמצעות API Service
   */
  testConnection(): void {
    this.isLoading = true;

    console.log('🔌 בודק חיבור לשרת באמצעות getAllRequests...');

    this.apiService.getAllRequests()
      .pipe(takeUntil(this.destroy$)) // הוספת takeUntil
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('✅ החיבור לשרת תקין! קיבלנו', response.length, 'פניות');

          this.snackBar.open(
            `✅ החיבור לשרת תקין! נמצאו ${response.length} פניות במערכת`,
            'סגור',
            {
              duration: 4000,
              panelClass: ['success-snackbar']
            }
          );
        },
        error: (error) => {
          this.isLoading = false;
          this.handleConnectionError(error);
        }
      });
  }

  /**
   * טיפול בשגיאות חיבור
   */
  private handleConnectionError(error: any): void {
    console.error('❌ שגיאת חיבור:', error);

    let errorMessage = 'שגיאה לא ידועה';

    if (error.status === 0) {
      errorMessage = 'אין חיבור לשרת - בדוק שהשרת פועל';
    } else if (error.status === 404) {
      errorMessage = 'נתיב API לא נמצא - בדוק את כתובת השרת';
    } else if (error.status === 500) {
      errorMessage = 'שגיאת שרת פנימית';
    } else {
      errorMessage = `שגיאת שרת: ${error.status} - ${error.statusText}`;
    }

    this.snackBar.open(
      `❌ ${errorMessage}`,
      'סגור',
      {
        duration: 6000,
        panelClass: ['error-snackbar']
      }
    );
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
      this.debugData = formData;

      this.apiService.submitContact(formData)
        .pipe(takeUntil(this.destroy$)) // הוספת takeUntil
        .subscribe({
          next: (response) => {
            this.handleSubmitSuccess(response);
          },
          error: (error) => {
            this.handleSubmitError(error);
          }
        });
    } else {
      this.handleFormInvalid();
    }
  }

  /**
   * טיפול בהצלחת שליחה
   */
  private handleSubmitSuccess(response: any): void {
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

    // שמירת timeout ID לביטול מאוחר יותר
    this.successTimeoutId = window.setTimeout(() => {
      this.resetForm();
      this.showSuccessMessage = false;
      this.successRequestId = null;
    }, 5000);
  }

  /**
   * טיפול בשגיאת שליחה
   */
  private handleSubmitError(error: any): void {
    console.error('❌ שגיאה מפורטת:', error);

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

  /**
   * טיפול בטופס לא תקין
   */
  private handleFormInvalid(): void {
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

  /**
   * ניקוי משאבים לפני השמדת הקומפוננטה
   */
  ngOnDestroy(): void {
    console.clear();
    console.log('RequestFormComponent destroyed');

    // ביטול כל ה-subscriptions
    this.destroy$.next();
    this.destroy$.complete();

    // ביטול timeouts אם קיימים
    if (this.successTimeoutId) {
      clearTimeout(this.successTimeoutId);
    }

    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }
}
