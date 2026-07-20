import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonIcon, IonToggle, ModalController, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { Company } from 'src/app/services/company/company.service';
import { Unit } from 'src/app/services/unit/unit.service';
import { ServiceItem } from 'src/app/services/service/service.service';
import { ServiceOrderService, ServiceOrder } from 'src/app/services/service-order/service-order.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-visit-modal',
  templateUrl: './visit-modal.component.html',
  styleUrls: ['./visit-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonIcon, IonToggle, IonSpinner]
})
export class VisitModalComponent implements OnInit {
  @Input() company!: Company;
  @Input() units: Unit[] = [];
  @Input() services: ServiceItem[] = [];
  @Input() serviceOrder?: ServiceOrder;

  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);
  private serviceOrderService = inject(ServiceOrderService);
  private global = inject(GlobalService);

  visitForm!: FormGroup;
  isLoading = false;
  
  categories: string[] = ['ELÉTRICA', 'HIDRÁULICA/CIVIL', 'SERRALHERIA'];
  selectedCategory = '';

  constructor() { 
    addIcons({ closeOutline });
  }

  ngOnInit() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localNow = new Date(now.getTime() - (offset * 60 * 1000));
    const defaultDateTime = localNow.toISOString().slice(0, 16);

    this.visitForm = this.fb.group({
      scheduled_date: [defaultDateTime, Validators.required],
      unit_id: ['', Validators.required],
      service_id: ['', Validators.required],
      notes: [''],
      time_spent: [''],
      km_driven: [''],
      fuel_cost: [''],
      zone: [''],
      address_override: [''],
      observations: [''],
      current_status: ['SOLICITADO']
    });

    if (this.serviceOrder) {
      // Edit mode
      const unitId = typeof this.serviceOrder.unit_id === 'object' ? (this.serviceOrder.unit_id as any)._id : this.serviceOrder.unit_id;
      const serviceId = typeof this.serviceOrder.service_id === 'object' ? (this.serviceOrder.service_id as any)._id : this.serviceOrder.service_id;
      
      let formattedDate = '';
      if (this.serviceOrder.scheduled_date) {
        const d = new Date(this.serviceOrder.scheduled_date);
        const off = d.getTimezoneOffset();
        const loc = new Date(d.getTime() - (off * 60 * 1000));
        formattedDate = loc.toISOString().slice(0, 16);
      }
      
      this.visitForm.patchValue({
        ...this.serviceOrder,
        unit_id: unitId,
        service_id: serviceId,
        scheduled_date: formattedDate
      });

      // Find the category of the selected service
      const selectedService = this.services.find(s => s._id === serviceId);
      if (selectedService) {
        this.selectedCategory = selectedService.category || '';
        if (!this.categories.includes(this.selectedCategory) && this.selectedCategory) {
          this.categories.push(this.selectedCategory); // Add dynamically if not present
        }
      }
    }
  }

  onUnitChange(event: any) {
    const unitId = event.target.value;
    const unit = this.units.find(u => u._id === unitId);
    if (unit && unit.address) {
      const addr = `${unit.address.street}, ${unit.address.number} - ${unit.address.city}/${unit.address.state}`;
      this.visitForm.patchValue({ address_override: addr });
    }
  }

  get filteredServices() {
    if (!this.selectedCategory) return [];
    return this.services.filter(s => s.category === this.selectedCategory);
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
    this.visitForm.patchValue({ service_id: '' });
  }

  get isCompleted() {
    return this.visitForm.get('current_status')?.value === 'CONCLUIDO';
  }

  toggleCompleted(event: any) {
    const checked = event.detail.checked;
    this.visitForm.patchValue({ current_status: checked ? 'CONCLUIDO' : 'PENDENTE' });
  }

  dismiss(refresh = false) {
    this.modalCtrl.dismiss({ refresh });
  }

  async save() {
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const payload = this.visitForm.value;
    payload.company_id = this.company._id;

    try {
      if (this.serviceOrder && this.serviceOrder._id) {
        await this.serviceOrderService.updateServiceOrder(this.serviceOrder._id, payload).toPromise();
        this.global.successToast('Solicitação atualizada com sucesso');
      } else {
        await this.serviceOrderService.createServiceOrder(payload).toPromise();
        this.global.successToast('Solicitação criada com sucesso');
      }
      this.dismiss(true);
    } catch (e: any) {
      this.global.errorToast(e.error?.message || 'Erro ao salvar solicitação');
    } finally {
      this.isLoading = false;
    }
  }
}
