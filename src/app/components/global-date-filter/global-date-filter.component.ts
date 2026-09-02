import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonDatetime, IonFooter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, closeOutline, checkmarkOutline, arrowForwardOutline, arrowDownOutline } from 'ionicons/icons';
import { DateFilterService } from 'src/app/services/date-filter/date-filter.service';

@Component({
  selector: 'app-global-date-filter',
  templateUrl: './global-date-filter.component.html',
  styleUrls: ['./global-date-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonDatetime, IonFooter]
})
export class GlobalDateFilterComponent {
  private dateFilterService = inject(DateFilterService);

  public isModalOpen = signal(false);
  public tempStartDate = signal<string>(this.dateFilterService.startDate());
  public tempEndDate = signal<string>(this.dateFilterService.endDate());

  constructor() {
    addIcons({ calendarOutline, closeOutline, checkmarkOutline, arrowForwardOutline, arrowDownOutline });
  }

  get currentLabel(): string {
    const start = new Date(this.dateFilterService.startDate());
    const end = new Date(this.dateFilterService.endDate());
    
    // Format: 01 Ago - 31 Ago, 2026
    const startStr = start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
    const endStr = end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
    
    if (start.getFullYear() === end.getFullYear()) {
      return `${startStr} - ${endStr}, ${start.getFullYear()}`;
    } else {
      return `${startStr}, ${start.getFullYear()} - ${endStr}, ${end.getFullYear()}`;
    }
  }

  openModal() {
    this.tempStartDate.set(this.dateFilterService.startDate());
    this.tempEndDate.set(this.dateFilterService.endDate());
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  applyFilter() {
    // Ensure endDate is set to the end of the selected day
    const end = new Date(this.tempEndDate());
    end.setHours(23, 59, 59, 999);
    
    this.dateFilterService.setDateRange(this.tempStartDate(), end.toISOString());
    this.closeModal();
  }
}
