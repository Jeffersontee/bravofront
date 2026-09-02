import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonTitle, IonButton, 
  IonIcon, IonGrid, IonRow, IonCol, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  flashOutline, hammerOutline, waterOutline, constructOutline,
  wifiOutline, shieldCheckmarkOutline, locationOutline, chevronBackOutline, 
  construct, 
  chevronForwardOutline, documentTextOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { CardServicesComponent } from '../../../components/card-services/card-services.component';
import { ThemeService } from '../../../services/theme/theme.service';
import { ServiceService } from '../../../services/service/service.service';
import { ServiceOrderService } from '../../../services/service-order/service-order.service';
import { ProfileService } from '../../../services/profile/profile.service';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  priceText: string;
  priceValue: number;
  iconName: string;
  bgColor: string;
  iconColor: string;
  rawService?: any;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonTitle, IonButton, IonIcon, IonGrid, IonRow, IonCol, 
    CardServicesComponent
  ]
})
export class HomePage implements OnInit {
  private router = inject(Router);
  private toastController = inject(ToastController);
  public themeService = inject(ThemeService);
  private serviceService = inject(ServiceService);
  private serviceOrderService = inject(ServiceOrderService);
  private profileService = inject(ProfileService);

  public isSubmitting = signal<boolean>(false);
  public categoriesSignal = signal<ServiceCategory[]>([]);
  public customerOrders = signal<any[]>([]);

  public activeOrders = computed(() => {
    return this.customerOrders().filter(o => o.status !== 'Concluído' && o.status !== 'Cancelado');
  });

  public customerName = computed(() => this.profileService.profile()?.name || 'Cliente');
  public customerAddress = computed(() => (this.profileService.profile() as any)?.address || 'Endereço Principal');

  public getCategoryIcon(category: string): string {
    const c = category.toLowerCase();
    if (c.includes('elétr') || c.includes('eletr')) return 'flash-outline';
    if (c.includes('civil') || c.includes('obra') || c.includes('pedre')) return 'hammer-outline';
    if (c.includes('hidr') || c.includes('água') || c.includes('agua')) return 'water-outline';
    if (c.includes('serral') || c.includes('portã') || c.includes('porta')) return 'construct-outline';
    if (c.includes('rede') || c.includes('wifi') || c.includes('tec')) return 'wifi-outline';
    if (c.includes('prevent') || c.includes('check')) return 'shield-checkmark-outline';
    return 'construct-outline';
  }

  public getCategoryBgColor(category: string): string {
    const c = category.toLowerCase();
    if (c.includes('elétr') || c.includes('eletr')) return '#eff6ff';
    if (c.includes('civil') || c.includes('obra')) return '#fef3c7';
    if (c.includes('hidr') || c.includes('água')) return '#ecfeff';
    if (c.includes('serral') || c.includes('portã')) return '#f1f5f9';
    if (c.includes('rede') || c.includes('wifi')) return '#ecfdf5';
    return '#f5f3ff';
  }

  public getCategoryIconColor(category: string): string {
    const c = category.toLowerCase();
    if (c.includes('elétr') || c.includes('eletr')) return '#3b82f6';
    if (c.includes('civil') || c.includes('obra')) return '#d97706';
    if (c.includes('hidr') || c.includes('água')) return '#0891b2';
    if (c.includes('serral') || c.includes('portã')) return '#475569';
    if (c.includes('rede') || c.includes('wifi')) return '#059669';
    return '#7c3aed';
  }

  public navigateToOrderDetails(orderId: string) {
    this.router.navigate(['/customer/orders']);
  }

