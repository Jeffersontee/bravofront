import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { StaffService, StaffUser } from 'src/app/services/staff/staff.service';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { 
  keyOutline, 
  shieldCheckmarkOutline, 
  peopleOutline, 
  listOutline, 
  gridOutline,
  searchOutline, 
  businessOutline, 
  closeCircleOutline, 
  refreshOutline,
  addOutline,
  personOutline,
  mailOutline,
  chevronForwardOutline,
  optionsOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-staff-panel',
  templateUrl: './staff-panel.component.html',
  styleUrls: ['./staff-panel.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class StaffPanelComponent implements OnInit {
  private staffService = inject(StaffService);
  private companyService = inject(CompanyService);
  private global = inject(GlobalService);
  private router = inject(Router);

  staffList = signal<StaffUser[]>([]);
  companies = signal<Company[]>([]);
  selectedCompanyId = signal<string>('');
  searchTerm = signal<string>('');
  isLoading = signal(true);
  viewMode = signal<'list' | 'card'>('list');

  // Lista Filtrada Inteligente
  filteredStaffList = computed(() => {
    const list = this.staffList();
    const companyId = this.selectedCompanyId();
    const search = this.searchTerm().trim().toLowerCase();

    return list.filter(u => {
      if (companyId) {
        const cId = typeof u.company_id === 'object' ? (u.company_id as any)?._id : u.company_id;
        if (cId !== companyId) return false;
      }

      if (search) {
        const name = u.name?.toLowerCase() || '';
        const email = u.email?.toLowerCase() || '';
        const type = u.type?.toLowerCase() || '';
        const companyName = (typeof u.company_id === 'object' ? (u.company_id as any)?.name : '')?.toLowerCase() || '';

        return name.includes(search) ||
               email.includes(search) ||
               type.includes(search) ||
               companyName.includes(search);
      }

      return true;
    });
  });

  // KPIs Dinâmicos e Inteligentes
  totalCount = computed(() => this.filteredStaffList().length);
  superAdminsCount = computed(() => this.filteredStaffList().filter(u => u.type === 'super_admin').length);
  companyOwnersCount = computed(() => this.filteredStaffList().filter(u => u.type === 'company_owner').length);
  activeCount = computed(() => this.filteredStaffList().filter(u => u.status === 'active').length);

  constructor() {
    addIcons({ 
      keyOutline, 
      shieldCheckmarkOutline, 
      peopleOutline, 
      listOutline, 
      gridOutline,
      searchOutline, 
      businessOutline, 
      closeCircleOutline, 
      refreshOutline,
      addOutline,
      personOutline,
      mailOutline,
      chevronForwardOutline,
      optionsOutline
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.companyService.getCompanies().subscribe({
      next: (compRes) => {
        this.companies.set(compRes.data || []);
        this.loadStaff();
      },
      error: () => {
        this.global.errorToast('Erro ao carregar empresas');
        this.loadStaff();
      }
    });
  }

  loadStaff() {
    this.staffService.getStaffList().subscribe({
      next: (res) => {
        this.staffList.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.global.errorToast('Erro ao carregar usuários');
        this.isLoading.set(false);
      }
    });
  }

  filterByCompany(event: any) {
    this.selectedCompanyId.set(event.detail.value || '');
  }

  onSearchInput(event: any) {
    this.searchTerm.set(event.detail.value || '');
  }

  clearFilters() {
    this.selectedCompanyId.set('');
    this.searchTerm.set('');
  }

  goToCreate() {
    this.router.navigateByUrl('/super-admin/staff/create');
  }

  goToEdit(id: string) {
    this.router.navigateByUrl(`/super-admin/staff/edit/${id}`);
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'super_admin': return 'Super Admin';
      case 'company_owner': return 'Dono de Empresa';
      case 'collaborator': return 'Técnico de Campo';
      case 'admin': return 'Operador';
      case 'user': return 'Cliente';
      default: return type || 'Usuário';
    }
  }

  getTypeBadgeColor(type: string): string {
    switch (type) {
      case 'super_admin': return 'tertiary';
      case 'company_owner': return 'success';
      case 'collaborator': return 'primary';
      case 'admin': return 'warning';
      default: return 'medium';
    }
  }

  getUserIcon(type: string): string {
    switch (type) {
      case 'super_admin': return 'key-outline';
      case 'company_owner': return 'shield-checkmark-outline';
      default: return 'person-outline';
    }
  }
}


