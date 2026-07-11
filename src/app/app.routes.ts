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
      }
    ]
  }
];
