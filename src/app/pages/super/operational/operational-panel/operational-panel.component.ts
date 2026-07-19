import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon,
  IonButton, IonButtons, IonMenuButton, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonBadge
} from '@ionic/angular/standalone';
import { ServiceOrderService, ServiceOrder } from 'src/app/services/service-order/service-order.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import {
  receiptOutline, calendarOutline, checkmarkCircleOutline, alertCircleOutline,
  listOutline, addCircleOutline, gridOutline, carOutline, flashOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-operational-panel',
  templateUrl: './operational-panel.component.html',
  styleUrls: ['./operational-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon,
    IonButton, IonButtons, IonMenuButton, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonBadge
  ]
})
export class OperationalPanelComponent implements OnInit {
  private serviceOrderService = inject(ServiceOrderService);
  private globalService = inject(GlobalService);
  private router = inject(Router);

  orders = signal<ServiceOrder[]>([]);
  isLoading = signal<boolean>(false);

  totalCount = computed(() => this.orders().length);
  scheduledCount = computed(() => this.orders().filter(o => o.current_status === 'AGENDADO').length);
  inProgressCount = computed(() => this.orders().filter(o =>
    o.current_status === 'EM_DESLOCAMENTO' || o.current_status === 'CHECK_IN' || o.current_status === 'EM_EXECUCAO'
  ).length);
  completedCount = computed(() => this.orders().filter(o => o.current_status === 'CONCLUIDO').length);
  cancelledCount = computed(() => this.orders().filter(o => o.current_status === 'CANCELADO').length);

  recentOrders = computed(() => {
    return [...this.orders()]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  });

  constructor() {
    addIcons({
      receiptOutline, calendarOutline, checkmarkCircleOutline, alertCircleOutline,
      listOutline, addCircleOutline, gridOutline, carOutline, flashOutline
    });
  }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    this.serviceOrderService.getServiceOrders().subscribe({
      next: (res) => {
        if (res.success) {
          this.orders.set(res.data || []);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.globalService.errorToast('Erro ao carregar dados operacionais');
        this.isLoading.set(false);
      }
    });
  }

  goToList() {
    this.router.navigateByUrl('/super-admin/operational/orders');
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
