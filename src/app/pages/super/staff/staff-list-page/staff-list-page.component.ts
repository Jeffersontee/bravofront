import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { StaffService, StaffUser } from 'src/app/services/staff/staff.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { gridOutline, listOutline, addOutline, refreshOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-staff-list-page',
  templateUrl: './staff-list-page.component.html',
  styleUrls: ['./staff-list-page.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class StaffListPageComponent implements OnInit {
  private staffService = inject(StaffService);
  private router = inject(Router);
  private global = inject(GlobalService);

  staffList = signal<StaffUser[]>([]);
  isLoading = signal(true);
  viewMode = signal<'list' | 'card'>('list');

  constructor() {
    addIcons({ gridOutline, listOutline, addOutline, refreshOutline, personOutline });
  }

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    this.isLoading.set(true);
    this.staffService.getStaffList().subscribe({
      next: (res) => {
        this.staffList.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.global.errorToast('Erro ao carregar usuários globais');
        this.isLoading.set(false);
      }
    });
  }

  goToCreate() {
    this.router.navigateByUrl('/super-admin/staff/create');
  }

  goToEdit(id: string) {
    this.router.navigateByUrl(`/super-admin/staff/edit/${id}`);
  }
}
