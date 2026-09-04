import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon,
  IonButton, IonButtons, IonMenuButton, IonBadge, IonSkeletonText
} from '@ionic/angular/standalone';
import { ServiceOrderService, ServiceOrder } from 'src/app/services/service-order/service-order.service';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Strings } from 'src/app/enum/strings';
import { StatusUtil } from 'src/app/utils/status.util';
import { addIcons } from 'ionicons';
import {
  receiptOutline, calendarOutline, checkmarkCircleOutline, alertCircleOutline,
  listOutline, addCircleOutline, gridOutline, carOutline, flashOutline, pencilOutline,
  refreshOutline, businessOutline, constructOutline, chevronForwardOutline,
  timeOutline, personOutline, locationOutline, closeCircleOutline, arrowForwardOutline,
  shieldCheckmarkOutline, speedometerOutline, eyeOutline, filterOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-operational-panel',
  templateUrl: './operational-panel.component.html',
  styleUrls: ['./operational-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon,
    IonButton, IonButtons, IonMenuButton, IonBadge, IonSkeletonText
  ]
})
export class OperationalPanelComponent implements OnInit {
  private serviceOrderService = inject(ServiceOrderService);
  private companyService = inject(CompanyService);
  private globalService = inject(GlobalService);
  private router = inject(Router);

  orders = signal<ServiceOrder[]>([]);
  companies = signal<Company[]>([]);
  selectedCompanyId = signal<string>('ALL');
  isLoading = signal<boolean>(false);

  // Ordens filtradas pela empresa selecionada
  filteredOrders = computed(() => {
    const list = this.orders();
    const compId = this.selectedCompanyId();
    if (!compId || compId === 'ALL') {
      return list;
    }
    return list.filter(o => {
      const oCompId = typeof o.company_id === 'object' ? (o.company_id as any)?._id : o.company_id;
      return String(oCompId) === String(compId);
    });
  });

  // Métricas Operacionais Computadas
  totalCount = computed(() => this.filteredOrders().length);

  scheduledCount = computed(() => 
    this.filteredOrders().filter(o => 
      o.current_status === 'AGENDADO' || 
      o.current_status === 'SOLICITADO' || 
      o.current_status === 'DATA_SUGERIDA' || 
      o.current_status === 'APROVADO'
    ).length
  );

  inProgressCount = computed(() => 
    this.filteredOrders().filter(o =>
      o.current_status === 'EM_DESLOCAMENTO' || 
      o.current_status === 'CHECK_IN' || 
      o.current_status === 'EM_EXECUCAO' ||
      o.current_status === 'RELATORIO_CHECKOUT'
    ).length
  );

  completedCount = computed(() => 
    this.filteredOrders().filter(o => 
      o.current_status === 'CONCLUIDO' || 
      o.current_status === 'AVALIACAO'
    ).length
  );

  cancelledCount = computed(() => 
    this.filteredOrders().filter(o => 
      o.current_status === 'CANCELADO' || 
      o.current_status === 'RECUSADO'
    ).length
  );

  completionRate = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  recentOrders = computed(() => {
    return [...this.filteredOrders()]
      .sort((a, b) => new Date(b.scheduled_date || b.proposed_date || 0).getTime() - new Date(a.scheduled_date || a.proposed_date || 0).getTime())
      .slice(0, 6);
  });

  constructor() {
    addIcons({
      receiptOutline, calendarOutline, checkmarkCircleOutline, alertCircleOutline,
      listOutline, addCircleOutline, gridOutline, carOutline, flashOutline, pencilOutline,
      refreshOutline, businessOutline, constructOutline, chevronForwardOutline,
      timeOutline, personOutline, locationOutline, closeCircleOutline, arrowForwardOutline,
      shieldCheckmarkOutline, speedometerOutline, eyeOutline, filterOutline
    });
  }

  ngOnInit() {
    this.loadCompanies();
    this.loadStats();
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.companies.set(res.data);
        }
      },
      error: (err) => console.error('Erro ao carregar lista de empresas:', err)
    });
  }

  onCompanyChange(companyId: string) {
    this.selectedCompanyId.set(companyId || 'ALL');
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

  goToList(statusFilter?: string) {
    if (statusFilter) {
      this.router.navigate(['/super-admin/operational/orders'], { queryParams: { status: statusFilter } });
    } else {
      this.router.navigateByUrl('/super-admin/operational/orders');
    }
  }

  goToCreate() {
    this.router.navigateByUrl('/super-admin/operational/orders/create');
  }

  goToAgenda() {
    this.router.navigateByUrl('/super-admin/operational/agenda');
  }

  goToTechnicians() {
    this.router.navigate(['/super-admin/staff'], { queryParams: { role: 'technician' } });
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

  getCompanyName(order: ServiceOrder): string {
    if (order.company_id && typeof order.company_id === 'object') {
      return (order.company_id as any).name || 'Empresa Parceira';
    }
    return 'Empresa Parceira';
  }

  getServiceName(order: ServiceOrder): string {
    if (order.service_id && typeof order.service_id === 'object') {
      return (order.service_id as any).name || 'Serviço Técnico';
    }
    return 'Serviço Técnico';
  }

  getUnitName(order: ServiceOrder): string {
    if (order.unit_id && typeof order.unit_id === 'object') {
      return (order.unit_id as any).name || 'Unidade';
    }
    return 'Unidade';
  }

  getTechnicianName(order: ServiceOrder): string | null {
    if (order.collaborator_id && typeof order.collaborator_id === 'object') {
      return (order.collaborator_id as any).name || null;
    }
    return null;
  }
}
