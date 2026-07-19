import { Component, OnInit, inject, input, output, effect, signal, computed, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  IonList, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, 
  IonToggle, IonButton, IonIcon, IonSpinner, IonContent, IonItemDivider, IonProgressBar 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  flashOutline, waterOutline, constructOutline, hardwareChipOutline, 
  shieldCheckmarkOutline, closeOutline, listOutline, saveOutline 
} from 'ionicons/icons';
import { ServiceItem } from 'src/app/services/service/service.service';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonList, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, 
    IonToggle, IonButton, IonIcon, IonSpinner, IonContent, IonItemDivider, IonProgressBar
  ]
})
export class ServiceFormComponent implements OnInit {
  data = input<ServiceItem | null>(null);
  isEditMode = input<boolean>(false);
  isReadOnly = input<boolean>(false);
  isLoading = input<boolean>(false);

  save = output<Partial<ServiceItem>>();
  cancel = output<void>();

  private fb = inject(FormBuilder);

  form!: FormGroup;
  formReady = signal<boolean>(false);
  formChanged = signal<boolean>(false);

  availableIcons = [
    { name: 'flash-outline', label: 'Elétrica' },
    { name: 'construct-outline', label: 'Civil/Serralheria' },
    { name: 'water-outline', label: 'Hidráulica' },
    { name: 'hardware-chip-outline', label: 'Tecnologia' },
    { name: 'shield-checkmark-outline', label: 'Preventivo' }
  ];

  hasChanges = computed(() => {
    const changed = this.formChanged();
    if (!this.formReady() || !this.form) return false;
    if (!this.isEditMode()) return this.form.valid;
    return changed || this.form.dirty;
  });

  constructor() {
    addIcons({ 
      flashOutline, waterOutline, constructOutline, hardwareChipOutline, 
      shieldCheckmarkOutline, closeOutline, listOutline, saveOutline 
    });

    effect(() => {
      if (!this.formReady() || !this.form) return;
      const isReadOnly = this.isReadOnly();
      const isLoading = this.isLoading();
      
      if (isReadOnly || isLoading) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    });

    effect(() => {
      const service = this.data();
      if (service) {
        untracked(() => this.patchForm(service));
      }
    });
  }

  ngOnInit() {
    this.initForm();

    if (this.form) {
      this.form.valueChanges.subscribe(() => {
        if (this.form.dirty) {
          this.formChanged.set(true);
        }
      });
    }
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      icon: ['flash-outline', Validators.required],
      category: ['GERAL', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      status: ['ACTIVE']
    });
    this.formReady.set(true);
  }

  private patchForm(service: ServiceItem) {
    if (!this.form) this.initForm();

    this.form.patchValue({
      name: service.name || '',
      description: service.description || '',
      icon: service.icon || 'flash-outline',
      category: service.category || 'GERAL',
      price: service.price || 0,
      status: service.status || 'ACTIVE'
    });

    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.formChanged.set(false);
  }

  onCancel() {
    this.cancel.emit();
  }

  onSubmit() {
    if (this.form.invalid || this.isReadOnly()) return;
    const formValue = this.form.getRawValue();
    this.save.emit(formValue);
  }
}
