import { Component, OnInit, inject, input, output, signal, effect, computed, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { 
  IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonButton, IonIcon, IonSpinner, IonItemDivider, IonProgressBar, IonTextarea 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  businessOutline, locationOutline, constructOutline, peopleOutline, 
  calendarOutline, documentTextOutline, saveOutline, closeOutline 
} from 'ionicons/icons';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CompanyService } from 'src/app/services/company/company.service';
import { ServiceService } from 'src/app/services/service/service.service';
import { CollaboratorService } from 'src/app/services/collaborator/collaborator.service';
import { UnitService } from 'src/app/services/unit/unit.service';
import { getPriorityFromGUT, getGUTFromPriority, PriorityLevel } from 'src/app/utils/gut-priority.util';

@Component({
  selector: 'app-service-order-form',
  templateUrl: './service-order-form.component.html',
  styleUrls: ['./service-order-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonButton, IonIcon, IonItemDivider, IonSpinner, IonProgressBar, IonTextarea
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

  selectedPriority: PriorityLevel = '';
  private currentLoadedCompanyId = '';

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

    // Sincronização de combos dependentes: quando a empresa mudar manualmente pelo usuário
    this.form.get('company_id')?.valueChanges.subscribe((companyId) => {
      if (companyId && companyId !== this.currentLoadedCompanyId) {
        // Reset dos selects filhos apenas se a empresa tiver mudado pelo usuário
        this.form.get('unit_id')?.setValue('', { emitEvent: false });
        this.form.get('collaborator_id')?.setValue('', { emitEvent: false });
        this.form.get('service_id')?.setValue('', { emitEvent: false });

        this.loadCompanyDependentData(companyId);
      } else if (!companyId) {
        this.currentLoadedCompanyId = '';
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

  private loadCompanyDependentData(companyId: string, onComplete?: () => void) {
    this.currentLoadedCompanyId = companyId;
    this.isLoadingData.set(true);

    forkJoin({
      unitsRes: this.unitService.getUnits().pipe(catchError(() => of({ data: [] }))),
      collabsRes: this.collaboratorService.getCollaborators(companyId).pipe(catchError(() => of({ data: [] }))),
      compRes: this.companyService.getCompanyById(companyId).pipe(catchError(() => of({ success: false, data: null }))),
      servicesRes: this.serviceService.getServices().pipe(catchError(() => of({ success: false, data: [] })))
    }).subscribe({
      next: ({ unitsRes, collabsRes, compRes, servicesRes }) => {
        // 1. Unidades
        const allUnits = unitsRes.data || [];
        this.units.set(allUnits.filter((u: any) => u.company_id === companyId || u.company_id?._id === companyId));

        // 2. Colaboradores da empresa + Técnicos Globais
        const allCollabs = collabsRes.data || [];
        this.collaborators.set(allCollabs.filter((u: any) => {
          if (u.type === 'super_admin') return false;
          if (u.type === 'super_staff' && u.role !== 'technician' && u.role !== 'técnico') return false;
          
          const userCompId = u.company_id?._id || u.company_id;
          const isFromCompany = String(userCompId) === String(companyId);
          const isGlobal = !userCompId;
          
          return isFromCompany || isGlobal;
        }));

        // 3. Serviços habilitados para a empresa
        const activeServiceIds = (compRes?.success && compRes?.data?.services) ? compRes.data.services : [];
        const allServices = (servicesRes as any)?.data || [];
        if (activeServiceIds.length > 0) {
          this.services.set(allServices.filter((s: any) => activeServiceIds.includes(s._id!)));
        } else {
          this.services.set(allServices);
        }

        this.isLoadingData.set(false);

        if (onComplete) {
          onComplete();
        }
      },
      error: () => {
        this.isLoadingData.set(false);
        if (onComplete) onComplete();
      }
    });
  }

  private patchForm(order: any) {
    if (!this.form) this.initForm();

    const companyId = order.company_id?._id || order.company_id || '';
    const unitId = order.unit_id?._id || order.unit_id || '';
    const serviceId = order.service_id?._id || order.service_id || '';
    const collaboratorId = order.collaborator_id?._id || order.collaborator_id || '';

    // Formatar data ISO para input datetime-local do HTML
    let dateStr = '';
    if (order.scheduled_date) {
      const d = new Date(order.scheduled_date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      dateStr = d.toISOString().substring(0, 16);
    }

    if (companyId) {
      this.loadCompanyDependentData(companyId, () => {
        this.form.patchValue({
          company_id: companyId,
          unit_id: unitId,
          service_id: serviceId,
          collaborator_id: collaboratorId,
          scheduled_date: dateStr,
          observations: order.observations || '',
          address_override: order.address_override || '',
          gut_gravity: order.gut_gravity || 1,
          gut_urgency: order.gut_urgency || 1,
          gut_trend: order.gut_trend || 1
        }, { emitEvent: false });

        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.formChanged.set(false);
      });
    } else {
      this.form.patchValue({
        company_id: '',
        unit_id: unitId,
        service_id: serviceId,
        collaborator_id: collaboratorId,
        scheduled_date: dateStr,
        observations: order.observations || '',
        address_override: order.address_override || '',
        gut_gravity: order.gut_gravity || 1,
        gut_urgency: order.gut_urgency || 1,
        gut_trend: order.gut_trend || 1
      }, { emitEvent: false });
    }

    const g = order.gut_gravity || 1;
    const u = order.gut_urgency || 1;
    const t = order.gut_trend || 1;

    this.selectedPriority = getPriorityFromGUT(g, u, t);
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.formChanged.set(false);
  }

  setPriority(level: PriorityLevel) {
    if (this.isReadOnly() || !level) return;
    
    this.selectedPriority = level;
    const gut = getGUTFromPriority(level);

    this.form.patchValue({
      gut_gravity: gut.gravity,
      gut_urgency: gut.urgency,
      gut_trend: gut.trend
    });
    this.form.markAsDirty();
    this.formChanged.set(true);
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
