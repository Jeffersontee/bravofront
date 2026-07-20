import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonItem,
  IonIcon, IonList, IonApp, IonSplitPane, IonMenu, IonMenuToggle,
  IonLabel, IonButtons, IonButton, IonRouterOutlet, IonFooter } from '@ionic/angular/standalone';
import { RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import {
  homeOutline, logOutOutline, speedometerOutline, trendingUpOutline,
  peopleOutline, listOutline, personAddOutline, chevronForward, chevronDown,
  menuOutline, chevronForwardOutline, constructOutline, briefcaseOutline, addCircleOutline,
  businessOutline, receiptOutline, gridOutline, settingsOutline,
  colorPaletteOutline, 
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { Strings } from 'src/app/enum/strings';

interface MenuItem {
  title: string;
  url?: string | null;
  icon: string;
  children?: MenuItem[];
  open?: boolean;
}

interface MenuConfig {
  title: string;
  stringKey?: keyof typeof Strings;
  icon: string;
  children?: MenuConfig[];
}

@Component({
  selector: 'app-super-layout',
  templateUrl: './super-layout.page.html',
  styleUrls: ['./super-layout.page.scss'],
  standalone: true,
  imports: [IonFooter, 
    CommonModule, FormsModule, RouterLink,
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
    },
    {
      title: 'Operacional',
      icon: 'receipt-outline',
      children: [
        { title: 'Painel', stringKey: 'SUPER_OPERATIONAL_PANEL', icon: 'grid-outline' },
        { title: 'Lista', stringKey: 'SUPER_OPERATIONAL_ORDERS', icon: 'list-outline' },
        { title: 'Cadastrar Ordem', stringKey: 'SUPER_OPERATIONAL_ORDERS_CREATE', icon: 'add-circle-outline' },
      ]
    },
    {
      title: 'Empresas / Clientes',
      icon: 'business-outline',
      children: [
        { title: 'Painel', stringKey: 'SUPER_COMPANIES_PANEL', icon: 'grid-outline' },
        { title: 'Ver Empresas', stringKey: 'SUPER_COMPANIES', icon: 'list-outline' },
        { title: 'Cadastrar Empresa', stringKey: 'SUPER_COMPANIES_CREATE', icon: 'add-circle-outline' },
      ]
    },
    {
      title: 'Catálogo',
      icon: 'construct-outline',
      children: [
        { title: 'Painel', stringKey: 'SUPER_SERVICES_PANEL', icon: 'grid-outline' },
        { title: 'Lista', stringKey: 'SUPER_SERVICES', icon: 'list-outline' },
        { title: 'Cadastrar Serviço', stringKey: 'SUPER_SERVICES_CREATE', icon: 'add-circle-outline' },
      ]
    },
    {
      title: 'Colaboradores',
      icon: 'briefcase-outline',
      children: [
        { title: 'Painel', stringKey: 'SUPER_COLLABORATORS_PANEL', icon: 'grid-outline' },
        { title: 'Equipes', stringKey: 'SUPER_COLLABORATORS_TEAMS', icon: 'people-outline' },
        { title: 'Lista', stringKey: 'SUPER_COLLABORATORS', icon: 'list-outline' },
        { title: 'Cadastrar Colaborador', stringKey: 'SUPER_COLLABORATORS_CREATE', icon: 'person-add-outline' },
      ]
    },
    {
      title: 'Usuários Globais',
      icon: 'people-outline',
      children: [
        { title: 'Painel', stringKey: 'SUPER_STAFF_PANEL', icon: 'grid-outline' },
        { title: 'Listar Usuários', stringKey: 'SUPER_STAFF', icon: 'list-outline' },
        { title: 'Cadastrar Usuário', stringKey: 'SUPER_STAFF_CREATE', icon: 'person-add-outline' },
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

  private authService = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ 
      homeOutline, logOutOutline, speedometerOutline, trendingUpOutline,
      peopleOutline, listOutline, personAddOutline, chevronForward, chevronDown,
      menuOutline, chevronForwardOutline, constructOutline, briefcaseOutline, addCircleOutline,
      businessOutline, receiptOutline, gridOutline, settingsOutline, colorPaletteOutline
    });
  }

  ngOnInit() {
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
    return configList.map(config => {
      const item: MenuItem = {
        title: config.title,
        icon: config.icon,
        url: config.stringKey && Strings[config.stringKey] ? Strings[config.stringKey] : null,
        open: false
      };

      if (config.children && config.children.length > 0) {
        item.children = this.buildMenu(config.children);
      }

      return item;
    });
  }

  public toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  public logout() {
    this.authService.logoutUser(true);
  }
}
