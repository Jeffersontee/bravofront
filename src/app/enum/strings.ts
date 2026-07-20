export enum Strings {
  // Configs Globais
  APP_NAME = 'Bravo Instalações',
  TABS = '/customer',
  HOME = '/home',
  LOGIN = '/login',
  SIGNUP = '/signup',
  PROFILE = '/profile',
  ADMIN = '/company', // Base para o admin lojista

  // Super_admin
  SUPER_ADMIN = '/super-admin',
  SUPER_DASHBOARD = '/super-admin/super-dashboard', // Dashboard específico do Super Admin

  SUPER_STAFF = '/super-admin/staff',
  SUPER_STAFF_CREATE = '/super-admin/staff/create',
  SUPER_OPERATIONAL_PANEL = '/super-admin/operational/panel',
  SUPER_OPERATIONAL_ORDERS = '/super-admin/operational/orders',
  SUPER_OPERATIONAL_ORDERS_CREATE = '/super-admin/operational/orders/create',
  SUPER_OPERATIONAL_ORDERS_EDIT = '/super-admin/operational/orders/edit',
  SUPER_STAFF_EDIT = '/super-admin/staff/edit',
  SUPER_STAFF_PANEL = '/super-admin/staff/panel',
  SUPER_SERVICES = '/super-admin/services',
  SUPER_SERVICES_CREATE = '/super-admin/services/create',
  SUPER_SERVICES_PANEL = '/super-admin/services/panel',
  SUPER_COMPANIES = '/super-admin/companies',
  SUPER_COMPANIES_CREATE = '/super-admin/companies/create',
  SUPER_COMPANIES_PANEL = '/super-admin/companies/panel',
  SUPER_COLLABORATORS = '/super-admin/collaborators',
  SUPER_COLLABORATORS_CREATE = '/super-admin/collaborators/create',
  SUPER_COLLABORATORS_PANEL = '/super-admin/collaborators/panel',
  SUPER_COLLABORATORS_TEAMS = '/super-admin/collaborators/teams',
  STAFF_TYPE = 'staff',
  SUPER_STAFF_TYPE = 'super_staff',


  // Tipos de Usuário / Roles
  SUPER_TYPE = 'super_admin',
  ADMIN_TYPE = 'admin',
  COMPANY_OWNER_TYPE = 'company_owner',
  USER_TYPE = 'user',
  COLLABORATOR_TYPE = 'collaborator',

  // Admin
  ADMIN_SALES_TARGET = '',
  ADMIN_PAYMENT_GATEWAY = '',
  ADMIN_GATEWAY_KEYS = '',
  ADMIN_PAYMENT_METHODS = '',
  ADMIN_APPEARANCE = '',
  ADMIN_ACCOUNT = '',
  ADMIN_HELP = '',




  // Rotas Frontend
  COMPANY_DASHBOARD = 'company/dashboard',
  COMPANY_SALES = 'company/sales',
  COMPANY_CUSTOMERS = 'company/customers',
  COMPANY_KPI = 'company/kpis',
  COMPANY_ORDER = 'company/orders',
  COMPANY_MENU = 'company/menu',
  COMPANY_BANNERS = 'company/banners',
  COMPANY_STOCK = 'company/stock',
  COMPANY_ESTABLISHMENTS = 'company/details',
  COMPANY_PRODUCTS = 'company/products',
  COMPANY_PRODUCTS_CREATE = 'company/products/create',
  COMPANY_CATEGORIES = 'company/categories',
  COMPANY_COMPANIES = 'company/dashboard',
  COMPANY_SERVICES = 'company/services',

  COMPANY_LIST_COLLABORATOR = 'company/collaborators',
  COMPANY_CREATE_COLLABORATOR = 'company/collaborators/create',

  COMPANY_LIST_SERVICES = 'company/services',
  COMPANY_CREATE_SERVICES = 'company/services/create',

  COMPANY_LIST_COMPANY = 'company/companies', 
  COMPANY_CREATE_COMPANY = 'company/companies/create',
  COMPANY_DETAILS_COMPANY = 'company/companies/details',
  COMPANY_LIST_UNITS = 'company/companies/units',

  COMPANY_CREATE_STAFF = 'company/staff/create',
  COMPANY_LIST_STAFF = 'company/staff',

  // Service Orders Global
  SERVICE_ORDERS = 'service-orders',
  SERVICE_ORDERS_DETAILS = 'service-orders/details',

  // Strings de Conexão Backend APIs
  API_COMPANIES = 'companies',
  API_SERVICES = 'services',
  API_UNITS = 'units',
  API_SERVICE_ORDERS = 'service-orders',
  API_HEALTH = 'health',
  API_DASHBOARD = 'dashboard',

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
