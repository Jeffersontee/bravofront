import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon,
  IonButton, IonButtons, IonMenuButton, IonBadge, IonSkeletonText
} from '@ionic/angular/standalone';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { registerServiceIcons } from 'src/app/utils/service-icons';
import { addIcons } from 'ionicons';
import {
  refreshOutline, addCircleOutline, searchOutline, gridOutline, listOutline,
  businessOutline, constructOutline, closeCircleOutline, layersOutline,
  pencilOutline, cashOutline, pricetagOutline, chevronForwardOutline,
  filterOutline, alertCircleOutline
} from 'ionicons/icons';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-service',
  templateUrl: './service.page.html',
  styleUrls: ['./service.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon,
    IonButton, IonButtons, IonMenuButton, IonBadge, IonSkeletonText
  ]
})
export class ServicesPage implements OnInit {
  private serviceService = inject(ServiceService);
  private companyService = inject(CompanyService);
  private globalService = inject(GlobalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  services = signal<ServiceItem[]>([]);
  companies = signal<Company[]>([]);
  selectedCompanyId = signal<string>('ALL');
  selectedCategory = signal<string>('ALL');
  searchTerm = signal<string>('');
  viewMode = signal<'grid' | 'list'>('grid');
  isLoading = signal<boolean>(false);

  // Categorias únicas disponíveis na lista de serviços
  availableCategories = computed(() => {
    const list = this.services();
    const set = new Set<string>();
    list.forEach(s => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set).sort();
  });

  // Lista filtrada por empresa, categoria e busca textual
  filteredServices = computed(() => {
    const list = this.services();
    const compId = this.selectedCompanyId();
    const cat = this.selectedCategory();
    const search = this.searchTerm().trim().toLowerCase();

    return list.filter(s => {
      // Filtro de empresa
      if (compId && compId !== 'ALL') {
        const sCompId = typeof s.company_id === 'object' ? (s.company_id as any)?._id : s.company_id;
        if (String(sCompId) !== String(compId)) return false;
      }

      // Filtro de categoria
      if (cat !== 'ALL') {
        if (s.category !== cat) return false;
      }

      // Filtro de busca
      if (search) {
        const name = s.name?.toLowerCase() || '';
        const desc = s.description?.toLowerCase() || '';
        const category = s.category?.toLowerCase() || '';
        const price = String(s.price || '');
        return name.includes(search) || desc.includes(search) || category.includes(search) || price.includes(search);
      }

      return true;
    });
  });

  // Métricas rápidas da lista filtrada
  totalCount = computed(() => this.filteredServices().length);

  avgPrice = computed(() => {
    const list = this.filteredServices();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    return sum / list.length;
  });

  constructor() {
    registerServiceIcons();
    addIcons({
      refreshOutline, addCircleOutline, searchOutline, gridOutline, listOutline,
      businessOutline, constructOutline, closeCircleOutline, layersOutline,
      pencilOutline, cashOutline, pricetagOutline, chevronForwardOutline,
      filterOutline, alertCircleOutline
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
    });

    this.loadCompanies();
    this.loadServices();
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

  onCategorySelect(cat: string) {
    this.selectedCategory.set(cat);
  }

  onSearchInput(event: any) {
    this.searchTerm.set(event.detail?.value || event.target?.value || '');
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedCategory.set('ALL');
    this.selectedCompanyId.set('ALL');
  }

  loadServices() {
    this.isLoading.set(true);
    this.serviceService.getServices().subscribe({
      next: (res) => {
        if (res.success) {
          this.services.set(res.data || []);
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

  goToPanel() {
    this.router.navigateByUrl('/super-admin/services/panel');
  }
}
