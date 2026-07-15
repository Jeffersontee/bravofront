import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonSpinner, IonBackButton, IonMenuButton, IonList, IonItem, IonIcon, IonLabel, IonBadge, IonButton } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitService, Unit } from 'src/app/services/unit/unit.service';
import { UnitFormComponent } from 'src/app/components/unit-form/unit-form.component';
import { GlobalService } from 'src/app/services/global/global.service';
import { Strings } from 'src/app/enum/strings';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import { businessOutline, business, addCircle } from 'ionicons/icons';

@Component({
  selector: 'app-unit',
  templateUrl: './unit.page.html',
  styleUrls: ['./unit.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonSpinner, 
    IonBackButton, IonMenuButton, IonList, IonItem, IonIcon, IonLabel, IonBadge, IonButton,
    CommonModule, FormsModule, 
    UnitFormComponent 
  ]
})
export class UnitPage {
  readonly Strings = Strings;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private unitService = inject(UnitService);
  private global = inject(GlobalService);

  companyId = signal<string>('');
  units = signal<Unit[]>([]);
  unitData = signal<Unit | null>(null);
  
  isListMode = signal<boolean>(true);
  isEditMode = signal<boolean>(false);
  isDetailsMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  constructor() {
    addIcons({ businessOutline, business, addCircle });
  }

  ionViewWillEnter() {
    this.loadInitialData();
  }

  private getCurrentCompanyId(): string {
    return this.route.snapshot.paramMap.get('id') || '';
  }

  private getCurrentUnitId(): string | null {
    return this.route.snapshot.paramMap.get('unitId');
  }

  async loadInitialData() {
    this.isLoading.set(true);
    
    // Reset state
    this.isEditMode.set(false);
    this.isListMode.set(false);
    this.isDetailsMode.set(false);
    this.unitData.set(null);

    const compId = this.getCurrentCompanyId();
    this.companyId.set(compId);

    if (!compId) {
      this.global.errorToast('ID da empresa não encontrado');
      this.router.navigate(['/establishment-admin/dashboard']);
      return;
    }

    try {
      const isCreate = this.router.url.includes('/create');
      const unitId = this.getCurrentUnitId();

      if (isCreate) {
        // Create mode
        this.isListMode.set(false);
        this.isEditMode.set(false);
      } else if (unitId) {
        // Edit mode
        this.isListMode.set(false);
        this.isEditMode.set(true);
        const response = await firstValueFrom(this.unitService.getUnitById(unitId));
        if (response.data) {
          this.unitData.set(response.data);
        }
      } else {
        // List mode
        this.isListMode.set(true);
        const response = await firstValueFrom(this.unitService.getUnits(compId));
        if (response.data) {
          this.units.set(response.data);
        }
      }
    } catch (error) {
      this.global.errorToast('Erro ao carregar dados');
    } finally {
      this.isLoading.set(false);
    }
  }

  goToCreate() {
    this.router.navigate([`/establishment-admin/companies/${this.companyId()}/units/create`]);
  }

  goToEdit(unitId: string) {
    this.router.navigate([`/establishment-admin/companies/${this.companyId()}/units/edit/${unitId}`]);
  }

  async onSave(payload: Partial<Unit>) {
    try {
      this.global.showLoader();
      
      const unitId = this.getCurrentUnitId();
      payload.company_id = this.companyId();

      if (this.isEditMode() && unitId) {
        await firstValueFrom(this.unitService.updateUnit(unitId, payload));
        this.global.successToast('Unidade atualizada com sucesso');
      } else {
        await firstValueFrom(this.unitService.createUnit(payload));
        this.global.successToast('Unidade cadastrada com sucesso');
      }
      
      // Voltar para a lista
      this.router.navigate([`/establishment-admin/companies/${this.companyId()}/units`]);
    } catch (e: any) {
      const message = e.error?.message || 'Erro ao salvar unidade';
      this.global.errorToast(message);
    } finally {
      this.global.hideLoader();
    }
  }
}
