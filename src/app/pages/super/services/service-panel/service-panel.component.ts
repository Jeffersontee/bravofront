import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, 
  IonButton, IonButtons, IonMenuButton, IonSkeletonText
} from '@ionic/angular/standalone';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { 
  listOutline, addCircleOutline, statsChartOutline, cashOutline, gridOutline,
  refreshOutline, businessOutline, constructOutline, chevronForwardOutline,
  pricetagOutline, checkmarkCircleOutline, sparklesOutline, arrowForwardOutline,
  pencilOutline, layersOutline, searchOutline, shieldCheckmarkOutline, walletOutline
} from 'ionicons/icons';
import { registerServiceIcons } from 'src/app/utils/service-icons';
import { Router } from '@angular/router';

export interface CategoryStat {
  name: string;
  count: number;
  avgPrice: number;
}

@Component({
  selector: 'app-service-panel',
  templateUrl: './service-panel.component.html',
  styleUrls: ['./service-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, 
    IonButton, IonButtons, IonMenuButton, IonSkeletonText
  ]
})
export class ServicePanelComponent implements OnInit {
  private serviceService = inject(ServiceService);
  private companyService = inject(CompanyService);
  private globalService = inject(GlobalService);
  private router = inject(Router);

  services = signal<ServiceItem[]>([]);
  companies = signal<Company[]>([]);
  selectedCompanyId = signal<string>('ALL');
  selectedCategoryFilter = signal<string>('ALL');
  isLoading = signal<boolean>(false);

  // Serviços filtrados pela empresa
  filteredServices = computed(() => {
    const list = this.services();
    const compId = this.selectedCompanyId();
    if (!compId || compId === 'ALL') {
      return list;
    }
    return list.filter(s => {
      const sCompId = typeof s.company_id === 'object' ? (s.company_id as any)?._id : s.company_id;
      return String(sCompId) === String(compId);
    });
  });

  // Métricas Computadas
  totalCount = computed(() => this.filteredServices().length);

  activeServicesCount = computed(() => 
    this.filteredServices().filter(s => !s.status || s.status === 'ACTIVE').length
  );

  avgPrice = computed(() => {
    const list = this.filteredServices();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    return sum / list.length;
  });

  // Estatísticas agrupadas por categoria
  categoryStats = computed<CategoryStat[]>(() => {
    const map = new Map<string, { count: number; sum: number }>();
    for (const s of this.filteredServices()) {
      const cat = s.category || 'Geral';
      const entry = map.get(cat) || { count: 0, sum: 0 };
      entry.count += 1;
      entry.sum += Number(s.price) || 0;
      map.set(cat, entry);
    }
    const result: CategoryStat[] = [];
    map.forEach((val, key) => {
      result.push({
        name: key,
        count: val.count,
        avgPrice: val.sum / val.count
      });
    });
    return result.sort((a, b) => b.count - a.count);
  });

  categoriesCount = computed(() => this.categoryStats().length);

  // Serviços em destaque / recentes
  featuredServices = computed(() => {
    const cat = this.selectedCategoryFilter();
    let list = this.filteredServices();
    if (cat !== 'ALL') {
      list = list.filter(s => s.category === cat);
    }
    return list.slice(0, 8);
  });

  constructor() {
    registerServiceIcons();
    addIcons({ 
      listOutline, addCircleOutline, statsChartOutline, cashOutline, gridOutline,
      refreshOutline, businessOutline, constructOutline, chevronForwardOutline,
      pricetagOutline, checkmarkCircleOutline, sparklesOutline, arrowForwardOutline,
      pencilOutline, layersOutline, searchOutline, shieldCheckmarkOutline, walletOutline
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
      error: (err) => console.error('Erro ao carregar empresas:', err)
    });
  }

  onCompanyChange(companyId: string) {
    this.selectedCompanyId.set(companyId || 'ALL');
  }

  setCategoryFilter(cat: string) {
    this.selectedCategoryFilter.set(cat);
  }

  loadStats() {
    this.isLoading.set(true);
    this.serviceService.getServices().subscribe({
      next: (res) => {
        if (res.success) {
          this.services.set(res.data || []);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.globalService.errorToast('Erro ao carregar dados do catálogo');
        this.isLoading.set(false);
      }
    });
  }

  goToList(category?: string) {
    if (category && category !== 'ALL') {
      this.router.navigate(['/super-admin/services'], { queryParams: { category } });
    } else {
      this.router.navigateByUrl('/super-admin/services');
    }
  }

  goToCreate() {
    this.router.navigateByUrl('/super-admin/services/create');
  }

  goToEdit(event: Event, id: string) {
    event.stopPropagation();
    if (id) {
      this.router.navigateByUrl(`/super-admin/services/edit/${id}`);
    }
  }

  getCategoryIcon(categoryName?: string): string {
    const cat = (categoryName || '').toLowerCase();
    if (cat.includes('elétr') || cat.includes('ilumin')) return 'flash-outline';
    if (cat.includes('hidr') || cat.includes('água') || cat.includes('encan')) return 'water-outline';
    if (cat.includes('serralh') || cat.includes('port') || cat.includes('fechad') || cat.includes('civil')) return 'construct-outline';
    if (cat.includes('clima') || cat.includes('ar') || cat.includes('refrig')) return 'snow-outline';
    if (cat.includes('cftv') || cat.includes('segur') || cat.includes('alarm') || cat.includes('câmer')) return 'videocam-outline';
    if (cat.includes('red') || cat.includes('tecno') || cat.includes('ti') || cat.includes('inform')) return 'hardware-chip-outline';
    return 'pricetag-outline';
  }

  goToPlans() {
    this.router.navigateByUrl('/super-admin/financial/plans');
  }

  goToOperational() {
    this.router.navigateByUrl('/super-admin/operational/panel');
  }
}
