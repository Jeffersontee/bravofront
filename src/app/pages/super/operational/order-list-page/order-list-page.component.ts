import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons,
  IonMenuButton, IonBadge, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
  IonSegment, IonSegmentButton, IonLabel, IonList, IonSkeletonText, IonRefresher, IonRefresherContent,
  IonSearchbar
} from '@ionic/angular/standalone';
import { ServiceOrderService, ServiceOrder } from 'src/app/services/service-order/service-order.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import {
  addCircleOutline, refreshOutline, locationOutline, timeOutline,
  documentTextOutline, chevronForwardOutline, pencilOutline,
  calendarOutline, flashOutline, checkmarkCircleOutline, receiptOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-list-page',
  templateUrl: './order-list-page.component.html',
  styleUrls: ['./order-list-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons,
    IonMenuButton, IonBadge, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
    IonSegment, IonSegmentButton, IonLabel, IonList, IonSkeletonText, IonRefresher, IonRefresherContent,
    IonSearchbar
  ]
})
export class OrderListPageComponent implements OnInit {
  private serviceOrderService = inject(ServiceOrderService);
  private globalService = inject(GlobalService);
  private router = inject(Router);

  orders = signal<ServiceOrder[]>([]);
  isLoading = signal<boolean>(false);
  selectedSegment = signal<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  searchQuery = signal<string>('');

  // Métricas de topo para o Super Admin
  totalCount = computed(() => this.orders().length);
  scheduledCount = computed(() => this.orders().filter(o => o.current_status === 'AGENDADO').length);
  inProgressCount = computed(() => this.orders().filter(o => 
    o.current_status === 'EM_DESLOCAMENTO' || o.current_status === 'CHECK_IN' || o.current_status === 'EM_EXECUCAO'
  ).length);
  completedCount = computed(() => this.orders().filter(o => o.current_status === 'CONCLUIDO').length);

  filteredOrders = computed(() => {
    const segment = this.selectedSegment();
    const query = this.searchQuery().toLowerCase().trim();
    let list = this.orders();

    if (segment === 'pending') {
      list = list.filter(o => o.current_status === 'AGENDADO');
    } else if (segment === 'in_progress') {
      list = list.filter(o =>
        o.current_status === 'EM_DESLOCAMENTO' || o.current_status === 'CHECK_IN' || o.current_status === 'EM_EXECUCAO'
      );
    } else if (segment === 'completed') {
      list = list.filter(o => o.current_status === 'CONCLUIDO');
    }

    if (query) {
      list = list.filter(o => {
        const serviceName = (o.service_id as any)?.name || '';
        const companyName = (o.company_id as any)?.name || '';
        const unitName = (o.unit_id as any)?.name || '';
        const statusLabel = this.getStatusLabel(o.current_status) || '';

        return serviceName.toLowerCase().includes(query) ||
               companyName.toLowerCase().includes(query) ||
               unitName.toLowerCase().includes(query) ||
               statusLabel.toLowerCase().includes(query);
      });
    }

    return list;
  });

  constructor() {
    addIcons({
      addCircleOutline, refreshOutline, locationOutline, timeOutline,
      documentTextOutline, chevronForwardOutline, pencilOutline,
      calendarOutline, flashOutline, checkmarkCircleOutline, receiptOutline
    });
  }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(event?: any) {
    this.isLoading.set(true);
    this.serviceOrderService.getServiceOrders().subscribe({
      next: (res) => {
        if (res.success) {
          this.orders.set(res.data || []);
        }
        this.isLoading.set(false);
        if (event?.target) event.target.complete();
      },
      error: () => {
        this.globalService.errorToast('Erro ao carregar ordens de serviço');
        this.isLoading.set(false);
        if (event?.target) event.target.complete();
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedSegment.set(event.detail.value);
  }

  onSearchInput(event: any) {
    this.searchQuery.set(event.target.value || '');
  }

  goToCreate() {
    this.router.navigateByUrl('/super-admin/operational/orders/create');
  }

  goToDetails(order: ServiceOrder) {
    if (order._id) {
      this.router.navigateByUrl(`/service-orders/details/${order._id}`);
    }
  }

  goToEdit(event: Event, order: ServiceOrder) {
    event.stopPropagation();
    if (order._id) {
      this.router.navigateByUrl(`/super-admin/operational/orders/edit/${order._id}`);
    }
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
      case 'CHECK_IN': return 'Check-in';
      case 'EM_EXECUCAO': return 'Em Execução';
      case 'CONCLUIDO': return 'Concluído';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  }
}
