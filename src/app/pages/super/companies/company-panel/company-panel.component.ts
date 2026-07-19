import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import {
  businessOutline, chevronForwardOutline, peopleOutline,
  checkmarkCircleOutline, closeCircleOutline, searchOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-company-panel',
  templateUrl: './company-panel.component.html',
  styleUrls: ['./company-panel.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class CompanyPanelComponent implements OnInit {
  private companyService = inject(CompanyService);
  private global = inject(GlobalService);
  private router = inject(Router);

  companies = signal<Company[]>([]);
  selectedCompany = signal<Company | null>(null);
  companyUsers = signal<any[]>([]);
  isLoading = signal(true);
  isUsersLoading = signal(false);
  searchTerm = signal('');

  constructor() {
    addIcons({
      businessOutline, chevronForwardOutline, peopleOutline,
      checkmarkCircleOutline, closeCircleOutline, searchOutline
    });
  }

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.isLoading.set(true);
    this.companyService.getCompanies().subscribe({
      next: (res: any) => {
        this.companies.set(res.data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast('Erro ao carregar empresas');
        this.isLoading.set(false);
      }
    });
  }

  selectCompany(company: Company) {
    this.router.navigateByUrl(`/super-admin/companies/${company._id}/dashboard`);
  }

  loadCompanyUsers(id: string) {
    this.isUsersLoading.set(true);
    this.companyService.getCompanyUsers(id).subscribe({
      next: (res: any) => {
        this.companyUsers.set(res.data);
        this.isUsersLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.isUsersLoading.set(false);
      }
    });
  }

  goToEdit(id: string) {
    this.router.navigateByUrl(`/super-admin/companies/edit/${id}`);
  }

  clearSelection() {
    this.selectedCompany.set(null);
    this.companyUsers.set([]);
  }

  get filteredCompanies(): Company[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.companies();
    return this.companies().filter(c =>
      c.name.toLowerCase().includes(term) ||
      (c.cnpj && c.cnpj.toLowerCase().includes(term))
    );
  }

  onSearch(event: any) {
    this.searchTerm.set(event.detail.value || '');
  }
}
