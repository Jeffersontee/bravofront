import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons,
  IonMenuButton, IonBadge, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
  IonSegment, IonSegmentButton, IonLabel, IonList, IonSkeletonText, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { ServiceOrderService, ServiceOrder } from 'src/app/services/service-order/service-order.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import {
  addCircleOutline, refreshOutline, locationOutline, timeOutline,
  documentTextOutline, chevronForwardOutline
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
    IonSegment, IonSegmentButton, IonLabel, IonList, IonSkeletonText, IonRefresher, IonRefresherContent
  ]
})
export class OrderListPageComponent implements OnInit {
  private serviceOrderService = inject(ServiceOrderService);
  private globalService = inject(GlobalService);
  private router = inject(Router);

  orders = signal<ServiceOrder[]>([]);
  isLoading = signal<boolean>(false);
  selectedSegment = signal<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  filteredOrders = computed(() => {
    const segment = this.selectedSegment();
    const allOrders = this.orders();

    if (segment === 'all') return allOrders;
    if (segment === 'pending') {
      return allOrders.filter(o => o.current_status === 'AGENDADO');
    }
    if (segment === 'in_progress') {
      return allOrders.filter(o =>
        o.current_status === 'EM_DESLOCAMENTO' || o.current_status === 'CHECK_IN' || o.current_status === 'EM_EXECUCAO'
      );
    }
    if (segment === 'completed') {
      return allOrders.filter(o => o.current_status === 'CONCLUIDO');
    }
    return allOrders;
  });

  constructor() {
    addIcons({
      addCircleOutline, refreshOutline, locationOutline, timeOutline,
      documentTextOutline, chevronForwardOutline
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

  goToCreate() {
    this.router.navigateByUrl('/super-admin/operational/orders/create');
  }

  goToEdit(order: ServiceOrder) {
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
