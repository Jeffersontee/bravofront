import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButtons, IonMenuButton, 
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonBadge, IonSegment, IonSegmentButton, 
  IonLabel, IonList, IonSkeletonText, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  buildOutline, locationOutline, timeOutline, alertCircleOutline, 
  checkmarkCircleOutline, documentTextOutline, carOutline, mapOutline,
  receiptOutline, calendarOutline, flashOutline, chevronForwardOutline
} from 'ionicons/icons';
import { ServiceOrder, ServiceOrderService } from 'src/app/services/service-order/service-order.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { Strings } from 'src/app/enum/strings';

@Component({
  selector: 'app-service-orders',
  templateUrl: './service-orders.page.html',
  styleUrls: ['./service-orders.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButtons, IonMenuButton, 
    IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonBadge, IonSegment, IonSegmentButton, 
    IonLabel, IonList, IonSkeletonText, IonRefresher, IonRefresherContent
  ]
})
export class ServiceOrdersPage implements OnInit {
  private serviceOrderService = inject(ServiceOrderService);
  private profileService = inject(ProfileService);

  orders = signal<ServiceOrder[]>([]);
  isLoading = signal<boolean>(true);
  selectedSegment = signal<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  
  Strings = Strings; // para uso no template

  // Métricas para os cards de resumo no topo
  totalCount = computed(() => this.orders().length);
  scheduledCount = computed(() => this.orders().filter(o => o.current_status === 'AGENDADO').length);
  inProgressCount = computed(() => this.orders().filter(o => 
    o.current_status === 'EM_DESLOCAMENTO' || o.current_status === 'CHECK_IN' || o.current_status === 'EM_EXECUCAO'
  ).length);
  completedCount = computed(() => this.orders().filter(o => o.current_status === 'CONCLUIDO').length);

  filteredOrders = computed(() => {
    const segment = this.selectedSegment();
    const allOrders = this.orders();
    
    if (segment === 'all') return allOrders;
    
    if (segment === 'pending') {
      return allOrders.filter(o => o.current_status === 'AGENDADO');
    }
    if (segment === 'in_progress') {
      return allOrders.filter(o => o.current_status === 'EM_DESLOCAMENTO' || o.current_status === 'CHECK_IN' || o.current_status === 'EM_EXECUCAO');
    }
    if (segment === 'completed') {
      return allOrders.filter(o => o.current_status === 'CONCLUIDO');
    }
    return allOrders;
  });

  constructor() {
    addIcons({
      buildOutline, locationOutline, timeOutline, alertCircleOutline, 
      checkmarkCircleOutline, documentTextOutline, carOutline, mapOutline,
      receiptOutline, calendarOutline, flashOutline, chevronForwardOutline
    });
  }

  ngOnInit() {
    this.loadOrders();
  }

  async loadOrders(event?: any) {
    this.isLoading.set(true);
    
    try {
      const userData = await this.profileService.getProfile() as any;
      const filters: { company_id?: string; collaborator_id?: string } = {};

      if (userData) {
        if (userData.type === Strings.COMPANY_OWNER_TYPE || userData.type === Strings.USER_TYPE) {
          filters.company_id = userData.company_id;
        } else if (userData.type === Strings.COLLABORATOR_TYPE || userData.type === 'collaborator') {
          filters.collaborator_id = userData._id;
        }
      }

      this.serviceOrderService.getServiceOrders(filters).subscribe({
        next: (res) => {
          if (res.success) {
            this.orders.set(res.data || []);
          }
          this.isLoading.set(false);
          if (event?.target) event.target.complete();
        },
        error: (err) => {
          console.error('Error fetching service orders', err);
          this.orders.set(this.getMockOrders());
          this.isLoading.set(false);
          if (event?.target) event.target.complete();
        }
      });
    } catch (e) {
      console.error('Error loading profile in service orders list', e);
      this.isLoading.set(false);
      if (event?.target) event.target.complete();
    }
  }

  segmentChanged(event: any) {
    this.selectedSegment.set(event.detail.value);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'AGENDADO': return 'medium';
      case 'EM_DESLOCAMENTO': return 'tertiary';
      case 'CHECK_IN': return 'warning';
      case 'EM_EXECUCAO': return 'warning';
      case 'CONCLUIDO': return 'success';
      case 'CANCELADO': return 'danger';
      default: return 'medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'AGENDADO': return 'Agendado';
      case 'EM_DESLOCAMENTO': return 'Em Deslocamento';
      case 'CHECK_IN': return 'Check-in Efetuado';
      case 'EM_EXECUCAO': return 'Em Execução';
      case 'CONCLUIDO': return 'Concluído';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  }

  getMockOrders(): ServiceOrder[] {
    return [
      {
        _id: '1',
        company_id: 'c1',
        unit_id: { name: 'Matriz - Centro' } as any,
        service_id: { name: 'Instalação de Câmera CFTV' } as any,
        scheduled_date: new Date().toISOString(),
        current_status: 'AGENDADO'
      },
      {
        _id: '2',
        company_id: 'c2',
        unit_id: { name: 'Filial - Zona Sul' } as any,
        service_id: { name: 'Manutenção de Ar Condicionado' } as any,
        scheduled_date: new Date().toISOString(),
        current_status: 'EM_EXECUCAO'
      },
      {
        _id: '3',
        company_id: 'c1',
        unit_id: { name: 'Matriz - Centro' } as any,
        service_id: { name: 'Cabeamento Estruturado' } as any,
        scheduled_date: new Date(Date.now() - 86400000).toISOString(),
        current_status: 'CONCLUIDO'
      }
    ];
  }
}
