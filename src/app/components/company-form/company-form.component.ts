import { Component, OnInit, input, output, signal, effect, untracked, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { 
  IonItem, IonInput, IonToggle, IonButton, IonIcon, IonSpinner, IonProgressBar, IonTextarea 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  person, mail, call, businessOutline, documentTextOutline, addCircleOutline,
  lockClosedOutline, eyeOutline, eyeOffOutline, personOutline, mailOutline, callOutline,
  saveOutline, cardOutline, checkmarkCircleOutline, alertCircleOutline
} from 'ionicons/icons';
import { Company } from 'src/app/services/company/company.service';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    IonItem, IonInput, IonToggle, IonButton, IonIcon, 
    IonTextarea, IonSpinner, IonProgressBar
  ]
})
export class CompanyFormComponent implements OnInit {
  data = input<Company | null>(null);
  isEditMode = input<boolean>(false);
  isReadOnly = input<boolean>(false);
  isLoading = input<boolean>(false);
  
  save = output<Partial<Company>>();

  private fb = inject(FormBuilder);

  companyForm!: FormGroup;
  formReady = signal<boolean>(false);
  formChanged = signal<boolean>(false);

  passwordHidden = signal<boolean>(true);
  confirmPasswordHidden = signal<boolean>(true);

  hasChanges = computed(() => {
    const changed = this.formChanged();
    if (!this.formReady() || !this.companyForm) return false;
    if (!this.isEditMode()) return this.companyForm.valid;
    return changed || this.companyForm.dirty;
  });

  constructor() {
    addIcons({ 
      person, mail, call, businessOutline, documentTextOutline, addCircleOutline,
      lockClosedOutline, eyeOutline, eyeOffOutline, personOutline, mailOutline, callOutline,
      saveOutline, cardOutline, checkmarkCircleOutline, alertCircleOutline
    });

    effect(() => {
      if (!this.formReady() || !this.companyForm) return;
      const isReadOnly = this.isReadOnly();
      const isLoading = this.isLoading();
      
      if (isReadOnly || isLoading) {
        this.companyForm.disable({ emitEvent: false });
      } else {
        this.companyForm.enable({ emitEvent: false });
      }
    });

    effect(() => {
      const company = this.data();
      if (company) {
        untracked(() => this.patchForm(company));
      }
    });

    effect(() => {
      const isEdit = this.isEditMode();
      if (this.formReady() && this.companyForm) {
        const passControl = this.companyForm.get('password');
        const cPassControl = this.companyForm.get('confirmPassword');
        if (!isEdit) {
          passControl?.setValidators([Validators.required, Validators.minLength(8)]);
          cPassControl?.setValidators([Validators.required]);
        } else {
          passControl?.clearValidators();
          cPassControl?.clearValidators();
        }
        passControl?.updateValueAndValidity({ emitEvent: false });
        cPassControl?.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.initForm();

    if (this.companyForm) {
      this.companyForm.valueChanges.subscribe(() => {
        if (this.companyForm.dirty) {
          this.formChanged.set(true);
        }
      });
    }
  }

  private initForm() {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      owner_name: ['', Validators.required],
      short_name: [''],
      cnpj: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: [''],
      confirmPassword: [''],
      description: [''],
      active: [true]
    });
    this.formReady.set(true);
  }

  onCnpjInput(event: any) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length > 14) val = val.slice(0, 14);
    
    const masked = this.applyCnpjMask(val);
    this.companyForm.get('cnpj')?.setValue(masked, { emitEvent: false });
    input.value = masked;
  }

  private applyCnpjMask(value: string): string {
    const digits = value.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 2) formatted = formatted.substring(0, 2) + '.' + formatted.substring(2);
    if (digits.length > 5) formatted = formatted.substring(0, 6) + '.' + formatted.substring(6);
    if (digits.length > 8) formatted = formatted.substring(0, 10) + '/' + formatted.substring(10);
    if (digits.length > 12) formatted = formatted.substring(0, 15) + '-' + formatted.substring(15, 17);
    return formatted;
  }

  onPhoneInput(event: any) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);

    const masked = this.applyPhoneMask(val);
    this.companyForm.get('phone')?.setValue(masked, { emitEvent: false });
    input.value = masked;
  }

  private applyPhoneMask(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    if (digits.length <= 10) return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
  }

  private patchForm(data: Company) {
    if (!this.companyForm) this.initForm();

    this.companyForm.patchValue({
      name: data.name || '',
      owner_name: data.owner_name || '',
      short_name: data.short_name || '',
      cnpj: this.applyCnpjMask(data.cnpj || ''),
      email: data.email || '',
      phone: this.applyPhoneMask((data as any).phone || ''),
      description: data.description || '',
      active: data.active !== undefined ? data.active : true
    });
    
    this.companyForm.markAsPristine();
    this.companyForm.markAsUntouched();
    this.formChanged.set(false);
  }

  onSubmit() {
    if (!this.companyForm.valid || this.isReadOnly()) return;

    const formValue = this.companyForm.getRawValue();

    if (!this.isEditMode()) {
      if (formValue.password !== formValue.confirmPassword) {
        return;
      }
    }
    
    const payload: Partial<Company> = {
      name: formValue.name,
      owner_name: formValue.owner_name,
      short_name: formValue.short_name,
      cnpj: (formValue.cnpj || '').replace(/\D/g, ''),
      email: formValue.email?.trim().toLowerCase() || '',
      phone: formValue.phone?.trim() || '',
      description: formValue.description || '',
      active: formValue.active,
      ...(formValue.password ? { password: formValue.password } : {})
    };

    this.save.emit(payload);
  }
}
