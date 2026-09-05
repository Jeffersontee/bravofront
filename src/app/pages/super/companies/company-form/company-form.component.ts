import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
  IonItem, IonInput, IonToggle, IonButton, 
  IonSpinner, IonSelect, IonSelectOption,
  IonIcon, AlertController
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from 'src/app/services/company/company.service';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
import { PlanService, Plan } from 'src/app/services/plan/plan.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Strings } from 'src/app/enum/strings';
import { addIcons } from 'ionicons';
import { 
  businessOutline, 
  personOutline, 
  mailOutline, 
  cardOutline, 
  documentTextOutline, 
  cubeOutline, 
  addOutline, 
  trashOutline, 
  saveOutline, 
  personAddOutline, 
  shieldCheckmarkOutline, 
  keyOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  callOutline,
  closeCircleOutline,
  informationCircleOutline,
  layersOutline,
  ribbonOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
    IonItem, IonInput, IonToggle, IonButton, 
    IonSpinner, IonSelect, IonSelectOption,
    IonIcon
  ]
})
export class CompanyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private serviceService = inject(ServiceService);
  private planService = inject(PlanService);
  private global = inject(GlobalService);
  private alertCtrl = inject(AlertController);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public form!: FormGroup;
  public userForm!: FormGroup;
  public isEditMode = signal(false);
  public companyId: string | null = null;
  public isLoading = signal(false);
  public isUsersLoading = signal(false);
  public companyUsers = signal<any[]>([]);
  public showUserForm = signal(false);
  public globalServices = signal<ServiceItem[]>([]);
  public plans = signal<Plan[]>([]);

  // Toggles de Visibilidade da Senha
  public passwordHidden = signal(true);
  public confirmPasswordHidden = signal(true);
  public userPasswordHidden = signal(true);
  public userConfirmPasswordHidden = signal(true);

  constructor() {
    addIcons({ 
      businessOutline, 
      personOutline, 
      mailOutline, 
      cardOutline, 
      documentTextOutline, 
      cubeOutline, 
      addOutline, 
      trashOutline, 
      saveOutline, 
      personAddOutline, 
      shieldCheckmarkOutline, 
      keyOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      callOutline,
      closeCircleOutline,
      informationCircleOutline
    });
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      owner_name: [''],
      short_name: [''],
      description: [''],
      cnpj: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: [''],
      confirmPassword: [''],
      active: [true],
      services: [[]],
      plan_id: [''],
      catalog_module_enabled: [true]
    });

    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      type: ['company_owner', Validators.required],
      role: ['operator'],
      password: ['', [Validators.minLength(8)]],
      confirmPassword: ['']
    });

    this.loadGlobalServices();
    this.loadPlans();

    this.companyId = this.route.snapshot.paramMap.get('id');
    if (this.companyId && this.companyId !== 'create') {
      this.isEditMode.set(true);
      this.loadCompany(this.companyId);
      this.loadUsers(this.companyId);
    } else {
      this.isEditMode.set(false);
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.get('confirmPassword')?.setValidators([Validators.required]);
      this.form.get('password')?.updateValueAndValidity();
      this.form.get('confirmPassword')?.updateValueAndValidity();
    }
  }

  loadPlans() {
    this.planService.getPlans().subscribe({
      next: (res) => {
        if (res.success) {
          this.plans.set(res.data || []);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar planos:', err);
      }
    });
  }

  loadGlobalServices() {
    this.serviceService.getServices().subscribe({
      next: (res) => {
        if (res.success) {
          const activeServices = (res.data || []).filter(s => s.status === 'ACTIVE');
          this.globalServices.set(activeServices);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar serviços globais:', err);
      }
    });
  }

  loadCompany(id: string) {
    this.isLoading.set(true);
    this.companyService.getCompanyById(id).subscribe({
      next: (res: any) => {
        const companyData = res.data;
        if (companyData) {
          const rawServices = companyData.services || [];
          const serviceIds = rawServices.map((s: any) => typeof s === 'object' && s !== null ? s._id : String(s));

          this.form.patchValue({
            name: companyData.name || '',
            owner_name: companyData.owner_name || '',
            short_name: companyData.short_name || '',
            description: companyData.description || '',
            cnpj: this.applyCnpjMask(companyData.cnpj || ''),
            email: companyData.email || '',
            phone: this.applyPhoneMask(companyData.phone || ''),
            active: companyData.active !== undefined ? companyData.active : true,
            services: serviceIds,
            plan_id: companyData.subscription_id?.plan_id?._id || companyData.subscription_id?.plan_id || companyData.plan_id?._id || companyData.plan_id || '',
            catalog_module_enabled: companyData.catalog_module_enabled !== undefined ? companyData.catalog_module_enabled : true
          });
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast('Erro ao carregar dados da empresa');
        this.isLoading.set(false);
      }
    });
  }

  loadUsers(id: string) {
    this.isUsersLoading.set(true);
    this.companyService.getCompanyUsers(id).subscribe({
      next: (res: any) => {
        const users = res.data || [];
        this.companyUsers.set(users);
        this.isUsersLoading.set(false);

        // Se o formulário da empresa estiver com dados do responsável vazios, auto-preenche com o Dono
        const owner = users.find((u: any) => u.type === 'company_owner');
        if (owner) {
          const patchObj: any = {};
          if (!this.form.get('owner_name')?.value && owner.name) patchObj.owner_name = owner.name;
          if (!this.form.get('email')?.value && owner.email) patchObj.email = owner.email;
          if (!this.form.get('phone')?.value && owner.phone) patchObj.phone = this.applyPhoneMask(owner.phone);

          if (Object.keys(patchObj).length > 0) {
            this.form.patchValue(patchObj);
          }
        }
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast('Erro ao carregar usuários');
        this.isUsersLoading.set(false);
      }
    });
  }

  onCnpjInput(event: any) {
    const input = event.target as HTMLInputElement;
    let val = (input?.value || '').replace(/\D/g, '');
    if (val.length > 14) val = val.slice(0, 14);
    
    const masked = this.applyCnpjMask(val);
    this.form.get('cnpj')?.setValue(masked, { emitEvent: false });
    if (input) input.value = masked;
  }

  onPhoneInput(event: any) {
    const input = event.target as HTMLInputElement;
    let val = (input?.value || '').replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    const masked = this.applyPhoneMask(val);
    this.form.get('phone')?.setValue(masked, { emitEvent: false });
    if (input) input.value = masked;
  }

  onUserPhoneInput(event: any) {
    const input = event.target as HTMLInputElement;
    let val = (input?.value || '').replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    const masked = this.applyPhoneMask(val);
    this.userForm.get('phone')?.setValue(masked, { emitEvent: false });
    if (input) input.value = masked;
  }

  private applyCnpjMask(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    let formatted = digits;
    if (digits.length > 2) formatted = formatted.substring(0, 2) + '.' + formatted.substring(2);
    if (digits.length > 5) formatted = formatted.substring(0, 6) + '.' + formatted.substring(6);
    if (digits.length > 8) formatted = formatted.substring(0, 10) + '/' + formatted.substring(10);
    if (digits.length > 12) formatted = formatted.substring(0, 15) + '-' + formatted.substring(15, 17);
    return formatted;
  }

  private applyPhoneMask(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    let formatted = '(' + digits.substring(0, 2);
    if (digits.length > 2) formatted += ') ' + digits.substring(2, 7);
    if (digits.length > 7) formatted += '-' + digits.substring(7, 11);
    return formatted;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.global.errorToast('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    const rawData = this.form.getRawValue();

    if (!this.isEditMode()) {
      if (rawData.password !== rawData.confirmPassword) {
        this.global.errorToast('As senhas não conferem.');
        return;
      }
    }

    const payload: any = {
      name: rawData.name,
      owner_name: rawData.owner_name,
      short_name: rawData.short_name,
      description: rawData.description,
      cnpj: (rawData.cnpj || '').replace(/\D/g, ''),
      email: (rawData.email || '').trim().toLowerCase(),
      phone: (rawData.phone || '').replace(/\D/g, ''),
      active: rawData.active,
      services: rawData.services || [],
      plan_id: rawData.plan_id || null,
      catalog_module_enabled: rawData.catalog_module_enabled !== false
    };

    if (!this.isEditMode() && rawData.password) {
      payload.password = rawData.password;
    }

    this.isLoading.set(true);

    if (this.isEditMode()) {
      this.companyService.updateCompany(this.companyId!, payload).subscribe({
        next: () => {
          this.global.successToast('Empresa atualizada com sucesso!');
          this.router.navigateByUrl(Strings.SUPER_COMPANIES);
          this.isLoading.set(false);
        },
        error: (err: any) => {
          console.error(err);
          this.global.errorToast(err.error?.message || 'Erro ao salvar alterações');
          this.isLoading.set(false);
        }
      });
    } else {
      this.companyService.createCompany(payload).subscribe({
        next: () => {
          this.global.successToast('Empresa e conta do responsável criadas com sucesso!');
          this.router.navigateByUrl(Strings.SUPER_COMPANIES);
          this.isLoading.set(false);
        },
        error: (err: any) => {
          console.error(err);
          this.global.errorToast(err.error?.message || 'Erro ao criar empresa');
          this.isLoading.set(false);
        }
      });
    }
  }

  // --- Usuários Vinculados ---

  toggleUserForm() {
    this.showUserForm.set(!this.showUserForm());
    if (!this.showUserForm()) {
      this.userForm.reset({ type: 'company_owner', role: 'operator' });
    }
  }

  assignUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.global.errorToast('Preencha os dados do usuário corretamente.');
      return;
    }

    const rawData = this.userForm.getRawValue();
    if (rawData.password && rawData.password !== rawData.confirmPassword) {
      this.global.errorToast('As senhas do usuário não conferem.');
      return;
    }

    const payload = {
      name: rawData.name,
      email: (rawData.email || '').trim().toLowerCase(),
      phone: (rawData.phone || '').replace(/\D/g, ''),
      type: rawData.type,
      role: rawData.type === 'company_owner' ? 'owner' : (rawData.role || 'operator'),
      password: rawData.password
    };

    this.isUsersLoading.set(true);
    this.companyService.assignUser(this.companyId!, payload).subscribe({
      next: () => {
        this.global.successToast('Usuário vinculado com sucesso!');
        this.toggleUserForm();
        this.loadUsers(this.companyId!);
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast(err.error?.message || 'Erro ao vincular usuário');
        this.isUsersLoading.set(false);
      }
    });
  }

  async removeUser(userId: string, userName?: string) {
    const alert = await this.alertCtrl.create({
      header: 'Desvincular Usuário',
      subHeader: userName ? `Conta: ${userName}` : undefined,
      message: 'Tem certeza que deseja desvincular este usuário da empresa? Ele perderá o acesso a esta unidade.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sim, Desvincular',
          role: 'destructive',
          handler: () => {
            this.executeRemoveUser(userId);
          }
        }
      ]
    });

    await alert.present();
  }

  private executeRemoveUser(userId: string) {
    this.isUsersLoading.set(true);
    this.companyService.removeUser(this.companyId!, userId).subscribe({
      next: () => {
        this.global.successToast('Usuário desvinculado com sucesso!');
        this.loadUsers(this.companyId!);
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast(err.error?.message || 'Erro ao remover usuário');
        this.isUsersLoading.set(false);
      }
    });
  }

  getUserRoleLabel(usr: any): string {
    if (usr.type === 'company_owner') return 'Dono';
    if (usr.role === 'supervisor') return 'Supervisor';
    if (usr.role === 'technician' || (usr.type === 'collaborator' && usr.role !== 'operator')) return 'Técnico';
    if (usr.role === 'operator' || usr.type === 'admin') return 'Operador';
    return usr.role || usr.type || 'Usuário';
  }

  getUserRoleBadgeClass(usr: any): string {
    if (usr.type === 'company_owner') return 'role-badge--owner';
    if (usr.role === 'supervisor') return 'role-badge--supervisor';
    if (usr.role === 'technician' || (usr.type === 'collaborator' && usr.role !== 'operator')) return 'role-badge--technician';
    if (usr.role === 'operator' || usr.type === 'admin') return 'role-badge--operator';
    return 'role-badge--default';
  }
}