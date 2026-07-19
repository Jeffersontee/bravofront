import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { StaffService, StaffUser } from 'src/app/services/staff/staff.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { keyOutline, shieldCheckmarkOutline, peopleOutline, listOutline } from 'ionicons/icons';

@Component({
  selector: 'app-staff-panel',
  templateUrl: './staff-panel.component.html',
  styleUrls: ['./staff-panel.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class StaffPanelComponent implements OnInit {
  private staffService = inject(StaffService);
  private global = inject(GlobalService);
  private router = inject(Router);

  staffList = signal<StaffUser[]>([]);
  isLoading = signal(true);

  superAdminsCount = signal(0);
  companyOwnersCount = signal(0);
  activeCount = signal(0);

  constructor() {
    addIcons({ keyOutline, shieldCheckmarkOutline, peopleOutline, listOutline });
  }

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    this.isLoading.set(true);
    this.staffService.getStaffList().subscribe({
      next: (res) => {
        this.staffList.set(res.data);
        this.calculateStats(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.global.errorToast('Erro ao carregar dados');
        this.isLoading.set(false);
      }
    });
  }

  calculateStats(list: StaffUser[]) {
    this.activeCount.set(list.filter(u => u.status === 'active').length);
    this.superAdminsCount.set(list.filter(u => u.type === 'super_admin').length);
    this.companyOwnersCount.set(list.filter(u => u.type === 'company_owner').length);
  }

  goToEdit(id: string) {
    this.router.navigateByUrl(`/super-admin/staff/edit/${id}`);
  }
}
