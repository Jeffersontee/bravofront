import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonItem,
  IonIcon, IonList, IonApp, IonSplitPane, IonMenu, IonMenuToggle,
  IonLabel, IonButtons, IonButton, IonRouterOutlet, IonFooter 
} from '@ionic/angular/standalone';
import { RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  logOutOutline, listOutline, menuOutline, chevronForwardOutline, receiptOutline, statsChartOutline,
  chevronDown, chevronForward
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';

interface MenuItem {
  title: string;
  url?: string | null;
  icon: string;
  children?: MenuItem[];
  open?: boolean;
}

@Component({
  selector: 'app-collaborator-layout',
  templateUrl: './collaborator-layout.page.html',
  styleUrls: ['./collaborator-layout.page.scss'],
  standalone: true,
  imports: [
    IonFooter, CommonModule, FormsModule, RouterLink, RouterOutlet,
    IonContent, IonHeader, IonTitle, IonToolbar, IonItem,
    IonIcon, IonList, IonApp, IonSplitPane, IonMenu, IonMenuToggle,
    IonLabel, IonButtons, IonButton, IonRouterOutlet
  ]
})
export class CollaboratorLayoutPage implements OnInit {
  public isCollapsed = false;
  
  public menuItems: MenuItem[] = [
    {
      title: 'Painel Gerencial',
      url: '/collaborator/dashboard',
      icon: 'stats-chart-outline'
    },
    {
      title: 'Minhas Visitas',
      url: '/collaborator/orders',
      icon: 'receipt-outline'
    }
  ];

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({ 
      logOutOutline, listOutline, menuOutline, chevronForwardOutline, receiptOutline, statsChartOutline,
      chevronDown, chevronForward
    });
  }

  ngOnInit() {
    // Redireciona para o login caso não tenha perfil válido
  }

  public toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  public logout() {
    this.authService.logoutUser(true);
  }
}
