import { Component, OnInit, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  businessOutline, documentTextOutline, mailOutline, personOutline, 
  locationOutline, callOutline, informationCircleOutline, helpCircleOutline, 
  helpCircle, peopleOutline, shieldCheckmarkOutline, checkmarkCircleOutline,
  sparklesOutline, lockClosedOutline, chevronDownOutline
} from 'ionicons/icons';
import { Unit } from '../../services/unit/unit.service';
import { CollaboratorService, Collaborator } from '../../services/collaborator/collaborator.service';

@Component({
  selector: 'app-unit-form',
  templateUrl: './unit-form.component.html',
  styleUrls: ['./unit-form.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class UnitFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private collaboratorService = inject(CollaboratorService);

  // Signals de entrada/saída
  unitData = input<Unit | null>(null);
  companyId = input<string>('');
  isLoading = input<boolean>(false);
  isEditMode = input<boolean>(false);
  
  save = output<Partial<Unit>>();

  // Help toggles
  showHelpMain = signal<boolean>(false);
  showHelpAddress = signal<boolean>(false);
  showHelpTeam = signal<boolean>(false);

  unitForm!: FormGroup;
  collaborators = signal<Collaborator[]>([]);

  constructor() {
    addIcons({ 
      businessOutline, documentTextOutline, mailOutline, personOutline, 
      locationOutline, callOutline, informationCircleOutline, helpCircleOutline, 
      helpCircle, peopleOutline, shieldCheckmarkOutline, checkmarkCircleOutline,
      sparklesOutline, lockClosedOutline, chevronDownOutline
    });
    
    this.unitForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      status: ['ACTIVE'],
      cnpj: [''],
      phone: [''],
      email: ['', Validators.email],
      short_name: [''],
      address: this.fb.group({
        street: ['', Validators.required],
        number: ['', Validators.required],
        complement: [''],
        neighborhood: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipcode: ['', Validators.required]
      }),
      manager_id: [''],
      follower_ids: [[]]
    });

    effect(() => {
      const data = this.unitData();
      if (data) {
        this.unitForm.patchValue({
          name: data.name,
          status: data.status,
          cnpj: data.cnpj || '',
          phone: data.phone || '',
          email: data.email || '',
          short_name: data.short_name || '',
          address: data.address,
          manager_id: data.manager_id?._id || data.manager_id || '',
          follower_ids: data.follower_ids?.map((f: any) => f._id || f) || []
        });
      }
    });

    effect(() => {
      const resolvedCompanyId = this.resolveCompanyId();
      this.loadCollaborators(resolvedCompanyId);
    });
  }

  ngOnInit() {
    const resolvedCompanyId = this.resolveCompanyId();
    this.loadCollaborators(resolvedCompanyId);
  }

  private resolveCompanyId(): string {
    if (this.companyId()) return this.companyId();
    const data = this.unitData();
    if (data && data.company_id) {
      const cId = data.company_id as any;
      return typeof cId === 'object' && cId._id ? cId._id : String(cId);
    }
    return '';
  }

  loadCollaborators(companyId?: string) {
    this.collaboratorService.getCollaborators(companyId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Garante isolamento: exclui super_staff e outros tenants
          const filtered = res.data.filter(c => {
            if (c.type === 'super_staff' || c.type === 'super_admin') return false;
            if (companyId) {
              const cCompId = typeof c.company_id === 'object' ? c.company_id?._id : c.company_id;
              return String(cCompId) === String(companyId);
            }
            return true;
          });
          this.collaborators.set(filtered);
        }
      },
      error: (err) => {
        console.error('Error loading collaborators', err);
      }
    });
  }

  // Máscaras de entrada
  onCnpjInput(event: any) {
    let value = event.detail.value || '';
    value = value.replace(/\D/g, '');
    if (value.length > 14) value = value.substring(0, 14);
    
    if (value.length > 12) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    } else if (value.length > 8) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
    }
    
    this.unitForm.get('cnpj')?.setValue(value, { emitEvent: false });
  }

  onPhoneInput(event: any) {
    let value = event.detail.value || '';
    value = value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    }
    
    this.unitForm.get('phone')?.setValue(value, { emitEvent: false });
  }

  onZipcodeInput(event: any) {
    let value = event.detail.value || '';
    value = value.replace(/\D/g, '');
    if (value.length > 8) value = value.substring(0, 8);
    
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
    }
    
    this.unitForm.get('address.zipcode')?.setValue(value, { emitEvent: false });
  }

  toggleHelpMain() {
    this.showHelpMain.set(!this.showHelpMain());
  }

  toggleHelpAddress() {
    this.showHelpAddress.set(!this.showHelpAddress());
  }

  toggleHelpTeam() {
    this.showHelpTeam.set(!this.showHelpTeam());
  }

  onSubmit() {
    if (this.unitForm.valid) {
      this.save.emit(this.unitForm.getRawValue());
    } else {
      this.unitForm.markAllAsTouched();
    }
  }
}
