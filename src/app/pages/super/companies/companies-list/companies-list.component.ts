import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { Strings } from 'src/app/enum/strings';
import { FormsModule } from '@angular/forms';
import { GlobalService } from 'src/app/services/global/global.service';

import { addIcons } from 'ionicons';
import { gridOutline, listOutline, addOutline, refreshOutline } from 'ionicons/icons';

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
  
  public companies: Company[] = [];
  public isLoading = true;
  public viewMode = signal<'list' | 'card'>('list');

  constructor() {
    addIcons({ gridOutline, listOutline, addOutline, refreshOutline });
  }

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.isLoading = true;
    this.companyService.getCompanies().subscribe({
      next: (res) => {
        this.companies = res.data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast('Erro ao carregar empresas');
        this.isLoading = false;
      }
    });
  }

  goToCreate() {
    this.router.navigateByUrl(Strings.SUPER_COMPANIES_CREATE);
  }

  goToEdit(id: string) {
    this.router.navigateByUrl(`/super-admin/companies/edit/${id}`);
  }
}