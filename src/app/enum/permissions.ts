export const AVAILABLE_PERMISSIONS = [
  { value: 'SUPER_DASHBOARD', label: 'Dashboard' },
  { value: 'SUPER_OPERATIONAL_PANEL', label: 'Operacional - Painel' },
  { value: 'SUPER_OPERATIONAL_ORDERS', label: 'Operacional - Lista' },
  { value: 'SUPER_OPERATIONAL_ORDERS_CREATE', label: 'Operacional - Cadastrar Ordem' },
  { value: 'SUPER_OPERATIONAL_AGENDA', label: 'Agenda 365' },
  { value: 'SUPER_COMPANIES_PANEL', label: 'Empresas - Painel' },
  { value: 'SUPER_COMPANIES', label: 'Empresas - Ver Empresas' },
  { value: 'SUPER_COMPANIES_CREATE', label: 'Empresas - Cadastrar Empresa' },
  { value: 'SUPER_SERVICES_PANEL', label: 'Catálogo - Painel' },
  { value: 'SUPER_SERVICES', label: 'Catálogo - Lista' },
  { value: 'SUPER_SERVICES_CREATE', label: 'Catálogo - Cadastrar Serviço' },
  { value: 'SUPER_COLLABORATORS_PANEL', label: 'Colaboradores - Painel' },
  { value: 'SUPER_COLLABORATORS_TEAMS', label: 'Colaboradores - Equipes' },
  { value: 'SUPER_COLLABORATORS', label: 'Colaboradores - Lista' },
  { value: 'SUPER_COLLABORATORS_CREATE', label: 'Colaboradores - Cadastrar' },
  { value: 'SUPER_STAFF_PANEL', label: 'Usuários Globais - Painel' },
  { value: 'SUPER_STAFF', label: 'Usuários Globais - Listar' },
  { value: 'SUPER_STAFF_CREATE', label: 'Usuários Globais - Cadastrar' },
  { value: 'ADMIN_SALES_TARGET', label: 'Configurações - Metas de Vendas' },
  { value: 'ADMIN_PAYMENT_GATEWAY', label: 'Plataforma - Gateway de Pagamento' },
  { value: 'ADMIN_GATEWAY_KEYS', label: 'Plataforma - Gateway Chave' },
  { value: 'ADMIN_PAYMENT_METHODS', label: 'Plataforma - Meios de Pagamento' },
  { value: 'ADMIN_APPEARANCE', label: 'Configurações - Aparência/Template' },
  { value: 'COMPANY_FINANCIAL_PANEL', label: 'Empresa - Financeiro' },
  { value: 'COMPANY_INTELLIGENCE_PANEL', label: 'Empresa - Inteligência' },
  { value: 'COMPANY_SETTINGS_PANEL', label: 'Empresa - Configurações' },
  { value: 'ADMIN_ACCOUNT', label: 'Meu Perfil' },
  { value: 'ADMIN_HELP', label: 'Ajuda' }
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  root: AVAILABLE_PERMISSIONS.map(p => p.value),
  owner: [
    'SUPER_DASHBOARD', 'SUPER_COMPANIES_PANEL', 'SUPER_SERVICES_PANEL',
    'SUPER_COLLABORATORS_PANEL', 'SUPER_OPERATIONAL_PANEL', 'SUPER_OPERATIONAL_ORDERS',
    'SUPER_OPERATIONAL_ORDERS_CREATE', 'SUPER_OPERATIONAL_AGENDA', 'COMPANY_FINANCIAL_PANEL',
    'COMPANY_INTELLIGENCE_PANEL', 'COMPANY_SETTINGS_PANEL', 'ADMIN_ACCOUNT', 'ADMIN_HELP'
  ],
  manager: [
    'SUPER_DASHBOARD', 'COMPANY_FINANCIAL_PANEL', 'COMPANY_INTELLIGENCE_PANEL',
    'SUPER_COMPANIES_PANEL', 'ADMIN_ACCOUNT', 'ADMIN_HELP'
  ],
  backoffice: [
    'SUPER_OPERATIONAL_PANEL', 'SUPER_OPERATIONAL_ORDERS',
    'SUPER_OPERATIONAL_ORDERS_CREATE', 'SUPER_OPERATIONAL_AGENDA',
    'ADMIN_ACCOUNT', 'ADMIN_HELP'
  ],
  supervisor: [
    'SUPER_OPERATIONAL_PANEL', 'SUPER_OPERATIONAL_ORDERS',
    'SUPER_OPERATIONAL_AGENDA', 'SUPER_COLLABORATORS_PANEL',
    'SUPER_COLLABORATORS_TEAMS', 'ADMIN_ACCOUNT', 'ADMIN_HELP'
  ],
  technician: [
    'SUPER_OPERATIONAL_ORDERS', 'SUPER_OPERATIONAL_AGENDA',
    'ADMIN_ACCOUNT', 'ADMIN_HELP'
  ],
  customer: [
    'ADMIN_ACCOUNT', 'ADMIN_HELP'
  ]
};

export const TECHNICIAN_SPECIALTIES = [
  'Elétrica',
  'Climatização / Refrigeração',
  'Hidráulica',
  'CFTV / Segurança Eletrônica',
  'Alvenaria / Reformas',
  'Geral / Manutenção'
];
