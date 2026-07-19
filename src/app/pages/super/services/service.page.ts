import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { addCircleOutline, refreshOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service',
  templateUrl: './service.page.html',
  styleUrls: ['./service.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons, IonMenuButton, CommonModule]
})
export class ServicesPage implements OnInit {
  private serviceService = inject(ServiceService);
  private globalService = inject(GlobalService);
  private router = inject(Router);

  services = signal<ServiceItem[]>([]);
  isLoading = signal<boolean>(false);

  constructor() {
    addIcons({ addCircleOutline, refreshOutline });
  }

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.isLoading.set(true);
    this.serviceService.getServices().subscribe({
      next: (res) => {
        if (res.success) {
          this.services.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.globalService.errorToast('Erro ao carregar serviços');
        this.isLoading.set(false);
      }
    });
  }

  goToCreate() {
    this.router.navigateByUrl('/super-admin/services/create');
  }

  goToEdit(service: ServiceItem) {
    if (service && service._id) {
      this.router.navigateByUrl(`/super-admin/services/edit/${service._id}`);
    }
  }
}
