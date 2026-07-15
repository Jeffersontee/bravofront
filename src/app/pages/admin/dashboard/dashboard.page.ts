import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonToggle, IonModal } from '@ionic/angular/standalone';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { caretDownSharp, caretUpSharp, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonToggle, IonModal, CommonModule, FormsModule, ReactiveFormsModule]
})
export class DashboardPage implements OnInit {
  private companyService = inject(CompanyService);
  private globalService = inject(GlobalService);
  private fb = inject(FormBuilder);

  // State
  companies = signal<Company[]>([]);
  statusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  searchQuery = signal<string>('');
  listOpen = signal<boolean>(true);
  
  // Modal State
  isModalOpen = signal<boolean>(false);
  editingCompany = signal<Company | null>(null);
  isLoading = signal<boolean>(false);

  form: FormGroup;

  // Computed
  filteredCompanies = computed(() => {
    let filtered = this.companies();
    
    if (this.statusFilter() === 'ACTIVE') {
      filtered = filtered.filter(c => c.active);
    } else if (this.statusFilter() === 'INACTIVE') {
      filtered = filtered.filter(c => !c.active);
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        (c.short_name && c.short_name.toLowerCase().includes(query)) ||
        c.cnpj.includes(query)
      );
    }

    return filtered;
  });

  activeCompaniesCount = computed(() => this.companies().filter(c => c.active).length);
  inactiveCompaniesCount = computed(() => this.companies().filter(c => !c.active).length);

  constructor() {
    addIcons({ caretDownSharp, caretUpSharp, closeOutline });
    this.form = this.fb.group({
      name: ['', Validators.required],
      short_name: [''],
      cnpj: ['', Validators.required],
      owner_name: [''],
      email: [''],
      description: [''],
      active: [true]
    });
  }

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (res) => {
        if (res.success) {
          this.companies.set(res.data);
        }
      },
      error: (err) => {
        this.globalService.errorToast('Erro ao carregar empresas');
      }
    });
  }

  clearFilters() {
    this.statusFilter.set('ALL');
    this.searchQuery.set('');
  }

  openModal(company?: Company) {
    this.form.reset({ active: true });
    
    if (company) {
      this.editingCompany.set(company);
      this.form.patchValue({
        name: company.name,
        short_name: company.short_name,
        cnpj: company.cnpj,
        owner_name: company.owner_name,
        email: company.email,
        description: company.description,
        active: company.active
      });
    } else {
      this.editingCompany.set(null);
    }
    
    this.isModalOpen.set(true);
  }

  saveCompany() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const payload = this.form.getRawValue();
    const currentEdit = this.editingCompany();

    if (currentEdit && currentEdit._id) {
      this.companyService.updateCompany(currentEdit._id, payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.globalService.successToast('Empresa atualizada com sucesso!');
            this.isModalOpen.set(false);
            this.loadCompanies();
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.globalService.errorToast('Erro ao atualizar empresa');
          this.isLoading.set(false);
        }
      });
    } else {
      this.companyService.createCompany(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.globalService.successToast('Empresa criada com sucesso!');
            this.isModalOpen.set(false);
            this.loadCompanies();
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.globalService.errorToast('Erro ao criar empresa');
          this.isLoading.set(false);
        }
      });
    }
  }
}
