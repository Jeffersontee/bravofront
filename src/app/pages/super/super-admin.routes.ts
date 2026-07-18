import { Routes } from '@angular/router';

export const superAdminRoutes: Routes = [
  {
    path: 'super-dashboard',
    loadComponent: () => import('./super-dashboard/super-dashboard.page').then(m => m.SuperDashboardPage)
  },
  {
    path: 'services',
    loadComponent: () => import('./services/service.page').then(m => m.ServicesPage)
  },
  {
    path: 'services/create',
    loadComponent: () => import('./services/service.page').then(m => m.ServicesPage)
  },
  {
    path: '',
    redirectTo: 'super-dashboard',
    pathMatch: 'full'
  }
];
