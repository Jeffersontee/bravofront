import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { StaffService, StaffUser } from 'src/app/services/staff/staff.service';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { 
  gridOutline, listOutline, addOutline, refreshOutline, personOutline, 
  businessOutline, searchOutline, closeCircleOutline, headsetOutline, 
  constructOutline, ribbonOutline, shieldCheckmarkOutline, keyOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { AVAILABLE_PERMISSIONS } from 'src/app/enum/permissions';

@Component({
  selector: 'app-staff-list-page',
  templateUrl: './staff-list-page.component.html',
  styleUrls: ['./staff-list-page.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class StaffListPageComponent implements OnInit {
  private staffService = inject(StaffService);
  private companyService = inject(CompanyService);
  private router = inject(Router);
  private global = inject(GlobalService);

  staffList = signal<StaffUser[]>([]);
  companies = signal<Company[]>([]);
  selectedCompanyId = signal<string>('');
  searchTerm = signal<string>('');
  isLoading = signal(true);
  viewMode = signal<'list' | 'card'>('list');
  selectedRoleFilter = signal<string>('ALL');

  onRoleFilterChange(value: any) {
    if (value) {
      this.selectedRoleFilter.set(String(value));
    }
  }

  onCompanyFilterChange(value: any) {
    this.selectedCompanyId.set(value || '');
  }

  onSearchInput(event: any) {
    this.searchTerm.set(event.detail.value || '');
  }

  clearFilters() {
    this.selectedRoleFilter.set('ALL');
    this.selectedCompanyId.set('');
    this.searchTerm.set('');
  }

  filteredStaffList = computed(() => {
    const list = this.staffList();
    const roleFilter = this.selectedRoleFilter();
    const companyId = this.selectedCompanyId();
    const search = this.searchTerm().trim().toLowerCase();

    return list.filter(u => {
      // Role filter por aba
      if (roleFilter !== 'ALL') {
        if (roleFilter === 'super_admin') {
          if (u.type !== 'super_admin' && u.type !== 'super_staff') return false;
        } else if (roleFilter === 'company_owner') {
          if (u.type !== 'company_owner') return false;
        } else if (roleFilter === 'admin') {
          // Aba OPERADORES: quem é admin ou tem role operator
          const isOperator = u.type === 'admin' || u.role === 'operator';
          if (!isOperator) return false;
        } else if (roleFilter === 'collaborator') {
          // Aba TÉCNICOS: técnicos de campo e supervisores, excluindo operadores
          const isTechnicianOrSupervisor = (u.type === 'collaborator' || u.role === 'technician' || u.role === 'supervisor') && u.role !== 'operator';
          if (!isTechnicianOrSupervisor) return false;
        } else if (roleFilter === 'user') {
          if (u.type !== 'user') return false;
        } else {
          if (u.type !== roleFilter) return false;
        }
      }

      // Company filter
      if (companyId) {
        const cId = typeof u.company_id === 'object' ? (u.company_id as any)?._id : u.company_id;
        if (cId !== companyId) return false;
      }

      // Search filter
      if (search) {
        const name = u.name?.toLowerCase() || '';
        const email = u.email?.toLowerCase() || '';
        const type = u.type?.toLowerCase() || '';
        const role = u.role?.toLowerCase() || '';
        const companyName = (typeof u.company_id === 'object' ? (u.company_id as any)?.name : '')?.toLowerCase() || '';

        return name.includes(search) || email.includes(search) || type.includes(search) || role.includes(search) || companyName.includes(search);
      }

      return true;
    });
  });

  constructor() {
    addIcons({ 
      gridOutline, listOutline, addOutline, refreshOutline, personOutline, 
      businessOutline, searchOutline, closeCircleOutline, headsetOutline, 
      constructOutline, ribbonOutline, shieldCheckmarkOutline, keyOutline,
      chevronForwardOutline
    });
  }

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    this.isLoading.set(true);
    this.companyService.getCompanies().subscribe({
      next: (compRes) => {
        this.companies.set(compRes.data || []);
      }
    });
    this.staffService.getStaffList().subscribe({
      next: (res) => {
        this.staffList.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.global.errorToast('Erro ao carregar usuários globais');
        this.isLoading.set(false);
      }
    });
  }

  goToCreate() {
    this.router.navigateByUrl('/super-admin/staff/create');
  }

  goToEdit(id: string) {
    this.router.navigateByUrl(`/super-admin/staff/edit/${id}`);
  }

  getPermissionLabels(user: StaffUser): string {
    if (!user.permissions || user.permissions.length === 0) {
      if (user.type === 'super_admin') return 'Acesso Total (Super Admin)';
      if (user.type === 'company_owner') return 'Acesso Total (Dono)';
      return 'Nenhuma permissão';
    }

    const labels = user.permissions.map(perm => {
      const found = AVAILABLE_PERMISSIONS.find(p => p.value === perm);
      return found ? found.label : perm;
    });

    return labels.join(', ');
  }

  getTypeLabel(user: StaffUser | string): string {
    if (typeof user === 'object' && user) {
      if (user.role === 'operator' || user.type === 'admin') return 'Operador';
      if (user.role === 'supervisor') return 'Supervisor';
      if (user.role === 'technician' || (user.type === 'collaborator' && user.role !== 'operator')) return 'Técnico de Campo';
      if (user.type === 'company_owner') return 'Dono de Empresa';
      if (user.type === 'super_admin') return 'Super Admin';
      if (user.type === 'user') return 'Cliente';
      if (user.role && user.role.trim() !== '') return user.role;
      return this.getTypeLabelStr(user.type);
    }
    return this.getTypeLabelStr(user as string);
  }

  private getTypeLabelStr(type: string): string {
    switch (type) {
      case 'super_admin': return 'Super Admin';
      case 'company_owner': return 'Dono de Empresa';
      case 'collaborator': return 'Técnico de Campo';
      case 'super_staff': return 'Operador HQ';
      case 'admin': return 'Operador';
      case 'user': return 'Cliente';
      default: return type || 'Usuário';
    }
  }

  getTypeBadgeColor(userOrType: StaffUser | string): string {
    const type = typeof userOrType === 'object' ? userOrType.type : userOrType;
    const role = typeof userOrType === 'object' ? userOrType.role : undefined;

    if (role === 'operator' || type === 'admin') return 'secondary';
    if (role === 'supervisor') return 'warning';
    if (role === 'technician' || type === 'collaborator') return 'primary';
    if (type === 'company_owner') return 'success';
    if (type === 'super_admin') return 'tertiary';
    return 'medium';
  }

  getUserIcon(userOrType: StaffUser | string): string {
    const type = typeof userOrType === 'object' ? userOrType.type : userOrType;
    const role = typeof userOrType === 'object' ? userOrType.role : undefined;

    if (role === 'operator' || type === 'admin') return 'headset-outline';
    if (role === 'supervisor') return 'ribbon-outline';
    if (role === 'technician' || type === 'collaborator') return 'construct-outline';
    if (type === 'company_owner') return 'business-outline';
    if (type === 'super_admin') return 'key-outline';
    return 'person-outline';
  }
}
