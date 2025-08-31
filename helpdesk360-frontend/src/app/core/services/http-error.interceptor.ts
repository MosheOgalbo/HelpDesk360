import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, retry, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    retry({
      count: 2,
      delay: 1000,
      resetOnSuccess: true
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'שגיאה לא צפויה';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `שגיאת רשת: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = 'בקשה לא תקינה';
            break;
          case 404:
            errorMessage = 'המשאב לא נמצא';
            break;
          case 500:
            errorMessage = 'שגיאת שרת פנימית';
            break;
          default:
            errorMessage = `שגיאה: ${error.status}`;
        }
      }

      snackBar.open(errorMessage, 'סגור', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });

      return throwError(() => error);
    })
  );
};
