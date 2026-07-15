import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'customer',
    loadComponent: () => import('./pages/customer/customer-layout/customer-layout.page').then(m => m.CustomerLayoutPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/customer/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/customer/orders/orders.page').then(m => m.OrdersPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/customer/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'service-request/:id',
        loadComponent: () => import('./pages/customer/service-request/service-request.page').then( m => m.ServiceRequestPage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'establishment-admin',
    loadComponent: () => import('./pages/admin/admin-layout/admin-layout.page').then(m => m.AdminLayoutPage),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard.page').then(m => m.DashboardPage)
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
        loadComponent: () => import('./pages/company/company.page').then(m => m.CompanyPage)
      },
      {
        path: 'companies/details/:id',
        loadComponent: () => import('./pages/company/company.page').then(m => m.CompanyPage)
      },
      {
        path: 'companies/edit/:id',
        loadComponent: () => import('./pages/company/company.page').then(m => m.CompanyPage)
      },
      {
        path: 'services',
        loadComponent: () => import('./pages/admin/services/services.page').then(m => m.ServicesPage)
      },
      {
        path: 'companies/:id/dashboard',
        loadComponent: () => import('./pages/admin/company-dashboard/company-dashboard.page').then( m => m.CompanyDashboardPage)
      }
    ]
  }
];

