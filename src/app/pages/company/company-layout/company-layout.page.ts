import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from 'src/app/services/company/company.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { ThemeService } from 'src/app/services/theme/theme.service';
import { RouterModule, RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonItem,
  IonIcon, IonList, IonApp, IonSplitPane, IonMenu, IonMenuToggle,
  IonLabel, IonButtons, IonButton, IonRouterOutlet, IonFooter 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gridOutline, restaurantOutline, receiptOutline, barChartOutline,
  settingsOutline, personCircleOutline, logOutOutline,
  chevronForwardOutline, menuOutline, albumsOutline,
  storefrontOutline, documentTextOutline, chevronDown,
  chevronForward, cardOutline, colorPaletteOutline, pricetagOutline,
  peopleOutline, speedometerOutline, trendingUpOutline, imagesOutline,
  cubeOutline, alertCircleOutline, repeatOutline, walletOutline,
  swapHorizontalOutline, homeOutline, businessOutline, analyticsOutline,
  starOutline, cashOutline, constructOutline, giftOutline,
  addCircleOutline, layersOutline, chatbubbleOutline,
  megaphoneOutline, helpCircleOutline, shieldCheckmarkOutline,
  documentsOutline, pieChartOutline, serverOutline, keyOutline,
  listOutline, personOutline, personAddOutline, briefcaseOutline, calendarOutline,
  calendarNumberOutline
} from 'ionicons/icons';
import { Strings } from 'src/app/enum/strings';

interface MenuItem {
  title: string;
  url?: string | null;
  icon: string;
  children?: MenuItem[];
  open?: boolean;
}

@Component({
  selector: 'app-company-layout',
  templateUrl: './company-layout.page.html',
  styleUrls: ['./company-layout.page.scss'],
  standalone: true,
  imports: [
    IonFooter, CommonModule, FormsModule, RouterLink, RouterOutlet,
    IonContent, IonHeader, IonTitle, IonToolbar, IonItem,
    IonIcon, IonList, IonApp, IonSplitPane, IonMenu, IonMenuToggle,
    IonLabel, IonButtons, IonButton, IonRouterOutlet
  ]
})
export class CompanyLayoutPage implements OnInit {
  public isCollapsed = false;
  public menuItems: MenuItem[] = [];

  private router = inject(Router);
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private themeService = inject(ThemeService);

