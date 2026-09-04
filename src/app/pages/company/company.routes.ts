import { Routes } from '@angular/router';

export const companyRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./company-dashboard/company-dashboard.page').then(m => m.CompanyDashboardPage)
  },
  {
    path: 'painel',
    loadComponent: () => import('./company-dashboard/company-dashboard.page').then(m => m.CompanyDashboardPage)
  },
  {
    path: 'admin-dashboard',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'kpis',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'orders',
    loadComponent: () => import('../service-orders/service-orders.page').then(m => m.ServiceOrdersPage)
  },
  {
    path: 'orders/details/:id',
    loadComponent: () => import('../service-orders/service-order-details/service-order-details.page').then(m => m.ServiceOrderDetailsPage)
  },
  {
    path: 'companies',
    redirectTo: 'dashboard',
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
    path: 'companies/:id/painel',
    loadComponent: () => import('./company-dashboard/company-dashboard.page').then(m => m.CompanyDashboardPage)
  },
  {
    path: 'companies/:id/dashboard',
    loadComponent: () => import('./company-dashboard/company-dashboard.page').then(m => m.CompanyDashboardPage)
  },
  {
    path: 'companies/:id/agenda',
    loadComponent: () => import('../agenda/agenda.page').then(m => m.AgendaPage)
  },

  {
    path: 'companies/:id/catalog',
    loadComponent: () => import('./catalog/catalog.page').then(m => m.CatalogPage)
  },
  {
    path: 'companies/:id/units',
    loadComponent: () => import('./unit/unit.page').then(m => m.UnitPage)
  },
  {
    path: 'companies/:id/units/create',
    loadComponent: () => import('./unit/unit.page').then(m => m.UnitPage)
  },
  {
    path: 'companies/:id/units/edit/:unitId',
    loadComponent: () => import('./unit/unit.page').then(m => m.UnitPage)
  },
  {
    path: 'help',
    loadComponent: () => import('../help/help.page').then(m => m.HelpPage)
  },
  {
    path: 'settings/appearance',
    loadComponent: () => import('../manage-settings/appearance/appearance.page').then(m => m.AppearancePage)
  },
  {
    path: 'profile',
    loadComponent: () => import('../account/account.page').then(m => m.AccountPage)
  },
  {
    path: 'financial/subscriptions',
    loadComponent: () => import('./subscriptions/subscriptions.page').then(m => m.SubscriptionsPage)
  },
  {
    path: 'financial/invoices',
    loadComponent: () => import('../payments/payments.page').then(m => m.PaymentsPage)
  },
  {
    path: 'financial/payments',
    redirectTo: 'financial/invoices',
    pathMatch: 'full'
  },
  {
    path: 'invoices',
    redirectTo: 'financial/invoices',
    pathMatch: 'full'
  },
  {
    path: 'payments',
    redirectTo: 'financial/invoices',
    pathMatch: 'full'
  },
  {
    path: 'subscriptions',
    redirectTo: 'financial/subscriptions',
    pathMatch: 'full'
  },
  {
    path: 'staff',
    loadComponent: () => import('../super/staff/staff-list-page/staff-list-page.component').then(m => m.StaffListPageComponent)
  },
  {
    path: 'staff/create',
    loadComponent: () => import('../super/staff/staff-form-page/staff-form-page.component').then(m => m.StaffFormPageComponent)
  },
  {
    path: 'staff/edit/:id',
    loadComponent: () => import('../super/staff/staff-form-page/staff-form-page.component').then(m => m.StaffFormPageComponent)
  },
  {
    path: 'collaborators',
    redirectTo: 'staff',
    pathMatch: 'full'
  },
  {
    path: 'collaborators/create',
    redirectTo: 'staff/create',
    pathMatch: 'full'
  },
  {
    path: 'collaborators/edit/:id',
    redirectTo: 'staff/edit/:id',
    pathMatch: 'full'
  },
  {
    path: 'my-profile',
    redirectTo: 'profile',
    pathMatch: 'full'
  }
];
