import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonToggle, IonModal } from '@ionic/angular/standalone';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { flashOutline, waterOutline, constructOutline, hardwareChipOutline, shieldCheckmarkOutline, closeOutline, addCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonToggle, IonModal, CommonModule, FormsModule, ReactiveFormsModule]
})
export class ServicesPage implements OnInit {
  private serviceService = inject(ServiceService);
  private globalService = inject(GlobalService);
  private fb = inject(FormBuilder);

  services = signal<ServiceItem[]>([]);
  isModalOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  editingService = signal<ServiceItem | null>(null);

  form: FormGroup;

  availableIcons = [
    { name: 'flash-outline', label: 'Elétrica' },
    { name: 'construct-outline', label: 'Civil/Serralheria' },
    { name: 'water-outline', label: 'Hidráulica' },
    { name: 'hardware-chip-outline', label: 'Tecnologia' },
    { name: 'shield-checkmark-outline', label: 'Preventivo' }
  ];

  constructor() {
    addIcons({ flashOutline, waterOutline, constructOutline, hardwareChipOutline, shieldCheckmarkOutline, closeOutline, addCircleOutline });
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      icon: ['flash-outline', Validators.required],
      category: ['GERAL', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      status: ['ACTIVE']
    });
  }

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.serviceService.getServices().subscribe({
      next: (res) => {
        if (res.success) {
          this.services.set(res.data);
        }
      },
      error: () => this.globalService.errorToast('Erro ao carregar serviços')
    });
  }

  openModal(service?: ServiceItem) {
    this.form.reset({ status: 'ACTIVE', category: 'GERAL', icon: 'flash-outline' });
    if (service) {
      this.editingService.set(service);
      this.form.patchValue(service);
    } else {
      this.editingService.set(null);
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveService() {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    const payload = this.form.getRawValue();
    const current = this.editingService();

    if (current && current._id) {
      this.serviceService.updateService(current._id, payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.globalService.successToast('Serviço atualizado com sucesso!');
            this.closeModal();
            this.loadServices();
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.globalService.errorToast('Erro ao atualizar serviço');
          this.isLoading.set(false);
        }
      });
    } else {
      this.serviceService.createService(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.globalService.successToast('Serviço criado com sucesso!');
            this.closeModal();
            this.loadServices();
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.globalService.errorToast('Erro ao criar serviço');
          this.isLoading.set(false);
        }
      });
    }
  }

  deleteService(id: string) {
    // Add logic later if needed
  }
}
