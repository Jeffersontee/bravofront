import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { addCircleOutline } from 'ionicons/icons';
import { ServiceFormComponent } from 'src/app/components/service-form/service-form.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service',
  templateUrl: './service.page.html',
  styleUrls: ['./service.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons, IonMenuButton, CommonModule, ServiceFormComponent]
})
export class ServicesPage implements OnInit {
  private serviceService = inject(ServiceService);
  private globalService = inject(GlobalService);
  private router = inject(Router);

  services = signal<ServiceItem[]>([]);
  isModalOpen = signal<boolean>(false);
  editingService = signal<ServiceItem | null>(null);
  isEditMode = signal<boolean>(false);

  constructor() {
    addIcons({ addCircleOutline });
  }

  ngOnInit() {
    this.loadServices();
  }

  ionViewWillEnter() {
    if (this.router.url.includes('/services/create')) {
      this.openModal();
    }
  }

  loadServices() {
    this.serviceService.getServices().subscribe({
      next: (res) => {
        if (res.success) {
          this.services.set(res.data);
        }
      },
      error: () => this.globalService.errorToast('Erro ao carregar serviços')
    });
  }

  openModal(service?: ServiceItem) {
    if (service) {
      this.editingService.set(service);
      this.isEditMode.set(true);
    } else {
      this.editingService.set(null);
      this.isEditMode.set(false);
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    if (this.router.url.includes('/services/create')) {
      this.router.navigate(['/company/services'], { replaceUrl: true });
    }
  }

  onServiceSaved() {
    this.closeModal();
    this.loadServices();
  }

  deleteService(id: string) {
    // Add logic later if needed
  }
}
