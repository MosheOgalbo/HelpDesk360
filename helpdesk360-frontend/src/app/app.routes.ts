import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/contact',
    pathMatch: 'full'
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/requests/{components}/request-form.component')
      .then(m => m.RequestFormComponent)
  },
  {
    path: 'report',
    loadComponent: () => import('./features/reports/{components}/monthly-report.component')
      .then(m => m.MonthlyReportComponent)
  },
  {
    path: '**',
    redirectTo: '/contact'
  }
];
