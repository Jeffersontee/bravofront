import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonTitle, IonButton, 
  IonIcon, IonGrid, IonRow, IonCol, ToastController, ModalController, IonSpinner, IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  flashOutline, hammerOutline, waterOutline, constructOutline,
  wifiOutline, shieldCheckmarkOutline, locationOutline, chevronBackOutline, 
  construct, chevronForwardOutline, documentTextOutline, checkmarkCircleOutline,
  searchOutline, closeCircleOutline, calendarOutline, timeOutline, alertCircleOutline,
  navigateOutline, mapOutline
} from 'ionicons/icons';
import { registerServiceIcons, SERVICE_AVAILABLE_ICONS } from 'src/app/utils/service-icons';
import { ThemeService } from '../../../services/theme/theme.service';
import { ServiceService } from '../../../services/service/service.service';
import { ServiceOrderService } from '../../../services/service-order/service-order.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { AddressService } from '../../../services/address/address.service';
import { AddressModalComponent } from '../../../components/address-modal/address-modal.component';
import { Address } from '../../../models/address.model';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  priceText: string;
  priceValue: number;
  category: string;
  iconName: string;
  bgColor: string;
  iconColor: string;
  rawService?: any;
}

export type PriorityLevel = 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAIXA';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonTitle, IonButton, IonIcon, 
    IonGrid, IonRow, IonCol, IonSpinner, IonSkeletonText
  ]
})
export class HomePage implements OnInit {
  private router = inject(Router);
  private toastController = inject(ToastController);
  private modalCtrl = inject(ModalController);
  public themeService = inject(ThemeService);
  private serviceService = inject(ServiceService);
  private serviceOrderService = inject(ServiceOrderService);
  private profileService = inject(ProfileService);
  public addressService = inject(AddressService);

  public isLoadingServices = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public categoriesSignal = signal<ServiceCategory[]>([]);
  public customerOrders = signal<any[]>([]);

  // Search & Category Filters (idêntico ao catálogo do Super Admin)
  public searchTerm = signal<string>('');
  public selectedCategoryFilter = signal<string>('ALL');

  // Solicitação de Serviço
  public selectedService = signal<ServiceCategory | null>(null);
  public serviceDescription = signal<string>('');
  public suggestedDate = signal<string>('');
  public selectedPriority = signal<PriorityLevel>('MEDIA');

  public activeOrders = computed(() => {
    return this.customerOrders().filter(o => o.status !== 'Concluído' && o.status !== 'Cancelado');
  });

  public customerName = computed(() => this.profileService.profile()?.name || 'Cliente');
  
  public currentAddressDisplay = computed(() => {
    const active = this.addressService.activeAddress();
    if (active && active.address) {
      return `${active.title}: ${active.address}`;
    }
    return 'Selecione seu endereço de atendimento';
  });

  // Categorias disponíveis para os Chips
  public availableCategories = computed(() => {
    const cats = new Set<string>();
    this.categoriesSignal().forEach(s => {
      if (s.category && s.category.trim() !== '') {
        cats.add(s.category);
      }
    });
    return Array.from(cats);
  });

  // Lista filtrada em tempo real por busca e categoria
  public filteredServices = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const cat = this.selectedCategoryFilter();

