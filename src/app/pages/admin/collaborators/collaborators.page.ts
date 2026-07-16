import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonFab, IonFabButton, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { CollaboratorService, Collaborator } from 'src/app/services/collaborator/collaborator.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { addOutline, personOutline, createOutline } from 'ionicons/icons';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-collaborators',
  templateUrl: './collaborators.page.html',
  styleUrls: ['./collaborators.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonFab, IonFabButton, IonButtons, IonMenuButton, CommonModule, RouterModule]
})
export class CollaboratorsPage implements OnInit {
  private collaboratorService = inject(CollaboratorService);
  private globalService = inject(GlobalService);

  collaborators = signal<Collaborator[]>([]);
  isLoading = signal<boolean>(false);

  constructor() {
    addIcons({ addOutline, personOutline, createOutline });
  }

  ngOnInit() {
    this.loadCollaborators();
  }

  ionViewWillEnter() {
    this.loadCollaborators(); // Reload when entering page
  }

  loadCollaborators() {
    this.isLoading.set(true);
    this.collaboratorService.getCollaborators().subscribe({
      next: (res) => {
        if (res.success) {
          this.collaborators.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.globalService.errorToast('Erro ao carregar colaboradores');
        this.isLoading.set(false);
      }
    });
  }
}
