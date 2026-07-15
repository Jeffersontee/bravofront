import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController, IonMenuButton } from '@ionic/angular/standalone';
import { VisitModalComponent } from 'src/app/components/visit-modal/visit-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
import { UnitService, Unit } from 'src/app/services/unit/unit.service';
import { ServiceOrderService, ServiceOrder } from 'src/app/services/service-order/service-order.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.page.html',
  styleUrls: ['./company-dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonMenuButton]
})
export class CompanyDashboardPage implements OnInit {
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);
  private serviceService = inject(ServiceService);
  private unitService = inject(UnitService);
  private serviceOrderService = inject(ServiceOrderService);
  private modalCtrl = inject(ModalController);
  private router = inject(Router);

  public companyId = signal<string>('');
  public company = signal<Company | null>(null);
  public services = signal<ServiceItem[]>([]);
  public units = signal<Unit[]>([]);
  public serviceOrders = signal<ServiceOrder[]>([]);

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
        // assuming service_id has category if populated, else this might be tricky without populated data
        // For simplicity, we just filter by string if it's there
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

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.companyId.set(id);
      this.loadCompanyData(id);
    }
  }

  loadCompanyData(companyId: string) {
    forkJoin({
      company: this.companyService.getCompanyById(companyId),
      services: this.serviceService.getServices(companyId),
      units: this.unitService.getUnits(companyId),
      orders: this.serviceOrderService.getServiceOrders(companyId)
    }).subscribe({
      next: (res) => {
        if (res.company.success) this.company.set(res.company.data);
        if (res.services.success) this.services.set(res.services.data);
        if (res.units.success) this.units.set(res.units.data);
        if (res.orders.success) this.serviceOrders.set(res.orders.data);
      },
      error: (err) => {
        console.error('Erro ao carregar dados da empresa:', err);
        // Redireciona para o dashboard principal se a empresa não for encontrada
        this.router.navigate(['/establishment-admin/dashboard']);
      }
    });
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
