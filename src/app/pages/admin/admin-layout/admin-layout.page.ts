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
        { title: 'Visão Geral', stringKey: 'ADMIN_DASHBOARD', icon: 'grid-outline' },
        { title: 'Vendas', stringKey: 'ADMIN_SALES', icon: 'bar-chart-outline' },
        { title: 'Clientes', stringKey: 'ADMIN_CUSTOMERS', icon: 'people-outline' },
        { title: 'Produtos', stringKey: 'ADMIN_REPORT_PRODUCT', icon: 'gift-outline' },
        { title: 'Insumos', stringKey: 'ADMIN_REPORT_INGREDIENT', icon: 'layers-outline' },
        { title: 'KPIs Estratégicos', stringKey: 'ADMIN_KPI', icon: 'trending-up-outline' },
      ]
    },
    {
      title: 'Estabelecimento',
      icon: 'storefront-outline',
      children: [
        { title: 'Pedidos', stringKey: 'ADMIN_ORDER', icon: 'receipt-outline' },
        { title: 'Cardápio/Menu', stringKey: 'ADMIN_MENU', icon: 'restaurant-outline' },
        { title: 'Banners', stringKey: 'ADMIN_BANNERS', icon: 'images-outline' },
        { title: 'Estoque de Itens', stringKey: 'ADMIN_STOCK', icon: 'cube-outline' },
        { title: 'Dados da Loja', stringKey: 'ADMIN_ESTABLISHMENTS', icon: 'business-outline' },
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

  constructor() {
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
        url: config.stringKey ? Strings[config.stringKey] : null,
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

  public onLogout() {
    console.log('Logout realizado.');
  }
}
