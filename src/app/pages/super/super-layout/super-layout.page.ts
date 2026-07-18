import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonItem,
  IonIcon, IonList, IonApp, IonSplitPane, IonMenu, IonMenuToggle,
  IonLabel, IonButtons, IonButton, IonRouterOutlet, IonFooter } from '@ionic/angular/standalone';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  homeOutline, logOutOutline, speedometerOutline, trendingUpOutline,
  peopleOutline, listOutline, personAddOutline, chevronForward, chevronDown,
  menuOutline, chevronForwardOutline, constructOutline, briefcaseOutline, addCircleOutline
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
    CommonModule, FormsModule, RouterLink, RouterOutlet,
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
      icon: 'speedometer-outline',
      children: [
        { title: 'Painel Geral', stringKey: 'SUPER_DASHBOARD', icon: 'trending-up-outline' }
      ]
    },
    {
      title: 'Operacional',
      icon: 'receipt-outline',
      children: [
        { title: 'Ordens de Serviço', stringKey: 'SERVICE_ORDERS', icon: 'list-outline' }
      ]
    },
    {
      title: 'Catálogo',
      icon: 'construct-outline',
      children: [
        { title: 'Ver Serviços', stringKey: 'SUPER_SERVICES', icon: 'list-outline' },
        { title: 'Cadastrar Serviços', stringKey: 'SUPER_SERVICES_CREATE', icon: 'add-circle-outline' },
      ]
    },
    {
      title: 'Colaboradores',
      icon: 'briefcase-outline',
      children: [
        { title: 'Equipe de Campo', stringKey: 'SUPER_COLLABORATORS', icon: 'list-outline' },
        { title: 'Cadastrar Técnico', stringKey: 'SUPER_COLLABORATORS_CREATE', icon: 'person-add-outline' },
      ]
    },
    {
      title: 'Usuários Globais',
      icon: 'people-outline',
      children: [
        { title: 'Listar Usuários', stringKey: 'SUPER_STAFF', icon: 'list-outline' },
        { title: 'Cadastrar Usuário', stringKey: 'SUPER_STAFF_CREATE', icon: 'person-add-outline' },
      ]
    }
  ];

  private authService = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ 
      homeOutline, logOutOutline, speedometerOutline, trendingUpOutline,
      peopleOutline, listOutline, personAddOutline, chevronForward, chevronDown,
      menuOutline, chevronForwardOutline, constructOutline, briefcaseOutline, addCircleOutline
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
    if (item.url) {
      if (this.router.url === item.url || this.router.url.includes(item.url)) {
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
      message: 'Esta funcionalidade ainda está em desenvolvimento e será disponibilizada em breve.',
      buttons: ['OK']
    });
    await alert.present();
  }

  public logout() {
    this.authService.logoutUser(true);
  }
}
