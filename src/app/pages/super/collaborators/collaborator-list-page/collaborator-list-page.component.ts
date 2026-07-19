import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CollaboratorService, Collaborator } from 'src/app/services/collaborator/collaborator.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { gridOutline, listOutline, addOutline, refreshOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-collaborator-list-page',
  templateUrl: './collaborator-list-page.component.html',
  styleUrls: ['./collaborator-list-page.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class CollaboratorListPageComponent implements OnInit {
  private collaboratorService = inject(CollaboratorService);
  private router = inject(Router);
  private global = inject(GlobalService);

  collaborators = signal<Collaborator[]>([]);
  isLoading = signal(true);
  viewMode = signal<'list' | 'card'>('list');

  constructor() {
    addIcons({ gridOutline, listOutline, addOutline, refreshOutline, personCircleOutline });
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
      error: (err) => {
        console.error(err);
        this.global.errorToast('Erro ao carregar colaboradores');
        this.isLoading.set(false);
      }
    });
  }

  goToCreate() {
    this.router.navigateByUrl('/super-admin/collaborators/create');
  }

  goToEdit(id: string) {
    this.router.navigateByUrl(`/super-admin/collaborators/edit/${id}`);
  }
}
