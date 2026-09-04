import { Component, OnInit, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonInput, IonSelect,
  IonSelectOption, IonTextarea, IonToggle, IonIcon,
  IonGrid, IonRow, IonCol, IonSpinner, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline, checkmarkOutline, pricetagOutline, cashOutline,
  layersOutline, businessOutline, peopleOutline, constructOutline,
  listOutline, textOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { Plan } from 'src/app/services/plan/plan.service';

@Component({
  selector: 'app-plans-form',
  templateUrl: './plans-form.component.html',
  styleUrls: ['./plans-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonToggle,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner
  ]
})
export class PlansFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);

  // Recebe o plano para edição via modalProps
  public planInput?: Plan;

  public planForm: FormGroup;
  public isSubmitting = false;

  constructor() {
    addIcons({
      closeOutline,
      checkmarkOutline,
      pricetagOutline,
      cashOutline,
      layersOutline,
      businessOutline,
      peopleOutline,
      constructOutline,
      listOutline,
      textOutline,
      checkmarkCircleOutline
    });

    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: [0, [Validators.required, Validators.min(0)]],
      billing_cycle: ['monthly', [Validators.required]],
      max_services: [10, [Validators.required, Validators.min(1)]],
      max_units: [1, [Validators.required, Validators.min(1)]],
      max_users: [1, [Validators.required, Validators.min(1)]],
      catalog_module_enabled: [true],
      status: ['active', [Validators.required]],
      description: [''],
      featuresText: ['']
    });
  }

  ngOnInit() {
    if (this.planInput) {
      const p = this.planInput;
      const featuresStr = Array.isArray(p.features) ? p.features.join('\n') : '';
      this.planForm.patchValue({
        name: p.name || '',
        price: p.price ?? 0,
        billing_cycle: p.billing_cycle || 'monthly',
        max_services: p.max_services ?? 10,
        max_units: p.max_units ?? 1,
        max_users: p.max_users ?? 1,
        catalog_module_enabled: p.catalog_module_enabled ?? true,
        status: p.status || 'active',
        description: p.description || '',
        featuresText: featuresStr
      });
    }
  }

  dismiss(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  onSubmit() {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    const raw = this.planForm.getRawValue();
    const featuresList = (raw.featuresText || '')
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    const payload: Partial<Plan> = {
      name: raw.name,
      price: Number(raw.price),
      billing_cycle: raw.billing_cycle,
      max_services: Number(raw.max_services),
      max_units: Number(raw.max_units),
      max_users: Number(raw.max_users),
      catalog_module_enabled: Boolean(raw.catalog_module_enabled),
      status: raw.status,
      description: raw.description,
      features: featuresList
    };

    if (this.planInput?._id) {
      payload._id = this.planInput._id;
    }

    this.dismiss(payload);
  }
}
