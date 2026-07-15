import { Component, OnInit, input, output, signal, effect, untracked, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { 
  IonList, IonItem, IonLabel, IonInput, IonToggle, IonButton, IonIcon, IonSpinner, IonContent,
  IonItemDivider, IonProgressBar, IonNote, IonTextarea 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, mail, call, businessOutline, documentTextOutline, addCircleOutline } from 'ionicons/icons';
import { Company } from 'src/app/services/company/company.service';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    IonList, IonItem, IonLabel, IonInput, IonToggle, IonButton, IonIcon, IonContent,
    IonItemDivider, IonTextarea, IonSpinner, IonNote, IonProgressBar
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

  hasChanges = computed(() => {
    const changed = this.formChanged();
    if (!this.formReady() || !this.companyForm) return false;
    if (!this.isEditMode()) return this.companyForm.valid;
    return changed || this.companyForm.dirty;
  });

  constructor() {
    addIcons({ person, mail, call, businessOutline, documentTextOutline, addCircleOutline });

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
      cnpj: ['', [Validators.required, Validators.minLength(14)]],
      email: ['', [Validators.email]],
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

  private patchForm(data: Company) {
    if (!this.companyForm) this.initForm();

    this.companyForm.patchValue({
      name: data.name || '',
      owner_name: data.owner_name || '',
      short_name: data.short_name || '',
      cnpj: this.applyCnpjMask(data.cnpj || ''),
      email: data.email || '',
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
    
    const payload: Partial<Company> = {
      name: formValue.name,
      owner_name: formValue.owner_name,
      short_name: formValue.short_name,
      cnpj: (formValue.cnpj || '').replace(/\D/g, ''),
      email: formValue.email?.trim().toLowerCase() || '',
      description: formValue.description || '',
      active: formValue.active
    };

    this.save.emit(payload);
  }
}
