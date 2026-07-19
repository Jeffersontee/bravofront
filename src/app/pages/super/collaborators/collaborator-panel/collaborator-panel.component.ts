import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CollaboratorService, Collaborator } from 'src/app/services/collaborator/collaborator.service';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { briefcaseOutline, peopleOutline, shieldCheckmarkOutline, searchOutline, businessOutline } from 'ionicons/icons';

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
  isLoading = signal(true);

  activeCount = signal(0);
  inactiveCount = signal(0);
  technicianCount = signal(0);

  constructor() {
    addIcons({ briefcaseOutline, peopleOutline, shieldCheckmarkOutline, searchOutline, businessOutline });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.companyService.getCompanies().subscribe({
      next: (compRes) => {
        this.companies.set(compRes.data);
        this.loadCollaborators();
      },
      error: () => {
        this.global.errorToast('Erro ao carregar dados');
        this.isLoading.set(false);
      }
    });
  }

  loadCollaborators() {
    this.collaboratorService.getCollaborators().subscribe({
      next: (res) => {
        this.collaborators.set(res.data);
        this.calculateStats(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  calculateStats(list: Collaborator[]) {
    this.activeCount.set(list.filter(c => c.status === 'active').length);
    this.inactiveCount.set(list.filter(c => c.status !== 'active').length);
    this.technicianCount.set(list.filter(c => c.role === 'technician' || c.role === 'técnico').length);
  }

  get filteredCollaborators(): Collaborator[] {
    const companyId = this.selectedCompanyId();
    if (!companyId) return this.collaborators();
    return this.collaborators().filter(c => {
      const cId = typeof c.company_id === 'object' ? (c.company_id as any)?._id : c.company_id;
      return cId === companyId;
    });
  }

  filterByCompany(event: any) {
    this.selectedCompanyId.set(event.detail.value || '');
  }

  goToEdit(id: string) {
    this.router.navigateByUrl(`/super-admin/collaborators/edit/${id}`);
  }
}
