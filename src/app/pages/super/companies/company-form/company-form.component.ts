import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
  IonList, IonItem, IonInput, IonLabel, IonToggle, IonButton, 
  IonSpinner, IonCard, IonCardContent, IonSelect, IonSelectOption,
  IonIcon, IonBadge
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from 'src/app/services/company/company.service';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
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
  callOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
    IonList, IonItem, IonInput, IonLabel, IonToggle, IonButton, 
    IonSpinner, IonCard, IonCardContent, IonSelect, IonSelectOption,
    IonIcon, IonBadge
  ]
})
export class CompanyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private serviceService = inject(ServiceService);
  private global = inject(GlobalService);
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

  // Toggles de Visibilidade da Senha (conforme o design do Signup)
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
      callOutline
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
      services: [[]]
    });

    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      type: ['company_owner', Validators.required],
      password: ['', [Validators.minLength(8)]],
      confirmPassword: ['']
    });

    this.loadGlobalServices();

    this.companyId = this.route.snapshot.paramMap.get('id');
    if (this.companyId && this.companyId !== 'create') {
      this.isEditMode.set(true);
      this.loadCompany(this.companyId);
      this.loadUsers(this.companyId);
    } else {
      this.isEditMode.set(false);
      // Na criação, adiciona validadores de senha de 8 caracteres
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.get('confirmPassword')?.setValidators([Validators.required]);
      this.form.get('password')?.updateValueAndValidity();
      this.form.get('confirmPassword')?.updateValueAndValidity();
    }
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
        this.form.patchValue(res.data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast('Erro ao carregar empresa');
        this.isLoading.set(false);
      }
    });
  }

  loadUsers(id: string) {
    this.isUsersLoading.set(true);
    this.companyService.getCompanyUsers(id).subscribe({
      next: (res: any) => {
        this.companyUsers.set(res.data || []);
        this.isUsersLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast('Erro ao carregar usuários');
        this.isUsersLoading.set(false);
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.getRawValue();

    if (!this.isEditMode()) {
      if (data.password !== data.confirmPassword) {
        this.global.errorToast('As senhas não conferem.');
        return;
      }
    }

    this.isLoading.set(true);

    if (this.isEditMode()) {
      this.companyService.updateCompany(this.companyId!, data).subscribe({
        next: (res: any) => {
          this.global.successToast('Empresa atualizada!');
          this.router.navigateByUrl(Strings.SUPER_COMPANIES);
          this.isLoading.set(false);
        },
        error: (err: any) => {
          console.error(err);
          this.global.errorToast(err.error?.message || 'Erro ao salvar');
          this.isLoading.set(false);
        }
      });
    } else {
      this.companyService.createCompany(data).subscribe({
        next: (res: any) => {
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

  // --- Usuários ---

  toggleUserForm() {
    this.showUserForm.set(!this.showUserForm());
    if (!this.showUserForm()) {
      this.userForm.reset({ type: 'company_owner' });
    }
  }

  assignUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const data = this.userForm.getRawValue();
    if (data.password && data.password !== data.confirmPassword) {
      this.global.errorToast('As senhas do usuário não conferem.');
      return;
    }

    this.isUsersLoading.set(true);
    this.companyService.assignUser(this.companyId!, data).subscribe({
      next: (res: any) => {
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

  async removeUser(userId: string) {
    const confirm = await this.global.showButtonToast('Tem certeza que deseja desvincular este usuário?');
    if (!confirm) return;

    this.isUsersLoading.set(true);
    this.companyService.removeUser(this.companyId!, userId).subscribe({
      next: () => {
        this.global.successToast('Usuário removido da empresa');
        this.loadUsers(this.companyId!);
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast('Erro ao remover usuário');
        this.isUsersLoading.set(false);
      }
    });
  }
}