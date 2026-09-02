import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { Strings } from 'src/app/enum/strings';
import { FormsModule } from '@angular/forms';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { 
  businessOutline, 
  gridOutline, 
  listOutline, 
  addOutline, 
  refreshOutline, 
  searchOutline, 
  closeCircleOutline, 
  checkmarkCircleOutline,
  chevronForwardOutline,
  mailOutline,
  cardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-companies-list',
  templateUrl: './companies-list.component.html',
  styleUrls: ['./companies-list.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CompaniesListComponent implements OnInit {
  private companyService = inject(CompanyService);
  private router = inject(Router);
  private global = inject(GlobalService);
  
  companies = signal<Company[]>([]);
  isLoading = signal(true);
  searchTerm = signal<string>('');
  selectedStatusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  viewMode = signal<'list' | 'card'>('list');

  // Lista Filtrada Reativa
  filteredCompanies = computed(() => {
    const list = this.companies();
    const statusFilter = this.selectedStatusFilter();
    const search = this.searchTerm().trim().toLowerCase();

    return list.filter(comp => {
      // Filtro de Status
      if (statusFilter === 'ACTIVE' && !comp.active) return false;
      if (statusFilter === 'INACTIVE' && comp.active) return false;

      // Filtro por Busca (Nome, CNPJ, Email, Dono)
      if (search) {
        const name = comp.name?.toLowerCase() || '';
        const cnpj = comp.cnpj?.toLowerCase() || '';
        const email = comp.email?.toLowerCase() || '';
        const owner = comp.owner_name?.toLowerCase() || '';
        const shortName = comp.short_name?.toLowerCase() || '';

        return name.includes(search) || 
               cnpj.includes(search) || 
               email.includes(search) || 
               owner.includes(search) || 
               shortName.includes(search);
      }

      return true;
    });
  });

  // KPIs Dinâmicos e Inteligentes
  totalCount = computed(() => this.filteredCompanies().length);
  activeCount = computed(() => this.filteredCompanies().filter(c => c.active).length);
  inactiveCount = computed(() => this.filteredCompanies().filter(c => !c.active).length);

  constructor() {
    addIcons({ 
      businessOutline, 
      gridOutline, 
      listOutline, 
      addOutline, 
      refreshOutline, 
      searchOutline, 
      closeCircleOutline, 
      checkmarkCircleOutline,
      chevronForwardOutline,
      mailOutline,
      cardOutline
    });
  }

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.isLoading.set(true);
    this.companyService.getCompanies().subscribe({
      next: (res) => {
        this.companies.set(res.data || []);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast('Erro ao carregar empresas');
        this.isLoading.set(false);
      }
    });
  }

  onSearchInput(event: any) {
    this.searchTerm.set(event.detail.value || '');
  }

  onStatusFilterChange(value: any) {
    this.selectedStatusFilter.set(value || 'ALL');
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedStatusFilter.set('ALL');
  }

  goToCreate() {
    this.router.navigateByUrl(Strings.SUPER_COMPANIES_CREATE);
  }

  goToEdit(id: string) {
    this.router.navigateByUrl(`/super-admin/companies/edit/${id}`);
  }
}