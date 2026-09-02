import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CollaboratorService, Collaborator } from 'src/app/services/collaborator/collaborator.service';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { 
  briefcaseOutline, 
  peopleOutline, 
  shieldCheckmarkOutline, 
  searchOutline, 
  businessOutline, 
  closeCircleOutline, 
  refreshOutline,
  gridOutline,
  listOutline,
  addOutline,
  personOutline,
  mailOutline,
  chevronForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-collaborator-panel',
  templateUrl: './collaborator-panel.component.html',
  styleUrls: ['./collaborator-panel.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class CollaboratorPanelComponent implements OnInit {
  private collaboratorService = inject(CollaboratorService);
  private companyService = inject(CompanyService);
  private global = inject(GlobalService);
  private router = inject(Router);

  collaborators = signal<Collaborator[]>([]);
  companies = signal<Company[]>([]);
  selectedCompanyId = signal<string>('');
  searchTerm = signal<string>('');
  isLoading = signal(true);
  viewMode = signal<'list' | 'card'>('list');

  // Lista Filtrada Inteligente
  filteredCollaborators = computed(() => {
    const list = this.collaborators();
    const companyId = this.selectedCompanyId();
    const search = this.searchTerm().trim().toLowerCase();

    return list.filter(c => {
      if (companyId) {
        const cId = typeof c.company_id === 'object' ? (c.company_id as any)?._id : c.company_id;
        if (cId !== companyId) return false;
      }

      if (search) {
        const name = c.name?.toLowerCase() || '';
        const email = c.email?.toLowerCase() || '';
        const role = c.role?.toLowerCase() || '';
        const phone = c.phone?.toLowerCase() || '';
        const companyName = (typeof c.company_id === 'object' ? (c.company_id as any)?.name : '')?.toLowerCase() || '';

        return name.includes(search) ||
               email.includes(search) ||
               role.includes(search) ||
               phone.includes(search) ||
               companyName.includes(search);
      }

      return true;
    });
  });

  // KPIs Dinâmicos e Inteligentes baseados na lista filtrada
  totalCount = computed(() => this.filteredCollaborators().length);
  activeCount = computed(() => this.filteredCollaborators().filter(c => c.status === 'active').length);
  inactiveCount = computed(() => this.filteredCollaborators().filter(c => c.status !== 'active').length);
  technicianCount = computed(() => this.filteredCollaborators().filter(c => {
    const role = c.role?.toLowerCase() || '';
    return role.includes('técnico') || role.includes('technician') || role === 'tech';
  }).length);

  constructor() {
    addIcons({ 
      briefcaseOutline, 
      peopleOutline, 
      shieldCheckmarkOutline, 
      searchOutline, 
      businessOutline, 
      closeCircleOutline, 
      refreshOutline,
      gridOutline,
      listOutline,
      addOutline,
      personOutline,
      mailOutline,
      chevronForwardOutline
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
        this.loadCollaborators();
      },
      error: () => {
        this.global.errorToast('Erro ao carregar empresas');
        this.loadCollaborators();
      }
    });
  }

  loadCollaborators() {
    this.collaboratorService.getCollaborators().subscribe({
      next: (res) => {
        this.collaborators.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.global.errorToast('Erro ao carregar colaboradores');
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
    this.router.navigateByUrl('/super-admin/collaborators/create');
  }

  goToEdit(id: string) {
    this.router.navigateByUrl(`/super-admin/collaborators/edit/${id}`);
  }
}
