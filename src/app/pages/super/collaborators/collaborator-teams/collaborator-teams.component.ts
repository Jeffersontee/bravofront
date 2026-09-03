import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CollaboratorService, Collaborator } from 'src/app/services/collaborator/collaborator.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { peopleOutline, shieldCheckmarkOutline, briefcaseOutline, hammerOutline, helpCircleOutline, helpCircle, informationCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-collaborator-teams',
  templateUrl: './collaborator-teams.component.html',
  styleUrls: ['./collaborator-teams.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class CollaboratorTeamsComponent implements OnInit {
  private collaboratorService = inject(CollaboratorService);
  private global = inject(GlobalService);

  collaborators = signal<Collaborator[]>([]);
  isLoading = signal(true);
  showHelp = signal(false);

  toggleHelp() {
    this.showHelp.set(!this.showHelp());
  }

  constructor() {
    addIcons({ peopleOutline, shieldCheckmarkOutline, briefcaseOutline, hammerOutline, helpCircleOutline, helpCircle, informationCircleOutline });
  }

  ngOnInit() {
    this.loadCollaborators();
  }

  loadCollaborators() {
    this.isLoading.set(true);
    this.collaboratorService.getCollaborators().subscribe({
      next: (res) => {
        this.collaborators.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.global.errorToast('Erro ao carregar equipes');
        this.isLoading.set(false);
      }
    });
  }

  get technicians(): Collaborator[] {
    return this.collaborators().filter(c => {
      const r = (c.role || '').toLowerCase();
      return r.includes('técnico') || r.includes('tecnico') || r.includes('technician');
    });
  }

  get supervisors(): Collaborator[] {
    return this.collaborators().filter(c => {
      const r = (c.role || '').toLowerCase();
      return r.includes('supervisor');
    });
  }

  get adminStaff(): Collaborator[] {
    return this.collaborators().filter(c => {
      const r = (c.role || '').toLowerCase();
      return r.includes('admin') || r.includes('operador') || r.includes('gerente');
    });
  }
}
