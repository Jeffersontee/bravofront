import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, 
  IonButton, IonButtons, IonMenuButton, IonGrid, IonRow, IonCol, IonCard, IonCardContent 
} from '@ionic/angular/standalone';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { 
  constructOutline, flashOutline, waterOutline, listOutline, 
  addCircleOutline, statsChartOutline, cashOutline, gridOutline 
} from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service-panel',
  templateUrl: './service-panel.component.html',
  styleUrls: ['./service-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, 
    IonButton, IonButtons, IonMenuButton, IonGrid, IonRow, IonCol, IonCard, IonCardContent
  ]
})
export class ServicePanelComponent implements OnInit {
  private serviceService = inject(ServiceService);
  private globalService = inject(GlobalService);
  private router = inject(Router);

  services = signal<ServiceItem[]>([]);
  isLoading = signal<boolean>(false);

  totalCount = signal<number>(0);
  categoriesCount = signal<number>(0);
  avgPrice = signal<number>(0);

  constructor() {
    addIcons({ 
      constructOutline, flashOutline, waterOutline, listOutline, 
      addCircleOutline, statsChartOutline, cashOutline, gridOutline 
    });
  }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    this.serviceService.getServices().subscribe({
      next: (res) => {
        if (res.success) {
          const list = res.data || [];
          this.services.set(list);
          
          this.totalCount.set(list.length);
          
          // Categorias únicas
          const cats = new Set(list.map(s => s.category));
          this.categoriesCount.set(cats.size);

          // Preço Médio
          if (list.length > 0) {
            const sum = list.reduce((acc, curr) => acc + (curr.price || 0), 0);
            this.avgPrice.set(sum / list.length);
          } else {
            this.avgPrice.set(0);
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.globalService.errorToast('Erro ao carregar dados do catálogo');
        this.isLoading.set(false);
      }
    });
  }

  goToList() {
    this.router.navigateByUrl('/super-admin/services');
  }

  goToCreate() {
    this.router.navigateByUrl('/super-admin/services/create');
  }
}
