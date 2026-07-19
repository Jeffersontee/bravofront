import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from 'src/app/services/company/company.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { RouterModule, RouterLink, RouterOutlet, Router } from '@angular/router';
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
      title: 'Ordens de Serviço',
      icon: 'receipt-outline',
      url: (companyId: string) => `/service-orders`
    }
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
        
        // Redirecionamento preventivo se o lojista cair nas rotas raiz ou genéricas de dashboard global
        if (this.router.url === '/company' || this.router.url === '/company/dashboard') {
          this.router.navigate([`/company/companies/${companyId}/dashboard`], { replaceUrl: true });
        }
      }
    } catch (err) {
      console.error('Erro ao inicializar menu do lojista:', err);
    }
  }

  private buildMenuWithCompany(configList: any[], companyId: string): MenuItem[] {
    return configList.map(config => {
      const item: MenuItem = {
        title: config.title,
        icon: config.icon,
        url: config.url ? config.url(companyId) : null,
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
