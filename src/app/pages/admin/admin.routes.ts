import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  {
    path: 'kpis',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'companies',
    redirectTo: 'dashboard', // O Dashboard é a lista de empresas
    pathMatch: 'full'
  },
  {
    path: 'companies/create',
    loadComponent: () => import('../company/company.page').then(m => m.CompanyPage)
  },
  {
    path: 'companies/details/:id',
    loadComponent: () => import('../company/company.page').then(m => m.CompanyPage)
  },
  {
    path: 'companies/edit/:id',
    loadComponent: () => import('../company/company.page').then(m => m.CompanyPage)
  },
  {
    path: 'services',
    loadComponent: () => import('./service/service.page').then(m => m.ServicesPage)
  },
  {
    path: 'services/create',
    loadComponent: () => import('./service/service.page').then(m => m.ServicesPage)
  },
  {
    path: 'companies/:id/dashboard',
    loadComponent: () => import('./company-dashboard/company-dashboard.page').then( m => m.CompanyDashboardPage)
  },
  {
    path: 'collaborators',
    loadComponent: () => import('./collaborators/collaborators.page').then(m => m.CollaboratorsPage)
  },
  {
    path: 'collaborators/create',
    loadComponent: () => import('../collaborator/collaborator.page').then(m => m.CollaboratorPage)
  },
  {
    path: 'collaborators/details/:id',
    loadComponent: () => import('../collaborator/collaborator.page').then(m => m.CollaboratorPage)
  },
  {
    path: 'collaborators/edit/:id',
    loadComponent: () => import('../collaborator/collaborator.page').then(m => m.CollaboratorPage)
  },
  {
    path: 'companies/:id/units',
    loadComponent: () => import('./unit/unit.page').then( m => m.UnitPage)
  },
  {
    path: 'companies/:id/units/create',
    loadComponent: () => import('./unit/unit.page').then( m => m.UnitPage)
  },
  {
    path: 'companies/:id/units/edit/:unitId',
    loadComponent: () => import('./unit/unit.page').then( m => m.UnitPage)
  }
];
