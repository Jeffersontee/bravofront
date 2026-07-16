import { Routes } from '@angular/router';

export const superAdminRoutes: Routes = [
  {
    path: 'super-dashboard',
    loadComponent: () => import('./super-dashboard/super-dashboard.page').then(m => m.SuperDashboardPage)
  },
  {
    path: '',
    redirectTo: 'super-dashboard',
    pathMatch: 'full'
  }
];
