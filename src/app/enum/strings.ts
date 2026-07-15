export enum Strings {
  // Configs Globais
  APP_NAME = 'Bravo Instalações',

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

  ADMIN_LIST_COLLABORATOR = '',
  ADMIN_CREATE_COLLABORATOR = '',

  ADMIN_LIST_SERVICES = '',
  ADMIN_CREATE_SERVICES = '',

  ADMIN_LIST_COMPANY = '', 
  ADMIN_CREATE_COMPANY = '',
  ADMIN_DETAILS_COMPANY = '',

  ADMIN_CREATE_STAFF = '',
  ADMIN_LIST_STAFF = '',

  // Strings de Conexão Backend APIs
  API_COMPANIES = 'api/companies',
  API_SERVICES = 'api/services',
  API_HEALTH = '/health'
}
export default Strings;
