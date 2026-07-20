import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';
import { authGuard } from './guards/auth.guard';
import { Strings } from './enum/strings';

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
    canMatch: [roleGuard],
    data: { role: Strings.USER_TYPE },
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
    canMatch: [roleGuard],
    data: { role: Strings.COMPANY_OWNER_TYPE },
    loadComponent: () => import('./pages/company/company-layout/company-layout.page').then(m => m.CompanyLayoutPage),
    loadChildren: () => import('./pages/company/company.routes').then(m => m.companyRoutes)
  },
  {
    path: 'super-admin',
    canMatch: [roleGuard],
    data: { role: Strings.SUPER_TYPE },
    loadComponent: () => import('./pages/super/super-layout/super-layout.page').then(m => m.SuperLayoutPage),
    loadChildren: () => import('./pages/super/super-admin.routes').then(m => m.superAdminRoutes)
  },
  {
    path: 'collaborator',
    canMatch: [roleGuard],
    data: { role: Strings.COLLABORATOR_TYPE },
    loadComponent: () => import('./pages/collaborator/collaborator-layout/collaborator-layout.page').then(m => m.CollaboratorLayoutPage),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/collaborator/dashboard/collaborator-dashboard.page').then(m => m.CollaboratorDashboardPage)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/service-orders/service-orders.page').then(m => m.ServiceOrdersPage)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/login/signup/signup.page').then( m => m.SignupPage)
  },
  {
    path: 'service-orders',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/service-orders/service-orders.page').then( m => m.ServiceOrdersPage)
  },
  {
    path: 'service-orders/details/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/service-orders/service-order-details/service-order-details.page').then( m => m.ServiceOrderDetailsPage)
  }
];

