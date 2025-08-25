
import { Routes } from '@angular/router';
import { RequestsDashboardComponent } from './features/requests/pages/requests-dashboard/requests-dashboard.component';
import { MonthlyReportComponent } from './features/reports/components/monthly-report/monthly-report.component';

export const routes: Routes = [
  { path: '', redirectTo: '/requests', pathMatch: 'full' },
  { path: 'requests', component: RequestsDashboardComponent },
  { path: 'reports', component: MonthlyReportComponent },
  { path: '**', redirectTo: '/requests' }
];
