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
    path: 'companies',
    loadComponent: () => import('./companies/companies-list/companies-list.component').then(m => m.CompaniesListComponent)
  },
  {
    path: 'companies/create',
    loadComponent: () => import('./companies/company-form/company-form.component').then(m => m.CompanyFormComponent)
  },
  {
    path: 'companies/edit/:id',
    loadComponent: () => import('./companies/company-form/company-form.component').then(m => m.CompanyFormComponent)
  },
  {
    path: '',
    redirectTo: 'super-dashboard',
    pathMatch: 'full'
  }
];
