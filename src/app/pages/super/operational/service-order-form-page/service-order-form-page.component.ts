import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceOrderService } from 'src/app/services/service-order/service-order.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ServiceOrderFormComponent } from 'src/app/components/service-order-form/service-order-form.component';
import { addIcons } from 'ionicons';
import {
  helpCircleOutline,
  personCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-service-order-form-page',
  templateUrl: './service-order-form-page.component.html',
  standalone: true,
  imports: [
    CommonModule, ServiceOrderFormComponent,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent
  ]
})
export class ServiceOrderFormPageComponent implements OnInit {
  private serviceOrderService = inject(ServiceOrderService);
  private globalService = inject(GlobalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orderData = signal<any>(null);
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  orderId = signal<string | null>(null);

  constructor() {
    addIcons({
      helpCircleOutline, personCircleOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(id);
      this.isEditMode.set(true);
      this.loadOrder(id);
    }
  }

  loadOrder(id: string) {
    this.isLoading.set(true);
    this.serviceOrderService.getServiceOrderById(id).subscribe({
      next: (res) => {
        const found = res.data;
        if (found) {
          this.orderData.set(found);
        } else {
          this.globalService.errorToast('Ordem de serviço não encontrada');
          this.router.navigateByUrl('/super-admin/operational/orders');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.globalService.errorToast('Erro ao carregar ordem de serviço');
        this.isLoading.set(false);
        this.router.navigateByUrl('/super-admin/operational/orders');
      }
    });
  }

  onSave(payload: any) {
    this.isLoading.set(true);
    const id = this.orderId();

    if (this.isEditMode() && id) {
      this.serviceOrderService.updateServiceOrder(id, payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.globalService.successToast('Ordem de serviço atualizada!');
            this.router.navigateByUrl('/super-admin/operational/orders');
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.globalService.errorToast('Erro ao atualizar ordem de serviço');
          this.isLoading.set(false);
        }
      });
    } else {
      this.serviceOrderService.createServiceOrder(payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.globalService.successToast('Ordem de serviço agendada com sucesso!');
            this.router.navigateByUrl('/super-admin/operational/orders');
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.globalService.errorToast('Erro ao agendar ordem de serviço');
          this.isLoading.set(false);
        }
      });
    }
  }

  onCancel() {
    this.router.navigateByUrl('/super-admin/operational/orders');
  }
}