    return this.categoriesSignal().filter(service => {
      const matchesSearch = !search ||
        service.name.toLowerCase().includes(search) ||
        service.description.toLowerCase().includes(search) ||
        (service.category && service.category.toLowerCase().includes(search));

      const matchesCat = cat === 'ALL' || service.category === cat;
      return matchesSearch && matchesCat;
    });
  });

  constructor() {
    registerServiceIcons();
    addIcons({ 
      flashOutline, hammerOutline, waterOutline, constructOutline, chevronForwardOutline,
      wifiOutline, shieldCheckmarkOutline, locationOutline, chevronBackOutline, 
      construct, documentTextOutline, checkmarkCircleOutline, searchOutline,
      closeCircleOutline, calendarOutline, timeOutline, alertCircleOutline,
      navigateOutline, mapOutline
    });
  }

  async ngOnInit() {
    this.themeService.loadAppearance('GLOBAL');
    this.initDefaultSuggestedDate();
    await this.addressService.loadUserAddresses();
    this.loadCatalogServices();
    this.loadCustomerOrders();
  }

  private initDefaultSuggestedDate() {
    // Data sugerida inicial: amanhã no mesmo horário formatada como YYYY-MM-DDTHH:mm
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(9, 0, 0, 0); // 09:00 AM
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    this.suggestedDate.set(localISOTime);
  }

  public onSearchInput(event: any) {
    this.searchTerm.set(event.target.value || '');
  }

  public onCategorySelect(cat: string) {
    this.selectedCategoryFilter.set(cat);
  }

  public clearFilters() {
    this.searchTerm.set('');
    this.selectedCategoryFilter.set('ALL');
  }

  loadCatalogServices() {
    this.isLoadingServices.set(true);
    this.serviceService.getServices().subscribe({
      next: (res) => {
        this.isLoadingServices.set(false);
        if (res?.success && res?.data && res.data.length > 0) {
          const mapped: ServiceCategory[] = res.data.map((srv: any) => ({
            id: srv._id,
            name: srv.name,
            description: srv.description || srv.category || 'Serviço técnico especializado',
            priceText: srv.price ? `a partir de R$ ${Number(srv.price).toFixed(2).replace('.', ',')}` : 'a partir de R$ 150,00',
            priceValue: srv.price || 150,
            category: srv.category || 'Geral',
            iconName: srv.icon || this.getCategoryIcon(srv.category || srv.name),
            bgColor: this.getCategoryBgColor(srv.category || srv.name),
            iconColor: this.getCategoryIconColor(srv.category || srv.name),
            rawService: srv
          }));
          this.categoriesSignal.set(mapped);
        } else {
          this.categoriesSignal.set(this.defaultCategories);
        }
      },
      error: (err) => {
        this.isLoadingServices.set(false);
        console.error('Erro ao carregar catálogo de serviços:', err);
        this.categoriesSignal.set(this.defaultCategories);
      }
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
            rawStatus: order.current_status,
            finalValue: order.client_price || 0,
            initialEstimate: 150,
            estimatedDistanceKm: order.estimated_distance_km,
            estimatedDurationMin: order.estimated_duration_min
          }));
          this.customerOrders.set(mapped);
        }
      },
      error: (err) => console.error('Erro ao carregar ordens do cliente:', err)
    });
  }

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

  public navigateToOrders() {
    this.router.navigate(['/customer/orders']);
  }

  public navigateToOrderDetails(orderId: string) {
    if (orderId) {
      this.router.navigate(['/customer/orders/details', orderId]);
    } else {
      this.router.navigate(['/customer/orders']);
    }
  }

  public defaultCategories: ServiceCategory[] = [
    {
      id: 'eletrica',
      name: 'Elétrica Residencial / Comercial',
      description: 'Disjuntores, tomadas, iluminação, quadros e instalações',
      priceText: 'a partir de R$ 150,00',
      priceValue: 150,
      category: 'Elétrica',
      iconName: 'flash-outline',
      bgColor: '#eff6ff',
      iconColor: '#3b82f6'
    },
    {
      id: 'civil',
      name: 'Construção Civil e Reformas',
      description: 'Pintura, drywall, pisos, reparos e alvenaria',
      priceText: 'a partir de R$ 200,00',
      priceValue: 200,
      category: 'Civil',
      iconName: 'hammer-outline',
      bgColor: '#fef3c7',
      iconColor: '#d97706'
    },
    {
      id: 'hidraulica',
      name: 'Instalações Hidráulicas',
      description: 'Vazamentos, torneiras, registros, encanamentos e esgoto',
      priceText: 'a partir de R$ 120,00',
      priceValue: 120,
      category: 'Hidráulica',
      iconName: 'water-outline',
      bgColor: '#ecfeff',
      iconColor: '#0891b2'
    },
    {
      id: 'serralheria',
      name: 'Serralheria e Estruturas',
      description: 'Portões automáticos, grades, fechaduras e soldas',
      priceText: 'a partir de R$ 180,00',
      priceValue: 180,
      category: 'Serralheria',
      iconName: 'construct-outline',
      bgColor: '#f1f5f9',
      iconColor: '#475569'
    },
    {
      id: 'rede',
      name: 'Rede, Wi-Fi e CFTV',
      description: 'Cabeamento estruturado, câmeras de segurança, roteadores',
      priceText: 'a partir de R$ 160,00',
      priceValue: 160,
      category: 'Rede e Tecnologia',
      iconName: 'wifi-outline',
      bgColor: '#ecfdf5',
      iconColor: '#059669'
    },
    {
      id: 'preventivo',
      name: 'Manutenção Preventiva e Laudos',
      description: 'Check-up completo de segurança e plano de manutenção predial',
      priceText: 'a partir de R$ 250,00',
      priceValue: 250,
      category: 'Preventivo',
      iconName: 'shield-checkmark-outline',
      bgColor: '#f5f3ff',
      iconColor: '#7c3aed'
    }
  ];

  formatStatus(status: string): string {
    switch (status) {
      case 'SOLICITADO': return 'Solicitado';
      case 'AGENDADO': return 'Agendado';
      case 'EM_DESLOCAMENTO': return 'Técnico a caminho';
      case 'CHECK_IN': return 'Técnico no local';
      case 'EM_EXECUCAO': return 'Em atendimento';
      case 'CONCLUIDO': return 'Concluído';
      case 'CANCELADO': return 'Cancelado';
      default: return status || 'Solicitado';
    }
  }

  public selectService(service: ServiceCategory) {
    this.selectedService.set(service);
    this.serviceDescription.set('');
    this.selectedPriority.set('MEDIA');
    this.initDefaultSuggestedDate();
  }

  public cancelSelection() {
    this.selectedService.set(null);
  }

  public setPriority(p: PriorityLevel) {
    this.selectedPriority.set(p);
  }

  public async openAddressModal() {
    const modal = await this.modalCtrl.create({
      component: AddressModalComponent,
      breakpoints: [0, 0.6, 0.95],
      initialBreakpoint: 0.95
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data._id) {
      this.addressService.changeActiveAddress(data);
    }
  }

  public async submitRequest() {
    const service = this.selectedService();
    const desc = this.serviceDescription().trim();
    const activeAddress = this.addressService.activeAddress();

    if (!service || !desc || this.isSubmitting()) return;

    if (!activeAddress) {
      const toast = await this.toastController.create({
        message: 'Por favor, selecione ou cadastre o endereço para execução do serviço.',
        duration: 3500,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      this.openAddressModal();
      return;
    }

    this.isSubmitting.set(true);

    // Mapeia prioridade para matriz GUT
    let gravity = 3;
    let urgency = 3;
    let trend = 3;
    switch (this.selectedPriority()) {
      case 'URGENTE':
        gravity = 5;
        urgency = 5;
        trend = 5;
        break;
      case 'ALTA':
        gravity = 4;
        urgency = 4;
        trend = 4;
        break;
      case 'MEDIA':
        gravity = 3;
        urgency = 3;
        trend = 3;
        break;
      case 'BAIXA':
        gravity = 2;
        urgency = 2;
        trend = 2;
        break;
    }

    try {
      const payload: any = {
        service_id: service.rawService?._id || service.id,
        address_id: activeAddress._id,
        address_override: activeAddress.address,
        scheduled_date: this.suggestedDate() ? new Date(this.suggestedDate()) : new Date(),
        notes: desc,
        current_status: 'SOLICITADO',
        gut_gravity: gravity,
        gut_urgency: urgency,
        gut_trend: trend,
        client_price: service.priceValue
      };

      this.serviceOrderService.createServiceOrder(payload).subscribe({
        next: async (res) => {
          this.isSubmitting.set(false);
          this.selectedService.set(null);
          this.serviceDescription.set('');

          const toast = await this.toastController.create({
            message: 'Serviço solicitado com sucesso! Acompanhe o status pelo painel.',
            duration: 3500,
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
