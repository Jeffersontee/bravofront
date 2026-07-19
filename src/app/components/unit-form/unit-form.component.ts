import { Component, OnInit, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { businessOutline, documentTextOutline, mail, person, locationOutline, callOutline } from 'ionicons/icons';
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

  // Signals
  unitData = input<Unit | null>(null);
  isLoading = input<boolean>(false);
  isEditMode = input<boolean>(false);
  
  // Outputs
  save = output<Partial<Unit>>();

  unitForm!: FormGroup;
  collaborators: Collaborator[] = [];

  constructor() {
    addIcons({ businessOutline, documentTextOutline, mail, person, locationOutline, callOutline });
    
    this.unitForm = this.fb.group({
      name: ['', Validators.required],
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
  }

  ngOnInit() {
    this.loadCollaborators();
    
    if (this.unitData()) {
      const data = this.unitData()!;
      this.unitForm.patchValue({
        name: data.name,
        status: data.status,
        cnpj: data.cnpj || '',
        phone: data.phone || '',
        email: data.email || '',
        short_name: data.short_name || '',
        address: data.address,
        manager_id: data.manager_id?._id || data.manager_id,
        follower_ids: data.follower_ids?.map((f: any) => f._id || f) || []
      });
    }
  }

  loadCollaborators() {
    this.collaboratorService.getCollaborators().subscribe({
      next: (res) => {
        if (res.success) {
          this.collaborators = res.data;
        }
      },
      error: (err) => {
        console.error('Error loading collaborators', err);
      }
    });
  }

  onSubmit() {
    if (this.unitForm.valid) {
      this.save.emit(this.unitForm.value);
    } else {
      this.unitForm.markAllAsTouched();
    }
  }
}
