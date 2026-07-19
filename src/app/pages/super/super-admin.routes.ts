import { Routes } from '@angular/router';

export const superAdminRoutes: Routes = [
  {
    path: 'super-dashboard',
    loadComponent: () => import('./super-dashboard/super-dashboard.page').then(m => m.SuperDashboardPage)
  },
  {
    path: 'services/panel',
    loadComponent: () => import('./services/service-panel/service-panel.component').then(m => m.ServicePanelComponent)
  },
  {
    path: 'services',
    loadComponent: () => import('./services/service.page').then(m => m.ServicesPage)
  },
  {
    path: 'services/create',
    loadComponent: () => import('./services/service-form-page/service-form-page.component').then(m => m.ServiceFormPageComponent)
  },
  {
    path: 'services/edit/:id',
    loadComponent: () => import('./services/service-form-page/service-form-page.component').then(m => m.ServiceFormPageComponent)
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
    path: 'companies/panel',
    loadComponent: () => import('./companies/company-panel/company-panel.component').then(m => m.CompanyPanelComponent)
  },
  {
    path: 'companies/edit/:id',
    loadComponent: () => import('./companies/company-form/company-form.component').then(m => m.CompanyFormComponent)
  },
  {
    path: 'companies/:id/dashboard',
    loadComponent: () => import('../company/company-dashboard/company-dashboard.page').then(m => m.CompanyDashboardPage)
  },
  
  // --- Colaboradores ---
  {
    path: 'collaborators/panel',
    loadComponent: () => import('./collaborators/collaborator-panel/collaborator-panel.component').then(m => m.CollaboratorPanelComponent)
  },
  {
    path: 'collaborators/teams',
    loadComponent: () => import('./collaborators/collaborator-teams/collaborator-teams.component').then(m => m.CollaboratorTeamsComponent)
  },
  {
    path: 'collaborators',
    loadComponent: () => import('./collaborators/collaborator-list-page/collaborator-list-page.component').then(m => m.CollaboratorListPageComponent)
  },
  {
    path: 'collaborators/create',
    loadComponent: () => import('./collaborators/collaborator-form-page/collaborator-form-page.component').then(m => m.CollaboratorFormPageComponent)
  },
  {
    path: 'collaborators/edit/:id',
    loadComponent: () => import('./collaborators/collaborator-form-page/collaborator-form-page.component').then(m => m.CollaboratorFormPageComponent)
  },

  // --- Usuários Globais (Staff) ---
  {
    path: 'staff/panel',
    loadComponent: () => import('./staff/staff-panel/staff-panel.component').then(m => m.StaffPanelComponent)
  },
  {
    path: 'staff',
    loadComponent: () => import('./staff/staff-list-page/staff-list-page.component').then(m => m.StaffListPageComponent)
  },
  {
    path: 'staff/create',
    loadComponent: () => import('./staff/staff-form-page/staff-form-page.component').then(m => m.StaffFormPageComponent)
  },
  {
    path: 'staff/edit/:id',
    loadComponent: () => import('./staff/staff-form-page/staff-form-page.component').then(m => m.StaffFormPageComponent)
  },

  // --- Operacional ---
  {
    path: 'operational/panel',
    loadComponent: () => import('./operational/operational-panel/operational-panel.component').then(m => m.OperationalPanelComponent)
  },
  {
    path: 'operational/orders',
    loadComponent: () => import('./operational/order-list-page/order-list-page.component').then(m => m.OrderListPageComponent)
  },
  {
    path: 'operational/orders/create',
    loadComponent: () => import('./operational/service-order-form-page/service-order-form-page.component').then(m => m.ServiceOrderFormPageComponent)
  },
  {
    path: 'operational/orders/edit/:id',
    loadComponent: () => import('./operational/service-order-form-page/service-order-form-page.component').then(m => m.ServiceOrderFormPageComponent)
  },

  {
    path: '',
    redirectTo: 'super-dashboard',
    pathMatch: 'full'
  }
];
