import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon,
  IonButton, IonButtons, IonMenuButton, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonBadge
} from '@ionic/angular/standalone';
import { ServiceOrderService, ServiceOrder } from 'src/app/services/service-order/service-order.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Strings } from 'src/app/enum/strings';
import { StatusUtil } from 'src/app/utils/status.util';
import { addIcons } from 'ionicons';
import {
  receiptOutline, calendarOutline, checkmarkCircleOutline, alertCircleOutline,
  listOutline, addCircleOutline, gridOutline, carOutline, flashOutline, pencilOutline
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
      listOutline, addCircleOutline, gridOutline, carOutline, flashOutline, pencilOutline
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

  goToDetails(order: ServiceOrder) {
    if (order._id) {
      this.router.navigateByUrl(`${Strings.SUPER_OPERATIONAL_ORDERS_DETAILS}/${order._id}`);
    }
  }

  goToEdit(event: Event, order: ServiceOrder) {
    event.stopPropagation();
    if (order._id) {
      this.router.navigateByUrl(`/super-admin/operational/orders/edit/${order._id}`);
    }
  }

  getStatusColor(status: string): string {
    return StatusUtil.getStatusColor(status);
  }

  getStatusLabel(status: string): string {
    return StatusUtil.getStatusLabel(status);
  }
}
