import { Component, OnInit, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonHeader, IonTitle, IonToolbar, IonIcon, IonContent, IonToggle, IonModal, IonButton, IonButtons } from '@ionic/angular/standalone';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { flashOutline, waterOutline, constructOutline, hardwareChipOutline, shieldCheckmarkOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonTitle, IonToolbar, IonButtons, IonIcon, IonContent, IonToggle, IonModal, IonButton]
})
export class ServiceFormComponent implements OnInit {
  private serviceService = inject(ServiceService);
  private globalService = inject(GlobalService);
  private fb = inject(FormBuilder);

  isOpen = input<boolean>(false);
  editingService = input<ServiceItem | null>(null);
  isEditMode = input<boolean>(false);

  closed = output<void>();
  saved = output<void>();

  form: FormGroup;
  isLoading = false;

  availableIcons = [
    { name: 'flash-outline', label: 'Elétrica' },
    { name: 'construct-outline', label: 'Civil/Serralheria' },
    { name: 'water-outline', label: 'Hidráulica' },
    { name: 'hardware-chip-outline', label: 'Tecnologia' },
    { name: 'shield-checkmark-outline', label: 'Preventivo' }
  ];

  constructor() {
    addIcons({ flashOutline, waterOutline, constructOutline, hardwareChipOutline, shieldCheckmarkOutline, closeOutline });
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      icon: ['flash-outline', Validators.required],
      category: ['GERAL', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      status: ['ACTIVE']
    });

    effect(() => {
      const open = this.isOpen();
      const service = this.editingService();
      
      if (open) {
        if (service) {
          this.form.patchValue(service);
        } else {
          this.form.reset({ status: 'ACTIVE', category: 'GERAL', icon: 'flash-outline' });
        }
      }
    });
  }

  ngOnInit() {}

  closeModal() {
    this.closed.emit();
  }

  saveService() {
    if (this.form.invalid) return;
    this.isLoading = true;
    const payload = this.form.getRawValue();
    const current = this.editingService();

    if (current && current._id) {
      this.serviceService.updateService(current._id, payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.globalService.successToast('Serviço atualizado com sucesso!');
            this.saved.emit();
          }
          this.isLoading = false;
        },
        error: () => {
          this.globalService.errorToast('Erro ao atualizar serviço');
          this.isLoading = false;
        }
      });
    } else {
      this.serviceService.createService(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.globalService.successToast('Serviço criado com sucesso!');
            this.saved.emit();
          }
          this.isLoading = false;
        },
        error: () => {
          this.globalService.errorToast('Erro ao criar serviço');
          this.isLoading = false;
        }
      });
    }
  }
}
