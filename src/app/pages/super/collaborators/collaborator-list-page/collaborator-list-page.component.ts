import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CollaboratorService, Collaborator } from 'src/app/services/collaborator/collaborator.service';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { gridOutline, listOutline, addOutline, refreshOutline, personCircleOutline, businessOutline, searchOutline, closeCircleOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-collaborator-list-page',
  templateUrl: './collaborator-list-page.component.html',
  styleUrls: ['./collaborator-list-page.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class CollaboratorListPageComponent implements OnInit {
  private collaboratorService = inject(CollaboratorService);
  private companyService = inject(CompanyService);
  private router = inject(Router);
  private global = inject(GlobalService);

  collaborators = signal<Collaborator[]>([]);
  companies = signal<Company[]>([]);
  selectedCompanyId = signal<string>('');
  searchTerm = signal<string>('');
  isLoading = signal(true);
  viewMode = signal<'list' | 'card'>('list');

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

        return name.includes(search) || email.includes(search) || role.includes(search) || phone.includes(search) || companyName.includes(search);
      }

      return true;
    });
  });

  constructor() {
    addIcons({ gridOutline, listOutline, addOutline, refreshOutline, personCircleOutline, businessOutline, searchOutline, closeCircleOutline, personOutline });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.companyService.getCompanies().subscribe({
      next: (compRes) => {
        this.companies.set(compRes.data || []);
      }
    });
    this.collaboratorService.getCollaborators().subscribe({
      next: (res) => {
        this.collaborators.set(res.data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.global.errorToast('Erro ao carregar colaboradores');
        this.isLoading.set(false);
      }
    });
  }

  loadCollaborators() {
    this.loadData();
  }

  onCompanyFilterChange(value: any) {
    this.selectedCompanyId.set(value || '');
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

