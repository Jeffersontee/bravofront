export enum Strings {
  // Configs Globais
  APP_NAME = 'Bravo Instalações',
  TABS = '/tabs',
  HOME = '/home',
  LOGIN = '/login',
  PROFILE = '/profile',
  ADMIN = '/establishment-admin', // Base para o admin lojista

  // Super_admin
  SUPER_ADMIN = '/super-admin',
    SUPER_DASHBOARD = '/super-admin/super-dashboard', // Dashboard específico do Super Admin

    SUPER_STAFF = '/super-admin/staff',
    SUPER_STAFF_CREATE = '/super-admin/staff/create',
    SUPER_STAFF_EDIT = '/super-admin/staff/edit',
    STAFF_TYPE = 'staff',
    SUPER_STAFF_TYPE = 'super_staff',


  // Tipos de Usuário / Roles
  SUPER_TYPE = 'super_admin',
  ADMIN_TYPE = 'admin',
  USER_TYPE = 'user',
  COLLABORATOR_TYPE = 'collaborator',



  // Rotas Frontend
  ADMIN_DASHBOARD = 'establishment-admin/dashboard',
  ADMIN_SALES = 'establishment-admin/sales',
  ADMIN_CUSTOMERS = 'establishment-admin/customers',
  ADMIN_KPI = 'establishment-admin/kpis',
  ADMIN_ORDER = 'establishment-admin/orders',
  ADMIN_MENU = 'establishment-admin/menu',
  ADMIN_BANNERS = 'establishment-admin/banners',
  ADMIN_STOCK = 'establishment-admin/stock',
  ADMIN_ESTABLISHMENTS = 'establishment-admin/details',
  ADMIN_PRODUCTS = 'establishment-admin/products',
  ADMIN_PRODUCTS_CREATE = 'establishment-admin/products/create',
  ADMIN_CATEGORIES = 'establishment-admin/categories',
  ADMIN_COMPANIES = 'establishment-admin/dashboard',
  ADMIN_SERVICES = 'establishment-admin/services',

  ADMIN_LIST_COLLABORATOR = 'establishment-admin/collaborators',
  ADMIN_CREATE_COLLABORATOR = 'establishment-admin/collaborators/create',

  ADMIN_LIST_SERVICES = 'establishment-admin/services',
  ADMIN_CREATE_SERVICES = 'establishment-admin/services/create',

  ADMIN_LIST_COMPANY = 'establishment-admin/companies', 
  ADMIN_CREATE_COMPANY = 'establishment-admin/companies/create',
  ADMIN_DETAILS_COMPANY = 'establishment-admin/companies/details',
  ADMIN_LIST_UNITS = 'establishment-admin/companies/units',

  ADMIN_CREATE_STAFF = 'establishment-admin/staff/create',
  ADMIN_LIST_STAFF = 'establishment-admin/staff',

  // Strings de Conexão Backend APIs
  API_COMPANIES = 'companies',
  API_SERVICES = 'services',
  API_UNITS = 'units',
  API_SERVICE_ORDERS = 'service-orders',
  API_HEALTH = 'health',

  // TOKENS
  TOKEN = 'hub_token',
  REFRESH_TOKEN = 'hub_refresh_token',

  // SESSION USER 
  USER_PROFILE = '/users/profile',
  USER_LOCATION = 'user_location',
  USER_DATA = 'user_data',
  USER_SOUND = 'isSoundEnabled',

}
export default Strings;
