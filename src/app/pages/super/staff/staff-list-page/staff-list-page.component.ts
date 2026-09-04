import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
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

  private route = inject(ActivatedRoute);

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
          if (u.type !== 'super_admin' && u.type !== 'super_staff' && u.role !== 'root') return false;
        } else if (roleFilter === 'company_owner') {
          if (u.type !== 'company_owner' && u.role !== 'owner') return false;
        } else if (roleFilter === 'admin') {
          // Aba GERENTES & ATENDENTES
          const isManagerOrBackoffice = u.type === 'admin' || u.role === 'manager' || u.role === 'backoffice';
          if (!isManagerOrBackoffice) return false;
        } else if (roleFilter === 'supervisors') {
          if (u.role !== 'supervisor') return false;
        } else if (roleFilter === 'technicians') {
          const isTech = u.role === 'technician' || (u.type === 'collaborator' && u.role !== 'supervisor');
          if (!isTech) return false;
        } else if (roleFilter === 'user') {
          if (u.type !== 'user' && u.role !== 'customer') return false;
        } else {
          if (u.type !== roleFilter && u.role !== roleFilter) return false;
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
    const queryRole = this.route.snapshot.queryParamMap.get('role');
    if (queryRole === 'technician') {
      this.selectedRoleFilter.set('technicians');
    } else if (queryRole === 'supervisor') {
      this.selectedRoleFilter.set('supervisors');
    }
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
        this.global.errorToast('Erro ao carregar lista de usuários');
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
      return 'Nenhuma permissão personalizada';
    }

    const labels = user.permissions.map(perm => {
      const found = AVAILABLE_PERMISSIONS.find(p => p.value === perm);
      return found ? found.label : perm;
    });

    return labels.join(', ');
  }

  getTypeLabel(user: StaffUser | string): string {
    if (typeof user === 'object' && user) {
      if (user.role === 'root' || user.type === 'super_admin') return 'Super Administrador';
      if (user.role === 'owner' || user.type === 'company_owner') return 'Dono de Empresa';
      if (user.role === 'manager') return 'Gerente Administrativo';
      if (user.role === 'backoffice') return 'Atendente / Comercial';
      if (user.role === 'supervisor') return 'Supervisor de Equipe';
      if (user.role === 'technician') return 'Técnico de Campo';
      if (user.type === 'admin') return 'Gerente / Operador';
      if (user.type === 'collaborator') return 'Colaborador de Campo';
      if (user.type === 'user' || user.role === 'customer') return 'Cliente Final';
      if (user.role && user.role.trim() !== '') return user.role;
      return this.getTypeLabelStr(user.type);
    }
    return this.getTypeLabelStr(user as string);
  }

  private getTypeLabelStr(type: string): string {
    switch (type) {
      case 'super_admin': return 'Super Administrador';
      case 'company_owner': return 'Dono de Empresa';
      case 'collaborator': return 'Colaborador';
      case 'super_staff': return 'Operador HQ';
      case 'admin': return 'Gerente / Operador';
      case 'user': return 'Cliente Final';
      default: return type || 'Usuário';
    }
  }

  getTypeBadgeColor(userOrType: StaffUser | string): string {
    const role = typeof userOrType === 'object' ? userOrType.role : undefined;
    const type = typeof userOrType === 'object' ? userOrType.type : userOrType;

    if (role === 'root' || type === 'super_admin') return 'danger';
    if (role === 'owner' || type === 'company_owner') return 'success';
    if (role === 'manager') return 'tertiary';
    if (role === 'backoffice' || type === 'admin') return 'secondary';
    if (role === 'supervisor') return 'warning';
    if (role === 'technician' || type === 'collaborator') return 'primary';
    return 'medium';
  }

  getUserIcon(userOrType: StaffUser | string): string {
    const role = typeof userOrType === 'object' ? userOrType.role : undefined;
    const type = typeof userOrType === 'object' ? userOrType.type : userOrType;

    if (role === 'root' || type === 'super_admin') return 'key-outline';
    if (role === 'owner' || type === 'company_owner') return 'business-outline';
    if (role === 'manager') return 'shield-checkmark-outline';
    if (role === 'backoffice' || type === 'admin') return 'headset-outline';
    if (role === 'supervisor') return 'ribbon-outline';
    if (role === 'technician' || type === 'collaborator') return 'construct-outline';
    return 'person-outline';
  }
}
