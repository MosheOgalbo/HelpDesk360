const componentsDir = 'components';

import { Routes } from '@angular/router';

export const requestsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import(`./${componentsDir}/requests-list.component`).then(m => m.RequestsListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import(`./${componentsDir}/request-form.component`).then(m => m.RequestFormComponent)
  }
];