  private readonly MENU_DATA: any[] = [
    {
      title: 'Dashboard',
      icon: 'speedometer-outline',
      permissionKey: 'SUPER_DASHBOARD',
      url: (companyId: string) => `/company/dashboard`
    },
    {
      title: 'Minha Empresa',
      icon: 'storefront-outline',
      permissionKey: 'SUPER_COMPANIES_PANEL',
      children: [
        { title: 'Painel da Empresa', icon: 'speedometer-outline', permissionKey: 'SUPER_COMPANIES_PANEL', url: (companyId: string) => `/company/painel` },
        { title: 'Dados da Empresa', icon: 'document-text-outline', permissionKey: 'SUPER_COMPANIES_PANEL', url: (companyId: string) => `/company/companies/edit/${companyId}` },
        { title: 'Unidades / Filiais', icon: 'business-outline', permissionKey: 'SUPER_COMPANIES_PANEL', url: (companyId: string) => `/company/companies/${companyId}/units` },
        { title: 'Catálogo de Serviços', icon: 'layers-outline', permissionKey: 'SUPER_SERVICES_PANEL', url: (companyId: string) => `/company/companies/${companyId}/catalog` }
      ]
    },
    {
      title: 'Colaborador',
      icon: 'person-outline',
      permissionKey: 'SUPER_COLLABORATORS_PANEL',
      children: [
        { title: 'Usuários', stringKey: 'ADMIN_STAFF', icon: 'people-outline', permissionKey: 'SUPER_STAFF' },
        { title: 'Cadastro de Colaborador', stringKey: 'ADMIN_STAFF_CREATE', icon: 'person-add-outline', permissionKey: 'SUPER_STAFF_CREATE'},
      ]
    },
    {
      title: 'Operacional',
      icon: 'receipt-outline',
      permissionKey: 'SUPER_OPERATIONAL_PANEL',
      children: [
        { title: 'Ordens de Serviço', icon: 'list-outline', permissionKey: 'SUPER_OPERATIONAL_ORDERS', url: (companyId: string) => `/company/orders` },
      ]
    },
    {
      title: 'Agenda 365', icon: 'calendar-number-outline', permissionKey: 'SUPER_OPERATIONAL_AGENDA', url: (companyId: string) => `/company/companies/${companyId}/agenda`,      
    },
    {
      title: 'Financeiro',
      icon: 'cash-outline',
      permissionKey: 'COMPANY_FINANCIAL_PANEL',
      children: [
        { title: 'Minhas Faturas', stringKey: 'ADMIN_INVOICES', icon: 'receipt-outline', permissionKey: 'COMPANY_FINANCIAL_PANEL' }, 
        { title: 'Contas', stringKey: 'ADMIN_FIADOS', icon: 'mail-outline', permissionKey: 'COMPANY_FINANCIAL_PANEL' },
        { title: 'Fiados (Conta Corrente)', stringKey: 'ADMIN_FIADOS', icon: 'folder-open-outline', permissionKey: 'COMPANY_FINANCIAL_PANEL' },
        { title: 'Pagamentos', stringKey: 'ADMIN_PAYMENTS', icon: 'wallet-outline', permissionKey: 'COMPANY_FINANCIAL_PANEL'},
        { title: 'Assinaturas', stringKey: 'ADMIN_SUBSCRIPTIONS', icon: 'repeat-outline', permissionKey: 'COMPANY_FINANCIAL_PANEL' },
      ]
    },
    { 
      title: 'Inteligência', 
      icon: 'analytics-outline',
      permissionKey: 'COMPANY_INTELLIGENCE_PANEL',
      children: [
        { title: 'Relatórios Consolidados', stringKey: 'ADMIN_REPORTS', icon: 'pie-chart-outline', permissionKey: 'COMPANY_INTELLIGENCE_PANEL' },
        { title: 'Logs de Auditoria', stringKey: 'ADMIN_AUDIT', icon: 'shield-checkmark-outline', permissionKey: 'COMPANY_INTELLIGENCE_PANEL' },
      ]
    },
    {
      title: 'Configurações',
      icon: 'settings-outline',
      permissionKey: 'COMPANY_SETTINGS_PANEL',
      children: [
        { 
          title: 'Gerais', 
          icon: 'settings-outline',
          permissionKey: 'COMPANY_SETTINGS_PANEL',
          children: [
            { title: 'Metas de Vendas', stringKey: 'ADMIN_SALES_TARGET', icon: 'swap-horizontal-outline', permissionKey: 'ADMIN_SALES_TARGET' },
          ] 
        },
        { 
          title: 'Plataforma de Pagamento', 
          icon: 'construct-outline',
          permissionKey: 'ADMIN_PAYMENT_GATEWAY',
          children: [
            { title: 'Gateway de Pagamento', stringKey: 'ADMIN_PAYMENT_GATEWAY', icon: 'server-outline', permissionKey: 'ADMIN_PAYMENT_GATEWAY' },
            { title: 'Gateway Chave', stringKey: 'ADMIN_GATEWAY_KEYS', icon: 'key-outline', permissionKey: 'ADMIN_GATEWAY_KEYS' },
            { title: 'Meios de Pagamento', stringKey: 'ADMIN_PAYMENT_METHODS', icon: 'card-outline', permissionKey: 'ADMIN_PAYMENT_METHODS' }
          ]
        },
        { title: 'Aparência/Template', stringKey: 'ADMIN_APPEARANCE', icon: 'color-palette-outline', url: (companyId: string) => '/company/settings/appearance', permissionKey: 'ADMIN_APPEARANCE' },
      ]
    },
    { 
      title: 'Meu Perfil', stringKey: 'ADMIN_ACCOUNT', icon: 'person-circle-outline', url: (companyId: string) => '/company/my-profile', permissionKey: 'ADMIN_ACCOUNT'
    },
    { 
      title: 'Ajuda', 
      stringKey: 'ADMIN_HELP',
      icon: 'help-circle-outline',
      url: (companyId: string) => '/company/help',
      permissionKey: 'ADMIN_HELP'
    },
  ];

