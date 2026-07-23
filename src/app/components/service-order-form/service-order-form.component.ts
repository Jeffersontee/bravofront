import { Component, OnInit, inject, input, output, signal, effect, computed, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { 
  IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonToggle, 
  IonButton, IonIcon, IonSpinner, IonContent, IonItemDivider, IonProgressBar, IonTextarea 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  businessOutline, locationOutline, constructOutline, peopleOutline, 
  calendarOutline, documentTextOutline, saveOutline, closeOutline 
} from 'ionicons/icons';
import { CompanyService } from 'src/app/services/company/company.service';
import { ServiceService } from 'src/app/services/service/service.service';
import { CollaboratorService } from 'src/app/services/collaborator/collaborator.service';
import { UnitService } from 'src/app/services/unit/unit.service';

@Component({
  selector: 'app-service-order-form',
  templateUrl: './service-order-form.component.html',
  styleUrls: ['./service-order-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonToggle, 
    IonButton, IonIcon, IonContent, IonItemDivider, IonSpinner, IonProgressBar, IonTextarea
  ]
})
export class ServiceOrderFormComponent implements OnInit {
  isLoadingData = signal<boolean>(false);
  isLoading = input<boolean>(false);
  isEditMode = input<boolean>(false);
  isReadOnly = input<boolean>(false);
  data = input<any>(null);

  save = output<any>();
  cancel = output<void>();

  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private unitService = inject(UnitService);
  private serviceService = inject(ServiceService);
  private collaboratorService = inject(CollaboratorService);

  form!: FormGroup;
  formReady = signal<boolean>(false);
  formChanged = signal<boolean>(false);

  companies = signal<any[]>([]);
  units = signal<any[]>([]);
  services = signal<any[]>([]);
  collaborators = signal<any[]>([]);

  hasChanges = computed(() => {
    const changed = this.formChanged();
    if (!this.formReady() || !this.form) return false;
    if (!this.isEditMode()) return this.form.valid;
    return changed || this.form.dirty;
  });

  constructor() {
    addIcons({ 
      businessOutline, locationOutline, constructOutline, peopleOutline, 
      calendarOutline, documentTextOutline, saveOutline, closeOutline 
    });

    effect(() => {
      if (!this.formReady() || !this.form) return;
      const isReadOnly = this.isReadOnly();
      const loading = this.isLoading();
      
      if (isReadOnly || loading) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    });

    effect(() => {
      const order = this.data();
      if (order) {
        untracked(() => this.patchForm(order));
      }
    });
  }

  ngOnInit() {
    this.initForm();
    this.loadDropdownData();

    // Sincronização de combos dependentes: quando a empresa mudar, recarrega filiais, colaboradores e serviços daquela empresa
    this.form.get('company_id')?.valueChanges.subscribe((companyId) => {
      if (companyId) {
        // Reset dos selects filhos sem disparar eventos circulares infinitos
        this.form.get('unit_id')?.setValue('', { emitEvent: false });
        this.form.get('collaborator_id')?.setValue('', { emitEvent: false });
        this.form.get('service_id')?.setValue('', { emitEvent: false });

        this.loadCompanyDependentData(companyId);
      } else {
        this.units.set([]);
        this.collaborators.set([]);
        this.services.set([]);
      }
    });

    this.form.valueChanges.subscribe(() => {
      if (this.form.dirty) {
        this.formChanged.set(true);
      }
    });
  }

  private initForm() {
    this.form = this.fb.group({
      company_id: ['', Validators.required],
      unit_id: ['', Validators.required],
      service_id: ['', Validators.required],
      collaborator_id: [''],
      scheduled_date: [new Date().toISOString().substring(0, 16), Validators.required],
      observations: [''],
      address_override: [''],
      gut_gravity: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      gut_urgency: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      gut_trend: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
    this.formReady.set(true);
  }

  private loadDropdownData() {
    this.isLoadingData.set(true);
    this.companyService.getCompanies().subscribe({
      next: (res) => {
        this.companies.set(res.data || []);
        this.isLoadingData.set(false);
      },
      error: () => {
        this.isLoadingData.set(false);
      }
    });
  }

  private loadCompanyDependentData(companyId: string) {
    // 1. Carregar filiais/unidades
    this.unitService.getUnits().subscribe({
      next: (res) => {
        const allUnits = res.data || [];
        this.units.set(allUnits.filter((u: any) => u.company_id === companyId || u.company_id?._id === companyId));
      }
    });

    // 2. Carregar colaboradores da empresa (e técnicos globais)
    this.collaboratorService.getCollaborators().subscribe({
      next: (res: any) => {
        const allCollabs = res.data || [];
        this.collaborators.set(allCollabs.filter((u: any) => u.company_id === companyId || u.company_id?._id === companyId || !u.company_id));
      }
    });

    // 3. Carregar serviços da empresa baseados no array company.services
    this.companyService.getCompanyById(companyId).subscribe({
      next: (companyRes) => {
        if (companyRes.success && companyRes.data) {
          const activeServiceIds = companyRes.data.services || [];
          
          this.serviceService.getServices().subscribe({
            next: (servicesRes) => {
              if (servicesRes.success) {
                const allServices = servicesRes.data || [];
                // Filtra mantendo apenas os serviços habilitados para a empresa
                this.services.set(allServices.filter(s => activeServiceIds.includes(s._id!)));
              }
            }
          });
        }
      }
    });
  }

  private patchForm(order: any) {
    if (!this.form) this.initForm();

    const companyId = order.company_id?._id || order.company_id || '';
    if (companyId) {
      this.loadCompanyDependentData(companyId);
    }

    // Formatar data ISO para input datetime-local do HTML
    let dateStr = '';
    if (order.scheduled_date) {
      const d = new Date(order.scheduled_date);
      // ajuste timezone local
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      dateStr = d.toISOString().substring(0, 16);
    }

    this.form.patchValue({
      company_id: companyId,
      unit_id: order.unit_id?._id || order.unit_id || '',
      service_id: order.service_id?._id || order.service_id || '',
      collaborator_id: order.collaborator_id?._id || order.collaborator_id || '',
      scheduled_date: dateStr,
      observations: order.observations || '',
      address_override: order.address_override || '',
      gut_gravity: order.gut_gravity || 1,
      gut_urgency: order.gut_urgency || 1,
      gut_trend: order.gut_trend || 1
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
