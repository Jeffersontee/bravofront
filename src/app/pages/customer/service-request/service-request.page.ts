import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { flashOutline, waterOutline, constructOutline, hardwareChipOutline, shieldCheckmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-service-request',
  templateUrl: './service-request.page.html',
  styleUrls: ['./service-request.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonBackButton, IonButtons, CommonModule, FormsModule]
})
export class ServiceRequestPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private serviceService = inject(ServiceService);
  private globalService = inject(GlobalService);

  serviceId: string | null = null;
  service = signal<ServiceItem | null>(null);
  requestDescription = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor() {
    addIcons({ flashOutline, waterOutline, constructOutline, hardwareChipOutline, shieldCheckmarkOutline });
  }

  ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get('id');
    if (this.serviceId) {
      this.loadServiceData();
    }
  }

  loadServiceData() {
    // We will just fetch all and find, or we should have a getById.
    // For now, let's fetch all services and find by id since we don't have a specific get service by id yet in frontend.
    this.serviceService.getServices().subscribe({
      next: (res) => {
        if (res.success) {
          const found = res.data.find(s => s._id === this.serviceId);
          if (found) {
            this.service.set(found);
          }
        }
      },
      error: () => this.globalService.errorToast('Erro ao carregar os dados do serviço')
    });
  }

  submitRequest() {
    if (!this.requestDescription().trim()) {
      this.globalService.errorToast('Por favor, descreva detalhadamente o problema/serviço.');
      return;
    }
    
    // Here we would call an OrderService to submit the service request.
    // As per the print, it's just the UI step for now.
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.globalService.successToast('Serviço solicitado com sucesso!');
      this.router.navigate(['/customer/home']); // go back home
    }, 1000);
  }
}
