import { Component, OnInit, input, output, signal, effect, untracked, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { 
  IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonToggle, 
  IonButton, IonIcon, IonSpinner, IonContent, IonItemDivider, IonProgressBar 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, mail, call, key, briefcaseOutline } from 'ionicons/icons';
import { Collaborator } from 'src/app/services/collaborator/collaborator.service';

@Component({
  selector: 'app-collaborator-form',
  templateUrl: './collaborator-form.component.html',
  styleUrls: ['./collaborator-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonToggle, 
    IonButton, IonIcon, IonContent, IonItemDivider, IonSpinner, IonProgressBar
  ]
})
export class CollaboratorFormComponent implements OnInit {
  data = input<Collaborator | null>(null);
  isEditMode = input<boolean>(false);
  isReadOnly = input<boolean>(false);
  isLoading = input<boolean>(false);
  
  save = output<Partial<Collaborator>>();

  private fb = inject(FormBuilder);

  collaboratorForm!: FormGroup;
  formReady = signal<boolean>(false);
  formChanged = signal<boolean>(false);

  roles = [
    { value: 'técnico', label: 'Técnico' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'administrativo', label: 'Administrativo' }
  ];

  hasChanges = computed(() => {
    const changed = this.formChanged();
    if (!this.formReady() || !this.collaboratorForm) return false;
    if (!this.isEditMode()) return this.collaboratorForm.valid;
    return changed || this.collaboratorForm.dirty;
  });

  constructor() {
    addIcons({ person, mail, call, key, briefcaseOutline });

    effect(() => {
      if (!this.formReady() || !this.collaboratorForm) return;
      const isReadOnly = this.isReadOnly();
      const isLoading = this.isLoading();
      
      if (isReadOnly || isLoading) {
        this.collaboratorForm.disable({ emitEvent: false });
      } else {
        this.collaboratorForm.enable({ emitEvent: false });
      }
    });

    effect(() => {
      const collaborator = this.data();
      if (collaborator) {
        untracked(() => this.patchForm(collaborator));
      }
    });

    effect(() => {
      if (!this.formReady() || !this.collaboratorForm) return;
      const editMode = this.isEditMode();
      const passwordControl = this.collaboratorForm.get('password');
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

    if (this.collaboratorForm) {
      this.collaboratorForm.valueChanges.subscribe(() => {
        if (this.collaboratorForm.dirty) {
          this.formChanged.set(true);
        }
      });
    }
  }

  private initForm() {
    this.collaboratorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      active: [true]
    });
    this.formReady.set(true);
  }

  onPhoneInput(event: any) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    const masked = this.applyPhoneMask(val);
    this.collaboratorForm.get('phone')?.setValue(masked, { emitEvent: false });
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

  private patchForm(data: Collaborator) {
    if (!this.collaboratorForm) this.initForm();

    this.collaboratorForm.patchValue({
      name: data.name || '',
      email: data.email || '',
      phone: this.applyPhoneMask(data.phone || ''),
      role: data.role || '',
      active: data.status === 'active'
    });
    
    this.collaboratorForm.markAsPristine();
    this.collaboratorForm.markAsUntouched();
    this.formChanged.set(false);
  }

  onSubmit() {
    if (!this.collaboratorForm.valid || this.isReadOnly()) return;

    const formValue = this.collaboratorForm.getRawValue();
    
    const payload: any = {
      name: formValue.name,
      email: formValue.email?.trim().toLowerCase() || '',
      phone: (formValue.phone || '').replace(/\D/g, ''),
      role: formValue.role,
      status: formValue.active ? 'active' : 'inactive'
    };

    if (!this.isEditMode() || formValue.password) {
      payload.password = formValue.password;
    }

    this.save.emit(payload);
  }
}
