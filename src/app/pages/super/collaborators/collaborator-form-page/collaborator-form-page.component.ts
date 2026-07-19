import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CollaboratorService, Collaborator } from 'src/app/services/collaborator/collaborator.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { CollaboratorFormComponent } from 'src/app/components/collaborator-form/collaborator-form.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-collaborator-form-page',
  templateUrl: './collaborator-form-page.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, CollaboratorFormComponent]
})
export class CollaboratorFormPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private collaboratorService = inject(CollaboratorService);
  private global = inject(GlobalService);

  collaboratorData = signal<Collaborator | null>(null);
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  collaboratorId: string | null = null;

  ngOnInit() {
    this.collaboratorId = this.route.snapshot.paramMap.get('id');
    if (this.collaboratorId) {
      this.isEditMode.set(true);
      this.loadCollaborator(this.collaboratorId);
    }
  }

  async loadCollaborator(id: string) {
    this.isLoading.set(true);
    try {
      const response = await firstValueFrom(this.collaboratorService.getCollaboratorById(id));
      if (response.data) {
        this.collaboratorData.set(response.data);
      }
    } catch (error) {
      this.global.errorToast('Erro ao carregar técnico');
      this.router.navigate(['/super-admin/collaborators']);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSave(payload: Partial<Collaborator>) {
    this.isLoading.set(true);
    try {
      if (this.isEditMode() && this.collaboratorId) {
        await firstValueFrom(this.collaboratorService.updateCollaborator(this.collaboratorId, payload));
        this.global.successToast('Técnico atualizado com sucesso!');
      } else {
        await firstValueFrom(this.collaboratorService.createCollaborator(payload));
        this.global.successToast('Técnico cadastrado com sucesso!');
      }
      this.router.navigate(['/super-admin/collaborators']);
    } catch (e: any) {
      console.error(e);
      this.global.errorToast(e.error?.message || 'Erro ao salvar técnico');
    } finally {
      this.isLoading.set(false);
    }
  }
}
