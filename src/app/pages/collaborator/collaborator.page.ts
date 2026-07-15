import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonSpinner, IonBackButton, IonMenuButton } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { CollaboratorService, Collaborator } from 'src/app/services/collaborator/collaborator.service';
import { CollaboratorFormComponent } from 'src/app/components/collaborator-form/collaborator-form.component';
import { GlobalService } from 'src/app/services/global/global.service';
import { Strings } from 'src/app/enum/strings';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-collaborator',
  templateUrl: './collaborator.page.html',
  styleUrls: ['./collaborator.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonSpinner, 
    IonBackButton, IonMenuButton, CommonModule, FormsModule, 
    CollaboratorFormComponent 
  ]
})
export class CollaboratorPage {
  readonly Strings = Strings;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private collaboratorService = inject(CollaboratorService);
  private global = inject(GlobalService);

  collaboratorData = signal<Collaborator | null>(null);
  isEditMode = signal<boolean>(false);
  isDetailsMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  ionViewWillEnter() {
    this.loadInitialData();
  }

  private getCurrentCollaboratorId(): string | null {
    return this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('id');
  }

  async loadInitialData() {
    this.isLoading.set(true);
    
    // Reset state
    this.isEditMode.set(false);
    this.collaboratorData.set(null);

    try {
      const id = this.getCurrentCollaboratorId();
      const isDetails = !!id && (
        this.route.snapshot.routeConfig?.path?.includes('details') ||
        this.router.url.includes('/details/')
      );
      this.isDetailsMode.set(isDetails);
      this.isEditMode.set(!!id && id !== 'create' && !isDetails);

      if (id && id !== 'create') {
        const response = await firstValueFrom(this.collaboratorService.getCollaboratorById(id));
        const data = response.data;
        
        if (data) {
          this.collaboratorData.set(data);
        }
      }
    } catch (error) {
      this.global.errorToast('Erro ao carregar dados do colaborador');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSave(payload: Partial<Collaborator>) {
    try {
      this.global.showLoader();
      
      const id = this.getCurrentCollaboratorId();

      if (this.isEditMode() && id) {
        await firstValueFrom(this.collaboratorService.updateCollaborator(id, payload));
        this.global.successToast('Colaborador atualizado com sucesso');
      } else {
        await firstValueFrom(this.collaboratorService.createCollaborator(payload));
        this.global.successToast('Colaborador cadastrado com sucesso');
      }
      
      this.router.navigate([`/${Strings.ADMIN_LIST_COLLABORATOR}`]);
    } catch (e: any) {
      const message = e.error?.message || 'Erro ao salvar colaborador';
      this.global.errorToast(message);
    } finally {
      this.global.hideLoader();
    }
  }
}
