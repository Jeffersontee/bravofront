import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonItem,
  IonIcon, IonList, IonApp, IonSplitPane, IonMenu, IonMenuToggle,
  IonLabel, IonButtons, IonButton, IonRouterOutlet, IonFooter } from '@ionic/angular/standalone';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import {
  homeOutline, logOutOutline, speedometerOutline, trendingUpOutline,
  peopleOutline, listOutline, personAddOutline, chevronForward, chevronDown,
  menuOutline, chevronForwardOutline, constructOutline, briefcaseOutline, addCircleOutline,
  businessOutline, receiptOutline, gridOutline, settingsOutline,
  colorPaletteOutline, calendarOutline,
  calendarNumberOutline, personCircleOutline, helpCircleOutline,
  serverOutline, keyOutline, cardOutline, swapHorizontalOutline,
  documentTextOutline, walletOutline, cashOutline, peopleCircleOutline
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { ThemeService } from '../../../services/theme/theme.service';
import { Strings } from 'src/app/enum/strings';

interface MenuItem {
  title: string;
  url?: string | null;
  queryParams?: any;
  icon: string;
  children?: MenuItem[];
  open?: boolean;
}

interface MenuConfig {
  title: string;
  stringKey?: keyof typeof Strings;
  icon: string;
  url?: string;
  queryParams?: any;
  permissionKey?: string;
  children?: MenuConfig[];
}

@Component({
  selector: 'app-super-layout',
  templateUrl: './super-layout.page.html',
  styleUrls: ['./super-layout.page.scss'],
  standalone: true,
  imports: [IonFooter, 
    CommonModule, FormsModule, RouterLink, RouterLinkActive,
    IonContent, IonHeader, IonTitle, IonToolbar, IonItem,
    IonIcon, IonList, IonApp, IonSplitPane, IonMenu, IonMenuToggle,
    IonLabel, IonButtons, IonButton, IonRouterOutlet
  ]
})
export class SuperLayoutPage implements OnInit {
  public isCollapsed = false;
  public menuItems: MenuItem[] = [];

  private readonly MENU_DATA: MenuConfig[] = [
    {
      title: 'Dashboard',
      stringKey: 'SUPER_DASHBOARD',
      icon: 'speedometer-outline',
      permissionKey: 'SUPER_DASHBOARD'
    },
    {
      title: 'Operacional',
      icon: 'receipt-outline',
      children: [
        { title: 'Painel', stringKey: 'SUPER_OPERATIONAL_PANEL', icon: 'grid-outline', permissionKey: 'SUPER_OPERATIONAL_PANEL' },
        { title: 'Lista', stringKey: 'SUPER_OPERATIONAL_ORDERS', icon: 'list-outline', permissionKey: 'SUPER_OPERATIONAL_ORDERS' },
        { title: 'Cadastrar Ordem', stringKey: 'SUPER_OPERATIONAL_ORDERS_CREATE', icon: 'add-circle-outline', permissionKey: 'SUPER_OPERATIONAL_ORDERS_CREATE' },
      ]
    },
    {
      title: 'Agenda 365', stringKey: 'SUPER_OPERATIONAL_AGENDA', icon: 'calendar-outline', permissionKey: 'SUPER_OPERATIONAL_AGENDA'
    },
    {
      title: 'Empresas (Lojistas)',
      icon: 'business-outline',
      children: [
        { title: 'Painel', stringKey: 'SUPER_COMPANIES_PANEL', icon: 'grid-outline', permissionKey: 'SUPER_COMPANIES_PANEL' },
        { title: 'Ver Empresas', stringKey: 'SUPER_COMPANIES', icon: 'list-outline', permissionKey: 'SUPER_COMPANIES' },
        { title: 'Cadastrar Empresa', stringKey: 'SUPER_COMPANIES_CREATE', icon: 'add-circle-outline', permissionKey: 'SUPER_COMPANIES_CREATE' },
      ]
    },
    {
      title: 'Catálogo',
      icon: 'construct-outline',
      children: [
        { title: 'Painel', stringKey: 'SUPER_SERVICES_PANEL', icon: 'grid-outline', permissionKey: 'SUPER_SERVICES_PANEL' },
        { title: 'Lista', stringKey: 'SUPER_SERVICES', icon: 'list-outline', permissionKey: 'SUPER_SERVICES' },
        { title: 'Cadastrar Serviço', stringKey: 'SUPER_SERVICES_CREATE', icon: 'add-circle-outline', permissionKey: 'SUPER_SERVICES_CREATE' },
      ]
    },
    {
      title: 'Equipe & Usuários',
      icon: 'people-outline',
      children: [
        { title: 'Painel', stringKey: 'SUPER_STAFF_PANEL', icon: 'grid-outline', permissionKey: 'SUPER_STAFF_PANEL' },
        { title: 'Listar Todos', stringKey: 'SUPER_STAFF', icon: 'list-outline', permissionKey: 'SUPER_STAFF' },
        { title: 'Técnicos de Campo', url: '/super-admin/staff?role=technician', icon: 'construct-outline', permissionKey: 'SUPER_COLLABORATORS' },
        { title: 'Equipes', stringKey: 'SUPER_COLLABORATORS_TEAMS', icon: 'people-circle-outline', permissionKey: 'SUPER_COLLABORATORS_TEAMS' },
        { title: 'Cadastrar Usuário', stringKey: 'SUPER_STAFF_CREATE', icon: 'person-add-outline', permissionKey: 'SUPER_STAFF_CREATE' },
      ]
    },
    {
      title: 'Financeiro',
      icon: 'cash-outline',
      children: [
        { title: 'Gestão de Assinaturas', icon: 'swap-horizontal-outline', url: '/super-admin/subscriptions' },
        { title: 'Faturas & Cobranças', icon: 'document-text-outline', url: '/super-admin/invoices' },
        { title: 'Histórico de Pagamentos', icon: 'wallet-outline', url: '/super-admin/payments' },
      ]
    },
    {
      title: 'Configurações',
      icon: 'settings-outline',
      children: [
        { 
          title: 'Gerais', 
          icon: 'settings-outline',
          children: [
            { title: 'Metas de Vendas', stringKey: 'ADMIN_SALES_TARGET', icon: 'swap-horizontal-outline', permissionKey: 'ADMIN_SALES_TARGET' },
          ] 
        },
        { 
          title: 'Plataforma de Pagamento', 
          icon: 'construct-outline',
          children: [
            { title: 'Gateway de Pagamento', stringKey: 'ADMIN_PAYMENT_GATEWAY', icon: 'server-outline', permissionKey: 'ADMIN_PAYMENT_GATEWAY' },
            { title: 'Gateway Chave', stringKey: 'ADMIN_GATEWAY_KEYS', icon: 'key-outline', permissionKey: 'ADMIN_GATEWAY_KEYS' },
            { title: 'Meios de Pagamento', stringKey: 'ADMIN_PAYMENT_METHODS', icon: 'card-outline', permissionKey: 'ADMIN_PAYMENT_METHODS' }
          ]
        },
        { title: 'Aparência/Template', stringKey: 'ADMIN_APPEARANCE', icon: 'color-palette-outline', url: '/super-admin/settings/appearance', permissionKey: 'ADMIN_APPEARANCE' },
      ]
    },
    { 
      title: 'Meu Perfil', stringKey: 'ADMIN_ACCOUNT', icon: 'person-circle-outline', url: '/super-admin/profile', permissionKey: 'ADMIN_ACCOUNT'
    },
    { 
      title: 'Ajuda', 
      stringKey: 'ADMIN_HELP',
      icon: 'help-circle-outline',
      url: '/super-admin/help',
      permissionKey: 'ADMIN_HELP'
    },
  ];

  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ 
      homeOutline, logOutOutline, speedometerOutline, trendingUpOutline, personCircleOutline, helpCircleOutline,
      peopleOutline, listOutline, personAddOutline, chevronForward, chevronDown, calendarNumberOutline,
      menuOutline, chevronForwardOutline, constructOutline, briefcaseOutline, addCircleOutline,
      businessOutline, receiptOutline, gridOutline, settingsOutline, colorPaletteOutline, calendarOutline,
      serverOutline, keyOutline, cardOutline, swapHorizontalOutline,
      documentTextOutline, walletOutline, cashOutline, peopleCircleOutline
    });
  }

  async ngOnInit() {
    this.themeService.loadAppearance('GLOBAL');

    this.menuItems = this.buildMenu(this.MENU_DATA);
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRouteForMenuCollapse(event.urlAfterRedirects || event.url);
    });

    this.checkRouteForMenuCollapse(this.router.url);
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

  private buildMenu(configList: MenuConfig[]): MenuItem[] {
    const user = this.profileService.profile();
    const isSuperAdmin = user?.type === 'super_admin';
    const userPermissions = user?.permissions || [];

    const items: MenuItem[] = [];

    for (const config of configList) {
      // Se não for super admin e a rota exigir permissão que o usuário não tem, pule este item
      if (!isSuperAdmin && config.permissionKey && !userPermissions.includes(config.permissionKey)) {
        continue;
      }

      let resolvedUrl: string | null = config.stringKey && Strings[config.stringKey] ? Strings[config.stringKey] : (config.url || null);
      let queryParams: any = config.queryParams || null;

      if (resolvedUrl && resolvedUrl.includes('?')) {
        const [path, queryString] = resolvedUrl.split('?');
        resolvedUrl = path;
        const params = new URLSearchParams(queryString);
        queryParams = queryParams || {};
        params.forEach((value, key) => {
          queryParams[key] = value;
        });
      }

      const item: MenuItem = {
        title: config.title,
        icon: config.icon,
        url: resolvedUrl,
        queryParams: queryParams,
        open: false
      };

      if (config.children && config.children.length > 0) {
        item.children = this.buildMenu(config.children);
        // Se for uma pasta que não tem URL próprio e ficou sem filhos após o filtro, removemos a pasta
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

  public logout() {
    this.authService.logoutUser(true);
  }
}
