import { Component, OnInit, input, output, signal, effect, untracked, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { 
  IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonToggle, 
  IonButton, IonIcon, IonSpinner, IonItemDivider, IonProgressBar 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, mail, call, key, businessOutline, listOutline, helpCircle, helpCircleOutline, informationCircleOutline, briefcaseOutline, constructOutline } from 'ionicons/icons';
import { StaffUser } from 'src/app/services/staff/staff.service';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { AVAILABLE_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, TECHNICIAN_SPECIALTIES } from 'src/app/enum/permissions';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
  selector: 'app-staff-form',
  templateUrl: './staff-form.component.html',
  styleUrls: ['./staff-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonToggle, 
    IonButton, IonIcon, IonItemDivider, IonSpinner, IonProgressBar
  ]
})
export class StaffFormComponent implements OnInit {
  data = input<StaffUser | null>(null);
  isEditMode = input<boolean>(false);
  isReadOnly = input<boolean>(false);
  isLoading = input<boolean>(false);
  
  save = output<Partial<StaffUser>>();

  // Help Banners Signals
  showHelpIdentity = signal<boolean>(false);
  showHelpPermissions = signal<boolean>(false);

  toggleHelpIdentity() {
    this.showHelpIdentity.set(!this.showHelpIdentity());
  }

  toggleHelpPermissions() {
    this.showHelpPermissions.set(!this.showHelpPermissions());
  }

  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  public profileService = inject(ProfileService);

  staffForm!: FormGroup;
  formReady = signal<boolean>(false);
  formChanged = signal<boolean>(false);
  companies = signal<Company[]>([]);

  selectedType = signal<string>('admin');
  selectedRole = signal<string>('');

  allTypes = [
    { value: 'super_admin', label: 'Super Administrador' },
    { value: 'super_staff', label: 'Operador / Staff HQ' },
    { value: 'company_owner', label: 'Dono de Empresa' },
    { value: 'admin', label: 'Gerente / Operador' },
    { value: 'collaborator', label: 'Colaborador / Campo' },
    { value: 'user', label: 'Cliente Final (Consumidor)' }
  ];

  companyOwnerTypes = [
    { value: 'admin', label: 'Gerente / Operador' },
    { value: 'collaborator', label: 'Colaborador / Campo' }
  ];

  availableTypes = computed(() => {
    const caller = this.profileService.profile();
    if (caller?.type === 'super_admin') {
      return this.allTypes;
    }
    return this.companyOwnerTypes;
  });

  availableRoles = computed(() => {
    const type = this.selectedType();
    if (type === 'super_staff') {
      return [
        { value: 'supervisor', label: 'Supervisor Geral HQ' },
        { value: 'backoffice', label: 'Operador / Backoffice HQ' },
        { value: 'technician', label: 'Técnico Geral HQ' }
      ];
    }
    if (type === 'admin') {
      return [
        { value: 'manager', label: 'Gerente Administrativo' },
        { value: 'backoffice', label: 'Atendente / Comercial' }
      ];
    }
    if (type === 'collaborator') {
      return [
        { value: 'supervisor', label: 'Supervisor de Equipe' },
        { value: 'technician', label: 'Técnico de Campo' }
      ];
    }
    if (type === 'super_admin') {
      return [{ value: 'root', label: 'Super Administrador' }];
    }
    if (type === 'company_owner') {
      return [{ value: 'owner', label: 'Dono de Empresa' }];
    }
    return [{ value: 'customer', label: 'Cliente Final' }];
  });

  isRoleVisible = computed(() => {
    const type = this.selectedType();
    return type === 'admin' || type === 'collaborator' || type === 'super_staff';
  });

  isTechnician = computed(() => {
    const role = this.selectedRole();
    return role === 'technician' || role === 'técnico';
  });

  availablePermissions = AVAILABLE_PERMISSIONS;
  technicianSpecialties = TECHNICIAN_SPECIALTIES;

  hasChanges = computed(() => {
    return this.formChanged();
  });

