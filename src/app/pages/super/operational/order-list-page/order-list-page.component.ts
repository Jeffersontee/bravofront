import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton
} from '@ionic/angular/standalone';
import { ServiceOrderService, ServiceOrder } from 'src/app/services/service-order/service-order.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Router } from '@angular/router';
import { ServiceOrderListComponent } from 'src/app/components/service-order-list/service-order-list.component';
import { addIcons } from 'ionicons';
import { helpCircleOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-order-list-page',
  templateUrl: './order-list-page.component.html',
  styleUrls: ['./order-list-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
    ServiceOrderListComponent
  ]
})
export class OrderListPageComponent implements OnInit {
  private serviceOrderService = inject(ServiceOrderService);
  private globalService = inject(GlobalService);
  private router = inject(Router);

  orders = signal<ServiceOrder[]>([]);
  isLoading = signal<boolean>(false);

   constructor() {
      addIcons({ helpCircleOutline, personCircleOutline })
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

  goToCreate() {
    this.router.navigateByUrl('/super-admin/operational/orders/create');
  }

  goToDetails(order: ServiceOrder) {
    if (order._id) {
      this.router.navigateByUrl(`/service-orders/details/${order._id}`);
    }
  }

  goToEdit(data: { event: Event; order: ServiceOrder }) {
    data.event.stopPropagation();
    if (data.order._id) {
      this.router.navigateByUrl(`/super-admin/operational/orders/edit/${data.order._id}`);
    }
  }
}
