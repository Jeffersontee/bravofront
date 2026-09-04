import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { StaffService, StaffUser } from 'src/app/services/staff/staff.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { StaffFormComponent } from 'src/app/components/staff-form/staff-form.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-staff-form-page',
  templateUrl: './staff-form-page.component.html',
  styleUrls: ['./staff-form-page.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, StaffFormComponent]
})
export class StaffFormPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private staffService = inject(StaffService);
  private global = inject(GlobalService);
  private profileService = inject(ProfileService);

  userData = signal<StaffUser | null>(null);
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  userId: string | null = null;

  isCompany = computed(() => {
    const profile = this.profileService.profile() as any;
    return this.router.url.includes('/company') || (profile && profile.type !== 'super_admin');
  });

  backUrl = computed(() => {
    return this.isCompany() ? '/company/staff' : '/super-admin/staff';
  });

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
      this.global.errorToast('Erro ao carregar dados do usuário');
      this.router.navigate([this.backUrl()]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSave(payload: Partial<StaffUser>) {
    this.isLoading.set(true);
    try {
      if (this.isEditMode() && this.userId) {
        await firstValueFrom(this.staffService.updateStaff(this.userId, payload));
        this.global.successToast(this.isCompany() ? 'Colaborador atualizado com sucesso!' : 'Usuário atualizado com sucesso!');
      } else {
        await firstValueFrom(this.staffService.createStaff(payload));
        this.global.successToast(this.isCompany() ? 'Colaborador cadastrado com sucesso!' : 'Usuário cadastrado com sucesso!');
      }
      this.router.navigate([this.backUrl()]);
    } catch (e: any) {
      console.error(e);
      this.global.errorToast(e.error?.message || 'Erro ao salvar');
    } finally {
      this.isLoading.set(false);
    }
  }
}
