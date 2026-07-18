import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonSpinner, IonBackButton, IonMenuButton } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { CompanyFormComponent } from 'src/app/components/company-form/company-form.component';
import { GlobalService } from 'src/app/services/global/global.service';
import { Strings } from 'src/app/enum/strings';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-company',
  templateUrl: './company.page.html',
  styleUrls: ['./company.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonSpinner, 
    IonBackButton, IonMenuButton, CommonModule, FormsModule, 
    CompanyFormComponent 
  ]
})
export class CompanyPage {
  readonly Strings = Strings;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private global = inject(GlobalService);

  companyData = signal<Company | null>(null);
  isEditMode = signal<boolean>(false);
  isDetailsMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  ionViewWillEnter() {
    this.loadInitialData();
  }

  private getCurrentCompanyId(): string | null {
    return this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('id');
  }

  async loadInitialData() {
    this.isLoading.set(true);
    
    // Reset state
    this.isEditMode.set(false);
    this.companyData.set(null);

    try {
      const id = this.getCurrentCompanyId();
      const isDetails = !!id && (
        this.route.snapshot.routeConfig?.path?.includes('details') ||
        this.router.url.includes('/details/')
      );
      this.isDetailsMode.set(isDetails);
      this.isEditMode.set(!!id && id !== 'create' && !isDetails);

      if (id && id !== 'create') {
        const response = await firstValueFrom(this.companyService.getCompanyById(id));
        const data = response.data;
        
        if (data) {
          this.companyData.set(data);
        }
      }
    } catch (error: any) {
      this.global.errorToast('Erro ao carregar dados da empresa. A empresa pode ter sido excluída.');
      this.router.navigate([`/${Strings.COMPANY_COMPANIES}`]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSave(payload: Partial<Company>) {
    try {
      this.global.showLoader();
      
      const id = this.getCurrentCompanyId();

      if (this.isEditMode() && id) {
        await firstValueFrom(this.companyService.updateCompany(id, payload));
        this.global.successToast('Empresa atualizada com sucesso');
      } else {
        await firstValueFrom(this.companyService.createCompany(payload));
        this.global.successToast('Empresa cadastrada com sucesso');
      }
      
      this.router.navigate([`/${Strings.COMPANY_COMPANIES}`]);
    } catch (e: any) {
      const message = e.error?.message || 'Erro ao salvar empresa';
      this.global.errorToast(message);
    } finally {
      this.global.hideLoader();
    }
  }
}
