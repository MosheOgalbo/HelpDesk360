import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/requests',
    pathMatch: 'full'
  },
  {
    path: 'requests',
    loadChildren: () => import('./features/requests/requests.routes').then(m => m.requestsRoutes)
  },
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.routes').then(m => m.reportsRoutes)
  },
  {
    path: '**',
    redirectTo: '/requests'
  }
];
