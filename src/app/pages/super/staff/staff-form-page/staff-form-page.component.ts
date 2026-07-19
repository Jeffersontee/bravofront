import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { StaffService, StaffUser } from 'src/app/services/staff/staff.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { StaffFormComponent } from 'src/app/components/staff-form/staff-form.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-staff-form-page',
  templateUrl: './staff-form-page.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, StaffFormComponent]
})
export class StaffFormPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private staffService = inject(StaffService);
  private global = inject(GlobalService);

  userData = signal<StaffUser | null>(null);
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  userId: string | null = null;

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode.set(true);
      this.loadUser(this.userId);
    }
  }

  async loadUser(id: string) {
    this.isLoading.set(true);
    try {
      const response = await firstValueFrom(this.staffService.getStaffById(id));
      if (response.data) {
        this.userData.set(response.data);
      }
    } catch (error) {
      this.global.errorToast('Erro ao carregar usuário global');
      this.router.navigate(['/super-admin/staff']);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSave(payload: Partial<StaffUser>) {
    this.isLoading.set(true);
    try {
      if (this.isEditMode() && this.userId) {
        await firstValueFrom(this.staffService.updateStaff(this.userId, payload));
        this.global.successToast('Usuário atualizado com sucesso!');
      } else {
        await firstValueFrom(this.staffService.createStaff(payload));
        this.global.successToast('Usuário cadastrado com sucesso!');
      }
      this.router.navigate(['/super-admin/staff']);
    } catch (e: any) {
      console.error(e);
      this.global.errorToast(e.error?.message || 'Erro ao salvar usuário');
    } finally {
      this.isLoading.set(false);
    }
  }
}
