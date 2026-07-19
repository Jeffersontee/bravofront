import { Routes } from '@angular/router';

export const companyRoutes: Routes = [
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
    loadComponent: () => import('./company.page').then(m => m.CompanyPage)
  },
  {
    path: 'companies/details/:id',
    loadComponent: () => import('./company.page').then(m => m.CompanyPage)
  },
  {
    path: 'companies/edit/:id',
    loadComponent: () => import('./company.page').then(m => m.CompanyPage)
  },

  {
    path: 'companies/:id/dashboard',
    loadComponent: () => import('./company-dashboard/company-dashboard.page').then( m => m.CompanyDashboardPage)
  },

  {
    path: 'companies/:id/catalog',
    loadComponent: () => import('./catalog/catalog.page').then( m => m.CatalogPage)
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
