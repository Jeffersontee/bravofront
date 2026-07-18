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
        loadComponent: () => import('./pages/service-orders/service-orders.page').then(m => m.ServiceOrdersPage)
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
    path: 'company',
    loadComponent: () => import('./pages/company/company-layout/company-layout.page').then(m => m.CompanyLayoutPage),
    loadChildren: () => import('./pages/company/company.routes').then(m => m.companyRoutes)
  },
  {
    path: 'super-admin',
    loadComponent: () => import('./pages/super/super-layout/super-layout.page').then(m => m.SuperLayoutPage),
    loadChildren: () => import('./pages/super/super-admin.routes').then(m => m.superAdminRoutes)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/login/signup/signup.page').then( m => m.SignupPage)
  },
  {
    path: 'service-orders',
    loadComponent: () => import('./pages/service-orders/service-orders.page').then( m => m.ServiceOrdersPage)
  },
  {
    path: 'service-orders/details/:id',
    loadComponent: () => import('./pages/service-orders/details/service-order-details/service-order-details.page').then( m => m.ServiceOrderDetailsPage)
  }
];