  // Categories fallback se backend ainda não tiver retornado
  public defaultCategories: ServiceCategory[] = [
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

  public get categories(): ServiceCategory[] {
    return this.categoriesSignal().length > 0 ? this.categoriesSignal() : this.defaultCategories;
  }

  // Signals para controlar qual serviço está sendo solicitado
  public selectedCategory = signal<ServiceCategory | null>(null);
  public serviceDescription = signal<string>('');

  constructor() {
    addIcons({ 
      flashOutline, hammerOutline, waterOutline, constructOutline, chevronForwardOutline,
      wifiOutline, shieldCheckmarkOutline, locationOutline, chevronBackOutline, 
      construct, documentTextOutline, checkmarkCircleOutline
    });
  }

  async ngOnInit() {
    this.themeService.loadAppearance('GLOBAL');
    this.loadCatalogServices();
    this.loadCustomerOrders();
  }

  loadCatalogServices() {
    this.serviceService.getServices().subscribe({
      next: (res) => {
        if (res?.success && res?.data && res.data.length > 0) {
          const mapped = res.data.map((srv: any) => ({
            id: srv._id,
            name: srv.name,
            description: srv.description || srv.category || 'Serviço técnico especializado',
            priceText: srv.price ? `a partir de R$ ${Number(srv.price).toFixed(2).replace('.', ',')}` : 'Sob consulta',
            priceValue: srv.price || 100,
            iconName: this.getCategoryIcon(srv.category || srv.name),
            bgColor: this.getCategoryBgColor(srv.category || srv.name),
            iconColor: this.getCategoryIconColor(srv.category || srv.name),
            rawService: srv
          }));
          this.categoriesSignal.set(mapped);
        }
      },
      error: (err) => console.error('Erro ao carregar catálogo de serviços:', err)
    });
  }

  loadCustomerOrders() {
    this.serviceOrderService.getServiceOrders().subscribe({
      next: (res) => {
        if (res?.success && res?.data) {
          const mapped = res.data.map(order => ({
            id: order._id || '',
            category: typeof order.service_id === 'object' ? (order.service_id as any)?.name : 'Serviço',
            status: this.formatStatus(order.current_status),
            finalValue: order.client_price || 0,
            initialEstimate: 100
          }));
          this.customerOrders.set(mapped);
        }
      },
      error: (err) => console.error('Erro ao carregar ordens do cliente:', err)
    });
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'SOLICITADO': return 'Solicitado';
      case 'AGENDADO': return 'Agendado';
      case 'EM_DESLOCAMENTO': return 'Técnico a caminho';
      case 'EM_EXECUCAO': return 'Em atendimento';
      case 'CONCLUIDO': return 'Concluído';
      case 'CANCELADO': return 'Cancelado';
      default: return status || 'Solicitado';
    }
  }

  public selectCategory(cat: ServiceCategory) {
    this.selectedCategory.set(cat);
    this.serviceDescription.set('');
  }

  public cancelSelection() {
    this.selectedCategory.set(null);
  }

  public async submitRequest() {
    const cat = this.selectedCategory();
    const desc = this.serviceDescription().trim();

    if (!cat || !desc || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    try {
      const payload: any = {
        service_id: cat.rawService?._id || cat.id,
        notes: desc,
        current_status: 'SOLICITADO'
      };

      this.serviceOrderService.createServiceOrder(payload).subscribe({
        next: async (res) => {
          this.isSubmitting.set(false);
          this.selectedCategory.set(null);
          this.serviceDescription.set('');

          const toast = await this.toastController.create({
            message: 'Serviço solicitado com sucesso!',
            duration: 3000,
            color: 'success',
            position: 'bottom',
            icon: 'checkmark-circle-outline'
          });
          await toast.present();
          this.router.navigate(['/customer/orders']);
        },
        error: async (err) => {
          this.isSubmitting.set(false);
          console.error(err);
          const toast = await this.toastController.create({
            message: 'Não foi possível solicitar o serviço. Tente novamente.',
            duration: 4000,
            color: 'danger',
            position: 'bottom'
          });
          await toast.present();
        }
      });
    } catch (error) {
      this.isSubmitting.set(false);
    }
  }
}
