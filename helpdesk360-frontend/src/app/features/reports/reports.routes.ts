import { Routes } from '@angular/router';

export const reportsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./{components}/monthly-report.component').then(m => m.MonthlyReportComponent)
  }
];
