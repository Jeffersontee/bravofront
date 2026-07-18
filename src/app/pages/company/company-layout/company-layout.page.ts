import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from 'src/app/services/company/company.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { RouterModule, RouterLink, RouterOutlet } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonItem,
  IonIcon, IonList, IonApp, IonSplitPane, IonMenu, IonMenuToggle,
  IonLabel, IonButtons, IonButton, IonRouterOutlet, IonFooter } from '@ionic/angular/standalone';
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
  selector: 'app-company-layout',
  templateUrl: './company-layout.page.html',
  styleUrls: ['./company-layout.page.scss'],
  standalone: true,
  imports: [IonFooter, 
    CommonModule, FormsModule, RouterLink, RouterOutlet,
    IonContent, IonHeader, IonTitle, IonToolbar, IonItem,
    IonIcon, IonList, IonApp, IonSplitPane, IonMenu, IonMenuToggle,
    IonLabel, IonButtons, IonButton, IonRouterOutlet
  ]
})
export class CompanyLayoutPage implements OnInit {
  public isCollapsed = false;
  public menuItems: MenuItem[] = [];

  private readonly MENU_DATA: MenuConfig[] = [
    {
      title: 'Dashboard',
      icon: 'speedometer-outline',
      children: [
        { title: 'Visão Geral', stringKey: 'COMPANY_COMPANIES', icon: 'trending-up-outline' },
        { title: 'Ordens de Serviço', stringKey: 'SERVICE_ORDERS', icon: 'receipt-outline' },
      ]
    },
    {
      title: 'Minha Empresa',
      icon: 'storefront-outline',
      children: [
        { title: 'Dados da Empresa', stringKey: 'COMPANY_DETAILS_COMPANY', icon: 'document-text-outline' },
        { title: 'Unidades / Filiais', stringKey: 'COMPANY_LIST_UNITS', icon: 'business-outline' },
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
    if (item.url === `/${Strings.COMPANY_DETAILS_COMPANY}` || item.url === `/${Strings.COMPANY_LIST_UNITS}`) {
      // Abre o seletor de empresa e direciona para o painel ou unidades
      const routeSuffix = item.url === `/${Strings.COMPANY_LIST_UNITS}` ? 'units' : 'dashboard';
      await this.openCompanySelector(routeSuffix);
    } else if (item.url) {
      // Se já estiver na rota, o Angular retorna null. 
      // Se não houver rota configurada, ele lança uma exceção (cai no catch).
      // Se um guard barrar, ele retorna false.
      if (this.router.url === item.url || this.router.url.includes(item.url)) {
        // Já estamos nessa rota, fecha o menu (opcional) ou não faz nada.
        return;
      }
      try {
        const success = await this.router.navigateByUrl(item.url);
        if (success === false) {
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
  private authService = inject(AuthService);

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
                    this.router.navigate([`/company/companies/${data}/${routeSuffix}`]);
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
    this.authService.logoutUser(true);
  }
}
