import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'contact',
    loadComponent: () => import('./features/requests/components/equest-form/request-form.component')
      .then(m => m.RequestFormComponent),
  },

  {
    path: 'report',
    loadComponent: () => {
      console.log('🔄 מתחיל לטעון MonthlyReportComponent');
      return import('./features/reports/components/monthly-report/monthly-report.component')
        .then(m => {
          console.log('✅ MonthlyReportComponent נטען בהצלחה:', m);
          return m.MonthlyReportComponent;
        })
        .catch(error => {
          console.error('❌ שגיאה בטעינת MonthlyReportComponent:', error);
          throw error;
        });
    }
  },

  {
    path: '',
    redirectTo: 'contact',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'contact'
  }
];
