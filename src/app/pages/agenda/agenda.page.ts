import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AnnualAgendaComponent } from '../../components/annual-agenda/annual-agenda.component';
import { ProfileService } from '../../services/profile/profile.service';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, AnnualAgendaComponent]
})
export class AgendaPage implements OnInit {
  
  private profileService = inject(ProfileService);
  
  // O signal do profile já é reativo
  profile = this.profileService.profile;
  
  // Define o modo com base no tipo de usuário
  mode = computed<'company' | 'super_admin' | 'collaborator'>(() => {
    const p = this.profile();
    if (p?.type === 'super_admin' || p?.type === 'super_staff') return 'super_admin';
    if (p?.type === 'collaborator') return 'collaborator';
    return 'company';
  });

  // Pega o ID da empresa para filtrar, se aplicável
  companyId = computed<string | null>(() => {
    const p = this.profile();
    return p?.company_id ? p.company_id : null;
  });

  // Pega o ID do colaborador para filtrar, se for técnico de campo
  collaboratorId = computed<string | null>(() => {
    const p = this.profile();
    if (p?.type === 'collaborator' && p.role !== 'operator') {
      return (p as any)?._id || (p as any)?.id || null;
    }
    return null;
  });

  selectedYear: number = new Date().getFullYear();

  constructor() { }

  ngOnInit() {
    this.profileService.getProfile(); // Garante que o profile está carregado
  }

}
