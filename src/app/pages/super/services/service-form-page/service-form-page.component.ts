import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ServiceFormComponent } from 'src/app/components/service-form/service-form.component';

@Component({
  selector: 'app-service-form-page',
  templateUrl: './service-form-page.component.html',
  standalone: true,
  imports: [
    CommonModule, ServiceFormComponent,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent
  ]
})
export class ServiceFormPageComponent implements OnInit {
  private serviceService = inject(ServiceService);
  private globalService = inject(GlobalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  serviceData = signal<ServiceItem | null>(null);
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  serviceId = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.serviceId.set(id);
      this.isEditMode.set(true);
      this.loadService(id);
    }
  }

  loadService(id: string) {
    this.isLoading.set(true);
    this.serviceService.getServices().subscribe({
      next: (res) => {
        if (res.success) {
          const found = res.data.find(s => s._id === id);
          if (found) {
            this.serviceData.set(found);
          } else {
            this.globalService.errorToast('Serviço não encontrado');
            this.router.navigateByUrl('/super-admin/services');
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.globalService.errorToast('Erro ao carregar serviço');
        this.isLoading.set(false);
        this.router.navigateByUrl('/super-admin/services');
      }
    });
  }

  onSave(payload: Partial<ServiceItem>) {
    this.isLoading.set(true);
    const id = this.serviceId();

    if (this.isEditMode() && id) {
      this.serviceService.updateService(id, payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.globalService.successToast('Serviço atualizado com sucesso!');
            this.router.navigateByUrl('/super-admin/services');
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.globalService.errorToast('Erro ao atualizar serviço');
          this.isLoading.set(false);
        }
      });
    } else {
      this.serviceService.createService(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.globalService.successToast('Serviço cadastrado com sucesso!');
            this.router.navigateByUrl('/super-admin/services');
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.globalService.errorToast('Erro ao cadastrar serviço');
          this.isLoading.set(false);
        }
      });
    }
  }

  onCancel() {
    this.router.navigateByUrl('/super-admin/services');
  }
}
