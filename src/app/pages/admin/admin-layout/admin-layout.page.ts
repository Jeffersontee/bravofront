import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonItem,
  IonIcon, IonList, IonApp, IonSplitPane, IonMenu, IonMenuToggle,
  IonLabel, IonButtons, IonButton, IonRouterOutlet
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
  documentsOutline, pieChartOutline, serverOutline, keyOutline
} from 'ionicons/icons';
import { Strings } from 'src/app/enum/strings';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

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
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.page.html',
  styleUrls: ['./admin-layout.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonItem, IonIcon, IonList, IonApp, IonSplitPane, IonMenu, IonMenuToggle,
    IonLabel, IonRouterOutlet, IonButtons, IonButton
  ]
})
export class AdminLayoutPage implements OnInit {
  public isCollapsed = false;
  public menuItems: MenuItem[] = [];

  private readonly MENU_DATA: MenuConfig[] = [
    {
      title: 'Dashboard',
      icon: 'speedometer-outline',
      children: [
        { title: 'KPIs Estratégicos', stringKey: 'ADMIN_KPI', icon: 'trending-up-outline' },
        { title: 'Empresas (Painel)', stringKey: 'ADMIN_COMPANIES', icon: 'business-outline' },
        { title: 'Serviços', stringKey: 'ADMIN_SERVICES', icon: 'construct-outline' },
        { title: 'Atendimentos', stringKey: 'ADMIN_SALES', icon: 'bar-chart-outline' },
        { title: 'Clientes', stringKey: 'ADMIN_CUSTOMERS', icon: 'people-outline' },
      ]
    },
    {
      title: 'Empresas',
      icon: 'storefront-outline',
      children: [
        { title: 'Empresa', stringKey: 'ADMIN_LIST_COMPANY', icon: 'receipt-outline' },
        { title: 'Cadastrar Empresa', stringKey: 'ADMIN_CREATE_COMPANY', icon: 'receipt-outline' },
        { title: 'Dados da Empresa', stringKey: 'ADMIN_DETAILS_COMPANY', icon: 'business-outline' },
      ]
    },
    {
      title: 'Serviços',
      icon: 'settings-outline',
      children: [
        { title: 'Serviços', stringKey: 'ADMIN_LIST_SERVICES', icon: 'cube-outline' },
        { title: 'Cadastrar Serviços', stringKey: 'ADMIN_CREATE_SERVICES', icon: 'add-circle-outline' },
      ]
    },
    {
      title: 'Colaboradores',
      icon: 'settings-outline',
      children: [
        { title: 'Colaboradores', stringKey: 'ADMIN_LIST_COLLABORATOR', icon: 'cube-outline' },
        { title: 'Cadastrar Colaboradores', stringKey: 'ADMIN_CREATE_COLLABORATOR', icon: 'add-circle-outline' },
      ]
    },
    {
      title: 'Usuarios',
      icon: 'settings-outline',
      children: [
        { title: 'Usuarios', stringKey: 'ADMIN_LIST_STAFF', icon: 'cube-outline' },
        { title: 'Cadastrar Usuários', stringKey: 'ADMIN_CREATE_STAFF', icon: 'add-circle-outline' },
      ]
    },
    {
      title: 'Configurações',
      icon: 'settings-outline',
      children: [
        { title: 'Produtos', stringKey: 'ADMIN_PRODUCTS', icon: 'cube-outline' },
        { title: 'Cadastrar Produto', stringKey: 'ADMIN_PRODUCTS_CREATE', icon: 'add-circle-outline' },
        { title: 'Categorias', stringKey: 'ADMIN_CATEGORIES', icon: 'cube-outline' },
      ]
    }
  ];

  constructor(
    private router: Router,
    private alertCtrl: AlertController
  ) {
    // Registrar todos os ícones necessários no construtor
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
      documentsOutline, pieChartOutline, serverOutline, keyOutline
    });
  }

  ngOnInit() {
    this.menuItems = this.buildMenu(this.MENU_DATA);
  }

  private buildMenu(configList: MenuConfig[]): MenuItem[] {
    return configList.map(config => {
      const item: MenuItem = {
        title: config.title,
        icon: config.icon,
        url: config.stringKey && Strings[config.stringKey] ? `/${Strings[config.stringKey]}` : null,
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

  public async onMenuClick(item: MenuItem) {
    if (item.url === `/${Strings.ADMIN_ORDER}`) {
      // Abre o seletor de empresa e direciona para o painel
      await this.openCompanySelector();
    } else if (item.url) {
      this.router.navigateByUrl(item.url);
    } else {
      item.open = !item.open;
    }
  }

  public async openCompanySelector() {
    // Simula a escolha de uma empresa (Zé Delivery)
    const alert = await this.alertCtrl.create({
      header: 'Selecione a Empresa',
      inputs: [
        {
          name: 'company',
          type: 'radio',
          label: 'Zé Delivery',
          value: '1',
          checked: true
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            if (data) {
              this.router.navigate([`/establishment-admin/companies/${data}/dashboard`]);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  public onLogout() {
    console.log('Logout realizado.');
  }
}
