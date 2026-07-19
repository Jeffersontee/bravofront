import { Component, OnInit, input, output, signal, effect, untracked, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { 
  IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonToggle, 
  IonButton, IonIcon, IonSpinner, IonContent, IonItemDivider, IonProgressBar 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, mail, call, key, businessOutline } from 'ionicons/icons';
import { StaffUser } from 'src/app/services/staff/staff.service';
import { CompanyService, Company } from 'src/app/services/company/company.service';

@Component({
  selector: 'app-staff-form',
  templateUrl: './staff-form.component.html',
  styleUrls: ['./staff-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonToggle, 
    IonButton, IonIcon, IonContent, IonItemDivider, IonSpinner, IonProgressBar
  ]
})
export class StaffFormComponent implements OnInit {
  data = input<StaffUser | null>(null);
  isEditMode = input<boolean>(false);
  isReadOnly = input<boolean>(false);
  isLoading = input<boolean>(false);
  
  save = output<Partial<StaffUser>>();

  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);

  staffForm!: FormGroup;
  formReady = signal<boolean>(false);
  formChanged = signal<boolean>(false);
  companies = signal<Company[]>([]);

  types = [
    { value: 'super_admin', label: 'Super Administrador' },
    { value: 'company_owner', label: 'Dono de Empresa' },
    { value: 'admin', label: 'Gerente / Operador' },
    { value: 'collaborator', label: 'Colaborador / Campo' }
  ];

  hasChanges = computed(() => {
    const changed = this.formChanged();
    if (!this.formReady() || !this.staffForm) return false;
    if (!this.isEditMode()) return this.staffForm.valid;
    return changed || this.staffForm.dirty;
  });

  constructor() {
    addIcons({ person, mail, call, key, businessOutline });

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
    }
  }

  private initForm() {
    this.staffForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(6)]],
      type: ['admin', Validators.required],
      company_id: [''],
      active: [true]
    });
    this.formReady.set(true);
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (res: any) => {
        this.companies.set(res.data);
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

    this.staffForm.patchValue({
      name: data.name || '',
      email: data.email || '',
      phone: this.applyPhoneMask(data.phone || ''),
      type: data.type || 'admin',
      company_id: data.company_id?._id || data.company_id || '',
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
      company_id: formValue.company_id || null,
      status: formValue.active ? 'active' : 'inactive'
    };

    if (!this.isEditMode() || formValue.password) {
      payload.password = formValue.password;
    }

    this.save.emit(payload);
  }
}
