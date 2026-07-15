import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from 'src/app/services/company/company.service';
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
  documentsOutline, pieChartOutline, serverOutline, keyOutline,
  listOutline, personOutline, personAddOutline, briefcaseOutline
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
        { title: 'Empresa', stringKey: 'ADMIN_LIST_COMPANY', icon: 'list-outline' },
        { title: 'Cadastrar Empresa', stringKey: 'ADMIN_CREATE_COMPANY', icon: 'add-circle-outline' },
        { title: 'Painel da Empresa', stringKey: 'ADMIN_DETAILS_COMPANY', icon: 'document-text-outline' },
        { title: 'Unidades da Empresa', stringKey: 'ADMIN_LIST_UNITS', icon: 'business-outline' },
      ]
    },
    {
      title: 'Serviços',
      icon: 'construct-outline',
      children: [
        { title: 'Serviços', stringKey: 'ADMIN_LIST_SERVICES', icon: 'list-outline' },
        { title: 'Cadastrar Serviços', stringKey: 'ADMIN_CREATE_SERVICES', icon: 'add-circle-outline' },
      ]
    },
    {
      title: 'Colaboradores',
      icon: 'briefcase-outline',
      children: [
        { title: 'Colaboradores', stringKey: 'ADMIN_LIST_COLLABORATOR', icon: 'list-outline' },
        { title: 'Cadastrar Colaboradores', stringKey: 'ADMIN_CREATE_COLLABORATOR', icon: 'person-add-outline' },
      ]
    },
    {
      title: 'Usuários',
      icon: 'person-outline',
      children: [
        { title: 'Usuários', stringKey: 'ADMIN_LIST_STAFF', icon: 'list-outline' },
        { title: 'Cadastrar Usuários', stringKey: 'ADMIN_CREATE_STAFF', icon: 'person-add-outline' },
      ]
    },
    {
      title: 'Configurações',
      icon: 'settings-outline',
      children: [
        { title: 'Produtos', stringKey: 'ADMIN_PRODUCTS', icon: 'cube-outline' },
        { title: 'Cadastrar Produto', stringKey: 'ADMIN_PRODUCTS_CREATE', icon: 'add-circle-outline' },
        { title: 'Categorias', stringKey: 'ADMIN_CATEGORIES', icon: 'layers-outline' },
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
      documentsOutline, pieChartOutline, serverOutline, keyOutline,
      listOutline, personOutline, personAddOutline, briefcaseOutline
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
    if (item.url === `/${Strings.ADMIN_DETAILS_COMPANY}` || item.url === `/${Strings.ADMIN_LIST_UNITS}`) {
      // Abre o seletor de empresa e direciona para o painel ou unidades
      const routeSuffix = item.url === `/${Strings.ADMIN_LIST_UNITS}` ? 'units' : 'dashboard';
      await this.openCompanySelector(routeSuffix);
    } else if (item.url) {
      try {
        const success = await this.router.navigateByUrl(item.url);
        if (!success) {
          this.showNotImplementedAlert();
        }
      } catch (err) {
        this.showNotImplementedAlert();
      }
    } else {
      item.open = !item.open;
    }
  }

  private async showNotImplementedAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Em Breve',
      message: 'Esta página/funcionalidade ainda está em desenvolvimento e será disponibilizada em breve.',
      buttons: ['OK']
    });
    await alert.present();
  }

  private companyService = inject(CompanyService);

  public async openCompanySelector(routeSuffix: string = 'dashboard') {
    const loading = await this.alertCtrl.create({
      header: 'Carregando...',
      message: 'Buscando empresas cadastradas...',
      backdropDismiss: false
    });
    await loading.present();

    try {
      this.companyService.getCompanies().subscribe(async (res) => {
        await loading.dismiss();
        if (res.success && res.data.length > 0) {
          const companies = res.data;
          
          // Mapeia as empresas para o formato de inputs do AlertController
          const inputs = companies.map(c => {
            // Define o "Zé Delivery" como default se existir, caso contrário o primeiro item.
            const isDefault = c.name.toLowerCase().includes('zé delivery') || c.name.toLowerCase().includes('ze delivery');
            return {
              name: 'company',
              type: 'radio' as any,
              label: c.name,
              value: c._id,
              checked: isDefault
            };
          });

          // Se nenhum foi marcado como Zé Delivery, marca o primeiro como padrão
          if (!inputs.find(i => i.checked)) {
            inputs[0].checked = true;
          }

          const alert = await this.alertCtrl.create({
            header: 'Selecione a Empresa',
            inputs: inputs,
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel'
              },
              {
                text: 'Confirmar',
                handler: (data) => {
                  if (data) {
                    this.router.navigate([`/establishment-admin/companies/${data}/${routeSuffix}`]);
                  }
                }
              }
            ]
          });

          await alert.present();
        } else {
          const alert = await this.alertCtrl.create({
            header: 'Aviso',
            message: 'Nenhuma empresa cadastrada no momento.',
            buttons: ['OK']
          });
          await alert.present();
        }
      });
    } catch (error) {
      await loading.dismiss();
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Não foi possível carregar as empresas.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  public onLogout() {
    console.log('Logout realizado.');
  }
}
