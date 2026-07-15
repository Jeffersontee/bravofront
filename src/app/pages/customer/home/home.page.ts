import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, 
  IonIcon, IonLabel, IonGrid, IonRow, IonCol, IonInput, IonTextarea 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  flashOutline, hammerOutline, waterOutline, constructOutline, chevronForwardCircleOutline,
  wifiOutline, shieldCheckmarkOutline, locationOutline, chevronBackOutline, 
  construct, 
  chevronForwardOutline
} from 'ionicons/icons';
import { OrderService } from '../../../services/order/order.service';
import { CardServicesComponent } from '../../../components/card-services/card-services.component';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  priceText: string;
  priceValue: number;
  iconName: string;
  bgColor: string;
  iconColor: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, 
    IonTitle, IonButton, IonIcon, IonLabel, IonGrid, IonRow, IonCol, 
    IonInput, IonTextarea, CardServicesComponent
  ]
})
export class HomePage {
  private orderService = inject(OrderService);
  private router = inject(Router);

  public activeOrders = computed(() => {
    return this.orderService.orders().filter(o => o.status !== 'Concluído');
  });

  public customerName = this.orderService.customerName;
  public customerAddress = this.orderService.customerAddress;

  public getCategoryIcon(category: string): string {
    switch (category) {
      case 'Elétrica': return 'flash-outline';
      case 'Civil': return 'hammer-outline';
      case 'Hidráulica': return 'water-outline';
      case 'Serralheria': return 'construct-outline';
      case 'Rede e Tecnologia': return 'wifi-outline';
      case 'Serviços Preventivos': return 'shield-checkmark-outline';
      default: return 'construct-outline';
    }
  }

  public getCategoryBgColor(category: string): string {
    switch (category) {
      case 'Elétrica': return '#eff6ff';
      case 'Civil': return '#fef3c7';
      case 'Hidráulica': return '#ecfeff';
      case 'Serralheria': return '#f1f5f9';
      case 'Rede e Tecnologia': return '#ecfdf5';
      case 'Serviços Preventivos': return '#f5f3ff';
      default: return '#f1f5f9';
    }
  }

  public getCategoryIconColor(category: string): string {
    switch (category) {
      case 'Elétrica': return '#3b82f6';
      case 'Civil': return '#d97706';
      case 'Hidráulica': return '#0891b2';
      case 'Serralheria': return '#475569';
      case 'Rede e Tecnologia': return '#059669';
      case 'Serviços Preventivos': return '#7c3aed';
      default: return '#475569';
    }
  }

  public navigateToOrderDetails(orderId: string) {
    this.router.navigate(['/customer/orders']);
  }

  // Categorias baseadas no design do Claude
  public categories: ServiceCategory[] = [
    {
      id: 'eletrica',
      name: 'Elétrica',
      description: 'Disjuntores, tomadas, iluminação, quadros',
      priceText: 'a partir de R$ 110,00',
      priceValue: 110,
      iconName: 'flash-outline',
      bgColor: '#eff6ff',
      iconColor: '#3b82f6'
    },
    {
      id: 'civil',
      name: 'Civil',
      description: 'Pintura, drywall, pisos, reformas',
      priceText: 'a partir de R$ 120,00',
      priceValue: 120,
      iconName: 'hammer-outline',
      bgColor: '#fef3c7',
      iconColor: '#d97706'
    },
    {
      id: 'hidraulica',
      name: 'Hidráulica',
      description: 'Vazamentos, torneiras, encanamento',
      priceText: 'a partir de R$ 90,00',
      priceValue: 90,
      iconName: 'water-outline',
      bgColor: '#ecfeff',
      iconColor: '#0891b2'
    },
    {
      id: 'serralheria',
      name: 'Serralheria',
      description: 'Portões, grades, soldas, estruturas',
      priceText: 'a partir de R$ 150,00',
      priceValue: 150,
      iconName: 'construct-outline',
      bgColor: '#f1f5f9',
      iconColor: '#475569'
    },
    {
      id: 'rede',
      name: 'Rede e Tecnologia',
      description: 'Cabeamento, Wi-Fi, câmeras, TI',
      priceText: 'a partir de R$ 130,00',
      priceValue: 130,
      iconName: 'wifi-outline',
      bgColor: '#ecfdf5',
      iconColor: '#059669'
    },
    {
      id: 'preventivo',
      name: 'Serviços Preventivos',
      description: 'Check-up, laudos, planos de manutenção',
      priceText: 'a partir de R$ 100,00',
      priceValue: 100,
      iconName: 'shield-checkmark-outline',
      bgColor: '#f5f3ff',
      iconColor: '#7c3aed'
    }
  ];

  // Signals para controlar qual serviço está sendo solicitado
  public selectedCategory = signal<ServiceCategory | null>(null);
  public serviceDescription = signal<string>('');

  constructor() {
    addIcons({ 
      flashOutline, hammerOutline, waterOutline, constructOutline, chevronForwardOutline,
      wifiOutline, shieldCheckmarkOutline, locationOutline, chevronBackOutline, 
      construct 
    });
  }

  public selectCategory(cat: ServiceCategory) {
    this.selectedCategory.set(cat);
    this.serviceDescription.set('');
  }

  public cancelSelection() {
    this.selectedCategory.set(null);
  }

  public submitRequest() {
    const cat = this.selectedCategory();
    const desc = this.serviceDescription().trim();

    if (!cat || !desc) return;

    this.orderService.createOrder(cat.name, desc, cat.priceValue);
    this.selectedCategory.set(null);
    this.serviceDescription.set('');

    // Navega para a aba de pedidos para acompanhar a solicitação
    this.router.navigate(['/customer/orders']);
  }
}
