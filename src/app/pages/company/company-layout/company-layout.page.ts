import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from 'src/app/services/company/company.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
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
  listOutline, personOutline, personAddOutline, briefcaseOutline
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

  private readonly MENU_DATA = [
    {
      title: 'Dashboard',
      icon: 'speedometer-outline',
      url: (companyId: string) => `/company/companies/${companyId}/dashboard`
    },
    {
      title: 'Minha Empresa',
      icon: 'storefront-outline',
      children: [
        { title: 'Dados da Empresa', icon: 'document-text-outline', url: (companyId: string) => `/company/companies/edit/${companyId}` },
        { title: 'Unidades / Filiais', icon: 'business-outline', url: (companyId: string) => `/company/companies/${companyId}/units` },
        { title: 'Catálogo de Serviços', icon: 'layers-outline', url: (companyId: string) => `/company/companies/${companyId}/catalog` }
      ]
    },
    {
      title: 'Colaborador',
      icon: 'people-outline',
      children: [
        { title: 'Usuários', stringKey: 'ADMIN_STAFF', icon: 'people-outline' },
        { title: 'Cadastro de Colaborador', stringKey: 'ADMIN_STAFF_CREATE', icon: ''},
      ]
    },
    {
      title: 'Ordens de Serviço',
      icon: 'receipt-outline',
      url: (companyId: string) => `/service-orders`
    },
    {
      title: 'Financeiro',
      icon: 'cash-outline',
      children: [
        { title: 'Minhas Faturas', stringKey: 'ADMIN_INVOICES', icon: 'receipt-outline' }, // Aponta para a página unificada
        { title: 'Contas', stringKey: 'ADMIN_FIADOS', icon: 'mail-outline' },
        { title: 'Fiados (Conta Corrente)', stringKey: 'ADMIN_FIADOS', icon: 'folder-open-outline' },
        { title: 'Pagamentos', stringKey: 'ADMIN_PAYMENTS', icon: 'wallet-outline'},
        { title: 'Assinaturas', stringKey: 'ADMIN_SUBSCRIPTIONS', icon: 'repeat-outline' },
      ]
    },
    { 
      title: 'Inteligência', 
      icon: 'analytics-outline',
      children: [
        { title: 'Relatórios Consolidados', stringKey: 'ADMIN_REPORTS', icon: 'pie-chart-outline' },
        { title: 'Logs de Auditoria', stringKey: 'ADMIN_AUDIT', icon: 'shield-checkmark-outline' },
      ]
    },
    {
      title: 'Relatórios',
      icon: 'storefront-outline',
      children: [
        { title: 'Dados da Empresa', icon: 'document-text-outline', url: (companyId: string) => `/company/companies/edit/${companyId}` },
        { title: 'Unidades / Filiais', icon: 'business-outline', url: (companyId: string) => `/company/companies/${companyId}/units` },
        { title: 'Catálogo de Serviços', icon: 'layers-outline', url: (companyId: string) => `/company/companies/${companyId}/catalog` }
      ]
    },
       {
      title: 'Configurações',
      icon: 'settings-outline',
      children: [
        { 
          title: 'Gerais', 
          //stringKey: 'ADMIN_PAYMENTS', 
          icon: 'settings-outline',
          children: [
            { title: 'Metas de Vendas', stringKey: 'ADMIN_SALES_TARGET', icon: 'swap-horizontal-outline' },
          ] 
        
        },
        { 
          title: 'Plataforma de Pagamento', 
          icon: 'construct-outline',
          children: [
            { title: 'Gateway de Pagamento', stringKey: 'ADMIN_PAYMENT_GATEWAY', icon: 'server-outline' },
            { title: 'Gateway Chave', stringKey: 'ADMIN_GATEWAY_KEYS', icon: 'key-outline' },
            { title: 'Meios de Pagamento', stringKey: 'ADMIN_PAYMENT_METHODS', icon: 'card-outline' }
          ]
        },
        { title: 'Aparência/Template', stringKey: 'ADMIN_APPEARANCE', icon: 'color-palette-outline' },
      ]
    },
    { 
      title: 'Meu Perfil', stringKey: 'ADMIN_ACCOUNT', icon: 'person-circle-outline' 
    },
    { 
      title: 'Ajuda', 
      stringKey: 'ADMIN_HELP',
      icon: 'help-circle-outline',
    },
  ];

  constructor() {
    addIcons({
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
      listOutline, personOutline, personAddOutline, briefcaseOutline
    });
  }

  async ngOnInit() {
    try {
      const user = await this.profileService.getProfile();
      if (user) {
        const companyId = user.company_id || '';
        
        // Reconstrói o menu dinâmico com o company_id do lojista
        this.menuItems = this.buildMenuWithCompany(this.MENU_DATA, companyId);
        
        this.router.events.pipe(
          filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
          this.checkRouteForMenuCollapse(event.urlAfterRedirects || event.url);
        });

        this.checkRouteForMenuCollapse(this.router.url);

        // Redirecionamento preventivo se o lojista cair nas rotas raiz ou genéricas de dashboard global
        if (this.router.url === '/company' || this.router.url === '/company/dashboard') {
          this.router.navigate([`/company/companies/${companyId}/dashboard`], { replaceUrl: true });
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

  private buildMenuWithCompany(configList: any[], companyId: string): MenuItem[] {
    return configList.map(config => {
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
        item.children = this.buildMenuWithCompany(config.children, companyId);
      }

      return item;
    });
  }

  public toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  public onLogout() {
    this.authService.logoutUser(true);
  }
}