  constructor() {
    addIcons({
      gridOutline, restaurantOutline, receiptOutline, barChartOutline,
      settingsOutline, personCircleOutline, logOutOutline, calendarNumberOutline,
      chevronForwardOutline, menuOutline, albumsOutline,
      storefrontOutline, documentTextOutline, chevronDown,
      chevronForward, cardOutline, colorPaletteOutline, pricetagOutline,
      peopleOutline, speedometerOutline, trendingUpOutline, imagesOutline,
      cubeOutline, alertCircleOutline, repeatOutline, walletOutline,
      swapHorizontalOutline, homeOutline, businessOutline, analyticsOutline,
      starOutline, cashOutline, constructOutline, giftOutline,
      addCircleOutline, layersOutline, chatbubbleOutline, personAddOutline,
      megaphoneOutline, helpCircleOutline, shieldCheckmarkOutline,
      documentsOutline, pieChartOutline, serverOutline, keyOutline,
      listOutline, personOutline, briefcaseOutline, calendarOutline
    });
  }

  async ngOnInit() {
    try {
      const user = await this.profileService.getProfile();
      if (user) {
        const companyId = user.company_id || '';
        const userPermissions = user.permissions || [];
        
        // Carrega as configurações de aparência da empresa específica
        this.themeService.loadAppearance('COMPANY', companyId);

        // Reconstrói o menu dinâmico com o company_id do lojista
        this.menuItems = this.buildMenuWithCompany(this.MENU_DATA, companyId, userPermissions);
        
        this.router.events.pipe(
          filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
          this.checkRouteForMenuCollapse(event.urlAfterRedirects || event.url);
        });

        this.checkRouteForMenuCollapse(this.router.url);

        // Redirecionamento preventivo se o lojista cair nas rotas raiz ou genéricas
        if (this.router.url === '/company' || this.router.url === '/company/dashboard') {
          const firstAvailableUrl = this.getFirstAvailableUrl(this.menuItems);
          if (firstAvailableUrl) {
            this.router.navigate([firstAvailableUrl], { replaceUrl: true });
          } else {
            // Fallback se não tiver nenhum menu (evita tela branca)
            this.router.navigate([`/company/companies/${companyId}/dashboard`], { replaceUrl: true });
          }
        }
      }
    } catch (err) {
      console.error('Erro ao inicializar menu do lojista:', err);
    }
  }

  private checkRouteForMenuCollapse(url: string) {
    const isDesktop = window.innerWidth >= 992;
    if (isDesktop && url.includes('/companies/') && url.includes('/dashboard')) {
      this.isCollapsed = true;
    } else {
      this.isCollapsed = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkRouteForMenuCollapse(this.router.url);
  }

  private getFirstAvailableUrl(menuItems: MenuItem[]): string | null {
    for (const item of menuItems) {
      if (item.url) {
        // Evitamos redirecionar para links de logout/ajuda direto se houverem outros operacionais
        if (!item.url.includes('logout') && !item.url.includes('help')) {
          return item.url;
        }
      }
      if (item.children && item.children.length > 0) {
        const childUrl = this.getFirstAvailableUrl(item.children);
        if (childUrl) {
          return childUrl;
        }
      }
    }
    // Se só sobrar itens que pulamos acima (como Ajuda), pega o primeiro possível
    const fallbackItem = menuItems.find(i => i.url);
    return fallbackItem ? fallbackItem.url || null : null;
  }

  private buildMenuWithCompany(configList: any[], companyId: string, userPermissions: string[]): MenuItem[] {
    const items: MenuItem[] = [];

    for (const config of configList) {
      if (config.permissionKey && !userPermissions.includes(config.permissionKey)) {
        // Exceções de menus essenciais que nunca somem
        if (config.permissionKey !== 'ADMIN_ACCOUNT' && config.permissionKey !== 'ADMIN_HELP') {
          continue;
        }
      }

      let resolvedUrl: string | null = null;
      if (config.url) {
        resolvedUrl = config.url(companyId);
      } else if (config.stringKey && (Strings as any)[config.stringKey]) {
        resolvedUrl = (Strings as any)[config.stringKey];
      }

      const item: MenuItem = {
        title: config.title,
        icon: config.icon,
        url: resolvedUrl,
        open: false
      };

      if (config.children && config.children.length > 0) {
        item.children = this.buildMenuWithCompany(config.children, companyId, userPermissions);
        // Se o menu pai precisava de filhos e todos foram bloqueados, esconde o pai
        if (item.children.length === 0 && !item.url) {
          continue;
        }
      }

      items.push(item);
    }
    
    return items;
  }

  public toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  public onLogout() {
    this.authService.logoutUser(true);
  }
}
