import { Component, OnInit, inject, signal, computed, effect, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, ModalController, IonMenuButton, IonIcon, IonSpinner,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addCircleOutline, wifiOutline, refreshOutline, 
  alertCircleOutline, searchOutline, calendarOutline,
  businessOutline, clipboardOutline, checkmarkCircleOutline,
  timeOutline, trendingUpOutline, peopleOutline
} from 'ionicons/icons';
import { VisitModalComponent } from 'src/app/components/visit-modal/visit-modal.component';
import { GlobalDateFilterComponent } from 'src/app/components/global-date-filter/global-date-filter.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
import { UnitService, Unit } from 'src/app/services/unit/unit.service';
import { ServiceOrderService, ServiceOrder } from 'src/app/services/service-order/service-order.service';
import { DateFilterService } from 'src/app/services/date-filter/date-filter.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { forkJoin } from 'rxjs';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  DoughnutController,
  ArcElement
} from 'chart.js';

Chart.register(
  BarController, BarElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend
);

@Component({
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.page.html',
  styleUrls: ['./company-dashboard.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonIcon, IonContent, IonSpinner, CommonModule, FormsModule, 
    IonMenuButton, GlobalDateFilterComponent
  ]
})
export class CompanyDashboardPage implements OnInit {
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);
  private serviceService = inject(ServiceService);
  private unitService = inject(UnitService);
  private serviceOrderService = inject(ServiceOrderService);
  private modalCtrl = inject(ModalController);
  private router = inject(Router);
  public dateFilterService = inject(DateFilterService);
  private profileService = inject(ProfileService);

  @ViewChild('monthlyChartCanvas') monthlyChartRef!: ElementRef;
  @ViewChild('servicesChartCanvas') servicesChartRef!: ElementRef;
  @ViewChild('statusChartCanvas') statusChartRef!: ElementRef;

  private monthlyChart: Chart | null = null;
  private servicesChart: Chart | null = null;
  private statusChart: Chart | null = null;

  public companyId = signal<string>('');
  public company = signal<Company | null>(null);
  public services = signal<ServiceItem[]>([]);
  public units = signal<Unit[]>([]);
  public serviceOrders = signal<ServiceOrder[]>([]);

  public isLoading = signal<boolean>(false);
  public hasConnectionError = signal<boolean>(false);
  public isDashboardView = signal<boolean>(false);

  // Filters
  public filterUnit = signal<string>('Todas');
  public filterStatus = signal<string>('Todos');
  public filterCategory = signal<string>('Todas');
  public filterSearch = signal<string>('');

  public legendColors = ['bg-yellow', 'bg-blue', 'bg-grey', 'bg-red', 'bg-dark'];

  public filteredOrders = computed(() => {
    let orders = this.serviceOrders();
    const fUnit = this.filterUnit();
    const fStatus = this.filterStatus();
    const fCat = this.filterCategory();
    const fSearch = this.filterSearch().toLowerCase();

    if (fUnit !== 'Todas') {
      orders = orders.filter(o => {
        const uId = typeof o.unit_id === 'object' ? (o.unit_id as any)._id : o.unit_id;
        return uId === fUnit;
      });
    }

    if (fStatus !== 'Todos') {
      orders = orders.filter(o => o.current_status === fStatus);
    }

    if (fCat !== 'Todas') {
      orders = orders.filter(o => {
        const sId = typeof o.service_id === 'object' ? (o.service_id as any).category : o.service_id;
        return sId === fCat;
      });
    }

    if (fSearch) {
      orders = orders.filter(o => {
        const unitName = typeof o.unit_id === 'object' ? (o.unit_id as any).name : '';
        return unitName.toLowerCase().includes(fSearch);
      });
    }

    return orders;
  });

  public stats = computed(() => {
    const orders = this.filteredOrders();
    const total = orders.length;
    const concluidas = orders.filter(o => o.current_status === 'CONCLUIDO').length;
    const pendentes = total - concluidas;
    const percent = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    
    let fuel = 0;
    let km = 0;
    
    orders.forEach(o => {
      if (o.fuel_cost) fuel += parseFloat(o.fuel_cost.replace(',', '.')) || 0;
      if (o.km_driven) km += parseFloat(o.km_driven.replace(',', '.')) || 0;
    });

    return { total, concluidas, pendentes, percent, fuel, km };
  });

  constructor() {
    addIcons({ 
      addCircleOutline, wifiOutline, refreshOutline, 
      alertCircleOutline, searchOutline, calendarOutline,
      businessOutline, clipboardOutline, checkmarkCircleOutline,
      timeOutline, trendingUpOutline, peopleOutline
    });
    
    effect(() => {
      const start = this.dateFilterService.startDate();
      const end = this.dateFilterService.endDate();
      const id = this.companyId();
      if (id) {
        this.loadCompanyData(id);
      }
    }, { allowSignalWrites: true });
  }

  async ngOnInit() {
    this.isDashboardView.set(this.router.url.includes('/dashboard'));
    let id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      try {
        const user = await this.profileService.getProfile();
        if (user && user.company_id) {
          id = user.company_id;
        }
      } catch (e) {
        console.error('Erro ao buscar perfil do usuário no dashboard:', e);
      }
    }
    if (id) {
      this.companyId.set(id);
      this.loadCompanyData(id);
    }
  }

  loadCompanyData(companyId: string) {
    this.isDashboardView.set(this.router.url.includes('/dashboard'));
    this.isLoading.set(true);
    this.hasConnectionError.set(false);

    forkJoin({
      company: this.companyService.getCompanyById(companyId),
      services: this.serviceService.getServices(),
      units: this.unitService.getUnits(companyId),
      orders: this.serviceOrderService.getServiceOrders({ 
        company_id: companyId,
        start_date: this.dateFilterService.startDate(),
        end_date: this.dateFilterService.endDate()
      })
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.hasConnectionError.set(false);

        if (res.company?.success) {
          const comp = res.company.data;
          this.company.set(comp);
          
          if (res.services?.success) {
            const activeServiceIds = comp.services || [];
            const filtered = (res.services.data || []).filter(s => activeServiceIds.includes(s._id!));
            this.services.set(filtered);
          }
        }
        if (res.units?.success) this.units.set(res.units.data || []);
        if (res.orders?.success) {
          const ordersList = res.orders.data || [];
          this.serviceOrders.set(ordersList);
          if (this.isDashboardView()) {
            setTimeout(() => this.renderCharts(ordersList), 100);
          }
        }
      },
      error: (err) => {
        console.error('Erro ao carregar dados da empresa:', err);
        this.isLoading.set(false);

        if (err.status === 404) {
          this.router.navigate(['/company/dashboard']);
        } else {
          this.hasConnectionError.set(true);
        }
      }
    });
  }

  private renderCharts(orders: ServiceOrder[]) {
    if (!this.isDashboardView()) return;
    this.renderMonthlyChart(orders);
    this.renderServicesChart(orders);
    this.renderStatusChart(orders);
  }

  private renderServicesChart(orders: ServiceOrder[]) {
    if (!this.servicesChartRef) return;
    const ctx = this.servicesChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const counts: Record<string, number> = {};
    orders.forEach(o => {
      let name = 'Outros';
      if (typeof o.service_id === 'object' && o.service_id) {
        name = (o.service_id as any).name || (o.service_id as any).category || 'Outros';
      } else {
        const s = this.services().find(srv => srv._id === o.service_id);
        if (s) name = s.name;
      }
      counts[name] = (counts[name] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const values = Object.values(counts);
    const colors = ['#16a34a', '#ffc409', '#2563eb', '#7c3aed', '#dc2626', '#64748b'];

    if (this.servicesChart) this.servicesChart.destroy();

    this.servicesChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length > 0 ? labels : ['Sem ordens'],
        datasets: [{
          data: values.length > 0 ? values : [1],
          backgroundColor: labels.length > 0 ? colors.slice(0, labels.length) : ['#cbd5e1'],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, font: { family: "'Outfit', sans-serif", size: 11 } } },
          tooltip: { backgroundColor: '#1a1a1a', titleFont: { family: "'Outfit', sans-serif" }, bodyFont: { family: "'Outfit', sans-serif" } }
        }
      }
    });
  }

  private renderMonthlyChart(orders: ServiceOrder[]) {
    if (!this.monthlyChartRef) return;
    const ctx = this.monthlyChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Agrupa ordens por mês
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const totalByMonth = new Array(12).fill(0);
    const completedByMonth = new Array(12).fill(0);

    orders.forEach(o => {
      if (o.scheduled_date) {
        const d = new Date(o.scheduled_date);
        const m = d.getMonth();
        if (m >= 0 && m < 12) {
          totalByMonth[m]++;
          if (o.current_status === 'CONCLUIDO') {
            completedByMonth[m]++;
          }
        }
      }
    });

    if (this.monthlyChart) this.monthlyChart.destroy();

    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthNames,
        datasets: [
          {
            label: 'Total de Ordens',
            data: totalByMonth,
            backgroundColor: '#ffc409',
            borderRadius: 6
          },
          {
            label: 'Concluídas',
            data: completedByMonth,
            backgroundColor: '#16a34a',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: "'Outfit', sans-serif", size: 11 } } },
          tooltip: { backgroundColor: '#1a1a1a', titleFont: { family: "'Outfit', sans-serif" }, bodyFont: { family: "'Outfit', sans-serif" } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: "'Outfit', sans-serif", size: 11 } } },
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: "'Outfit', sans-serif", size: 11 }, stepSize: 1 } }
        }
      }
    });
  }

  private renderStatusChart(orders: ServiceOrder[]) {
    if (!this.statusChartRef) return;
    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const statusCounts: Record<string, number> = {
      'CONCLUIDO': 0,
      'AGENDADO': 0,
      'EM_EXECUCAO': 0,
      'SOLICITADO': 0,
      'EM_DESLOCAMENTO': 0,
      'CANCELADO': 0
    };

    orders.forEach(o => {
      const st = o.current_status || 'SOLICITADO';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    const labels = ['Concluído', 'Agendado', 'Em Execução', 'Solicitado', 'Em Deslocamento', 'Cancelado'];
    const values = [
      statusCounts['CONCLUIDO'],
      statusCounts['AGENDADO'],
      statusCounts['EM_EXECUCAO'],
      statusCounts['SOLICITADO'],
      statusCounts['EM_DESLOCAMENTO'],
      statusCounts['CANCELADO']
    ];
    const colors = ['#16a34a', '#2563eb', '#ffc409', '#64748b', '#7c3aed', '#dc2626'];

    if (this.statusChart) this.statusChart.destroy();

    this.statusChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Quantidade',
          data: values,
          backgroundColor: colors,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#1a1a1a', titleFont: { family: "'Outfit', sans-serif" }, bodyFont: { family: "'Outfit', sans-serif" } }
        },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: "'Outfit', sans-serif", size: 11 }, stepSize: 1 } },
          y: { grid: { display: false }, ticks: { font: { family: "'Outfit', sans-serif", size: 11 } } }
        }
      }
    });
  }

  retryLoad() {
    if (this.companyId()) {
      this.loadCompanyData(this.companyId());
    }
  }

  getUnitName(unitId: string | any): string {
    if (typeof unitId === 'object') return unitId.name || 'Unidade';
    const unit = this.units().find(u => u._id === unitId);
    return unit ? unit.name : 'Unidade';
  }

  getServiceBadge(serviceId: string | any): string {
    const sId = typeof serviceId === 'object' ? serviceId._id : serviceId;
    const sName = typeof serviceId === 'object' ? serviceId.name : 'SERVIÇO';
    
    const idx = this.services().findIndex(s => s._id === sId);
    const color = idx >= 0 ? this.legendColors[idx % this.legendColors.length] : 'bg-grey';
    return `<span class="badge-small ${color}">${sName.toUpperCase()}</span>`;
  }

  clearFilters() {
    this.filterUnit.set('Todas');
    this.filterStatus.set('Todos');
    this.filterCategory.set('Todas');
    this.filterSearch.set('');
  }

  async openCreateVisitModal() {
    const modal = await this.modalCtrl.create({
      component: VisitModalComponent,
      componentProps: {
        company: this.company(),
        units: this.units(),
        services: this.services()
      },
      cssClass: 'custom-visit-modal'
    });
    
    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.refresh) {
        this.loadCompanyData(this.companyId());
      }
    });

    return await modal.present();
  }

  async openEditVisitModal(order: ServiceOrder) {
    const modal = await this.modalCtrl.create({
      component: VisitModalComponent,
      componentProps: {
        company: this.company(),
        units: this.units(),
        services: this.services(),
        serviceOrder: order
      },
      cssClass: 'custom-visit-modal'
    });
    
    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.refresh) {
        this.loadCompanyData(this.companyId());
      }
    });

    return await modal.present();
  }
}
