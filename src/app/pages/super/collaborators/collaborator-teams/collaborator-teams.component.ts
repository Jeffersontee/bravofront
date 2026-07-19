import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CollaboratorService, Collaborator } from 'src/app/services/collaborator/collaborator.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { peopleOutline, shieldCheckmarkOutline, briefcaseOutline, hammerOutline } from 'ionicons/icons';

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

  constructor() {
    addIcons({ peopleOutline, shieldCheckmarkOutline, briefcaseOutline, hammerOutline });
  }

  ngOnInit() {
    this.loadCollaborators();
  }

  loadCollaborators() {
    this.isLoading.set(true);
    this.collaboratorService.getCollaborators().subscribe({
      next: (res) => {
        this.collaborators.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.global.errorToast('Erro ao carregar equipes');
        this.isLoading.set(false);
      }
    });
  }

  get technicians(): Collaborator[] {
    return this.collaborators().filter(c => c.role === 'technician' || c.role === 'técnico');
  }

  get supervisors(): Collaborator[] {
    return this.collaborators().filter(c => c.role === 'supervisor');
  }

  get adminStaff(): Collaborator[] {
    return this.collaborators().filter(c => c.role === 'administrativo' || c.role === 'admin');
  }
}
