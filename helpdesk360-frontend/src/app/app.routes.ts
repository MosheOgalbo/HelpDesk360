import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/contact',
    pathMatch: 'full'
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/requests/{components}/equest-form/request-form.component')
      .then(m => m.RequestFormComponent)
  },
  {
    path: 'report',
    loadComponent: () => import('./pages/reports/{components}/monthly-report/monthly-report.component')
      .then(m => m.MonthlyReportComponent)
  },
  {
    path: '**',
    redirectTo: '/contact'
  }
];
