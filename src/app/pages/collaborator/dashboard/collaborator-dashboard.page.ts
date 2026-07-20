import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, 
  IonCardContent, IonLabel, IonIcon, IonList, IonItem, IonBadge, IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircleOutline, receiptOutline, documentTextOutline, timeOutline, 
  mapOutline, statsChartOutline, carOutline, cashOutline, constructOutline,
  businessOutline
} from 'ionicons/icons';
import { ServiceOrderService, ServiceOrder } from 'src/app/services/service-order/service-order.service';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
  selector: 'app-collaborator-dashboard',
  templateUrl: './collaborator-dashboard.page.html',
  styleUrls: ['./collaborator-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, 
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, 
    IonCardContent, IonLabel, IonIcon, IonList, IonItem, IonBadge, IonButton
  ]
})
export class CollaboratorDashboardPage implements OnInit {
  private serviceOrderService = inject(ServiceOrderService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  public orders = signal<ServiceOrder[]>([]);
  public isLoading = signal<boolean>(true);

  // KPIs calculados via Signals
  public totalVisits = computed(() => this.orders().length);
  
  public completedVisits = computed(() => 
    this.orders().filter(o => o.current_status === 'CONCLUIDO').length
  );

  public reportsSent = computed(() => 
    this.orders().filter(o => o.current_status === 'CONCLUIDO' && o.report_pdf_url).length
  );

  public pendingVisits = computed(() => 
    this.orders().filter(o => 
      o.current_status === 'AGENDADO' || 
      o.current_status === 'EM_DESLOCAMENTO' || 
      o.current_status === 'CHECK_IN' || 
      o.current_status === 'EM_EXECUCAO'
    ).length
  );

  // Unidades com mais chamados
  public topUnits = computed(() => {
    const counts: { [key: string]: { name: string; count: number } } = {};
    
    this.orders().forEach(o => {
      const unit = o.unit_id as any;
      if (unit && unit.name) {
        if (!counts[unit._id]) {
          counts[unit._id] = { name: unit.name, count: 0 };
        }
        counts[unit._id].count++;
      }
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  });

  // Rotas fixas mockadas (baseado no protótipo)
  public fixedRoutes = signal([
    { day: 'Segunda-feira', destination: 'Matriz Centro e Filial Lapa' },
    { day: 'Quarta-feira', destination: 'Filial Zona Sul e Centro Distribuição' },
    { day: 'Sexta-feira', destination: 'Filial Santana e Jabaquara' }
  ]);

  constructor() {
    addIcons({
      checkmarkCircleOutline, receiptOutline, documentTextOutline, timeOutline, 
      mapOutline, statsChartOutline, carOutline, cashOutline, constructOutline,
      businessOutline
    });
  }

  ngOnInit() {
    this.loadCollaboratorStats();
  }

  async loadCollaboratorStats() {
    this.isLoading.set(true);
    try {
      const profile = await this.profileService.getProfile();
      if (profile && (profile as any)._id) {
        this.serviceOrderService.getServiceOrders({ collaborator_id: (profile as any)._id }).subscribe({
          next: (res) => {
            if (res.success) {
              this.orders.set(res.data || []);
            }
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Error loading collaborator dashboard orders', err);
            this.orders.set(this.getMockOrders());
            this.isLoading.set(false);
          }
        });
      } else {
        this.orders.set(this.getMockOrders());
        this.isLoading.set(false);
      }
    } catch (e) {
      console.error('Error loading profile in collaborator dashboard', e);
      this.orders.set(this.getMockOrders());
      this.isLoading.set(false);
    }
  }

  navigateToOrders() {
    this.router.navigate(['/collaborator/orders']);
  }

  private getMockOrders(): ServiceOrder[] {
    return [
      {
        _id: '1',
        company_id: { name: 'Empresa Alfa' } as any,
        unit_id: { _id: 'u1', name: 'Santana' } as any,
        service_id: { name: 'Instalação de Câmera CFTV' } as any,
        scheduled_date: new Date().toISOString(),
        current_status: 'CONCLUIDO',
        report_pdf_url: 'http://example.com/report1.pdf'
      },
      {
        _id: '2',
        company_id: { name: 'Empresa Beta' } as any,
        unit_id: { _id: 'u2', name: 'Vila Prudente' } as any,
        service_id: { name: 'Manutenção de Ar Condicionado' } as any,
        scheduled_date: new Date().toISOString(),
        current_status: 'CONCLUIDO',
        report_pdf_url: 'http://example.com/report2.pdf'
      },
      {
        _id: '3',
        company_id: { name: 'Empresa Alfa' } as any,
        unit_id: { _id: 'u3', name: 'Jabaquara' } as any,
        service_id: { name: 'Cabeamento Estruturado' } as any,
        scheduled_date: new Date().toISOString(),
        current_status: 'AGENDADO'
      }
    ];
  }
}