  constructor() {
    addIcons({ person, mail, call, key, businessOutline, listOutline, helpCircle, helpCircleOutline, informationCircleOutline, briefcaseOutline, constructOutline });

    effect(() => {
      if (!this.formReady() || !this.staffForm) return;
      const isReadOnly = this.isReadOnly();
      const isLoading = this.isLoading();
      
      if (isReadOnly || isLoading) {
        this.staffForm.disable({ emitEvent: false });
      } else {
        this.staffForm.enable({ emitEvent: false });
      }
    });

    effect(() => {
      const user = this.data();
      if (user) {
        untracked(() => this.patchForm(user));
      }
    });

    effect(() => {
      if (!this.formReady() || !this.staffForm) return;
      const editMode = this.isEditMode();
      const passwordControl = this.staffForm.get('password');
      if (!passwordControl) return;

      if (editMode) {
        passwordControl.clearValidators();
      } else {
        passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
      }
      passwordControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  ngOnInit() {
    this.initForm();
    this.loadCompanies();

    if (this.staffForm) {
      this.staffForm.valueChanges.subscribe(() => {
        if (this.staffForm.dirty) {
          this.formChanged.set(true);
        }
      });

      this.staffForm.get('type')?.valueChanges.subscribe((newType) => {
        this.selectedType.set(newType || 'admin');
        const roles = this.availableRoles();
        if (roles.length > 0) {
          const defaultRole = roles[0].value;
          this.staffForm.get('role')?.setValue(defaultRole);
        }
      });

      this.staffForm.get('role')?.valueChanges.subscribe((newRole) => {
        this.selectedRole.set(newRole || '');
        // Auto-preenche permissões sugeridas ao trocar cargo (se não estiver em edição de dados legados)
        if (newRole && DEFAULT_ROLE_PERMISSIONS[newRole]) {
          const currentPermissions = this.staffForm.get('permissions')?.value || [];
          if (currentPermissions.length === 0 || !this.isEditMode()) {
            this.staffForm.get('permissions')?.setValue(DEFAULT_ROLE_PERMISSIONS[newRole]);
          }
        }
      });
    }
  }

  private initForm() {
    const caller = this.profileService.profile();
    const defaultType = 'admin';
    const defaultRole = 'manager';

    this.staffForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(6)]],
      type: [defaultType, Validators.required],
      role: [defaultRole],
      specialties: [[]],
      company_id: [caller?.type !== 'super_admin' ? caller?.company_id || '' : ''],
      permissions: [DEFAULT_ROLE_PERMISSIONS['manager'] || []],
      active: [true]
    });

    this.selectedType.set(defaultType);
    this.selectedRole.set(defaultRole);
    this.formReady.set(true);
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (res: any) => {
        this.companies.set(res.data || []);
      }
    });
  }

  onPhoneInput(event: any) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    const masked = this.applyPhoneMask(val);
    this.staffForm.get('phone')?.setValue(masked, { emitEvent: false });
    input.value = masked;
  }

  private applyPhoneMask(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    let formatted = '(' + digits.substring(0, 2);
    if (digits.length > 2) formatted += ') ' + digits.substring(2, 7);
    if (digits.length > 7) formatted += '-' + digits.substring(7, 11);
    return formatted;
  }

  private patchForm(data: StaffUser) {
    if (!this.staffForm) this.initForm();

    const normalizedType = data.type || 'admin';
    const normalizedRole = data.role || (normalizedType === 'super_staff' ? 'supervisor' : normalizedType === 'collaborator' ? 'technician' : normalizedType === 'admin' ? 'manager' : normalizedType === 'super_admin' ? 'root' : normalizedType === 'company_owner' ? 'owner' : 'customer');
    const specs = (data as any).technician_profile?.specialties || [];

    this.selectedType.set(normalizedType);
    this.selectedRole.set(normalizedRole);

    this.staffForm.patchValue({
      name: data.name || '',
      email: data.email || '',
      phone: this.applyPhoneMask(data.phone || ''),
      type: normalizedType,
      role: normalizedRole,
      specialties: specs,
      company_id: data.company_id?._id || data.company_id || '',
      permissions: data.permissions && data.permissions.length > 0 ? data.permissions : (DEFAULT_ROLE_PERMISSIONS[normalizedRole] || []),
      active: data.status === 'active'
    });
    
    this.staffForm.markAsPristine();
    this.staffForm.markAsUntouched();
    this.formChanged.set(false);
  }

  onSubmit() {
    if (!this.staffForm.valid || this.isReadOnly()) return;

    const formValue = this.staffForm.getRawValue();
    
    const payload: any = {
      name: formValue.name,
      email: formValue.email?.trim().toLowerCase() || '',
      phone: (formValue.phone || '').replace(/\D/g, ''),
      type: formValue.type,
      role: formValue.role || undefined,
      company_id: formValue.company_id || null,
      permissions: formValue.permissions || [],
      status: formValue.active ? 'active' : 'inactive'
    };

    if (formValue.role === 'technician' || formValue.role === 'técnico') {
      payload.technician_profile = {
        specialties: formValue.specialties || [],
        is_available_now: true
      };
    }

    if (!this.isEditMode() || formValue.password) {
      payload.password = formValue.password;
    }

    this.save.emit(payload);
  }
}
