import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonIcon, IonButton, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { HelpService } from 'src/app/services/help/help.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { addIcons } from 'ionicons';
import { helpCircleOutline, informationCircleOutline, fastFoodOutline, cardOutline, imageOutline, optionsOutline, ticketOutline, giftOutline, createOutline, trashOutline, addOutline, add } from 'ionicons/icons';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
  standalone: true,
  imports: [IonButton, 
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
    IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonIcon, IonFab, IonFabButton,
    CommonModule, UpperCasePipe
  ]
})
export class HelpPage implements OnInit {
  public helpService = inject(HelpService);
  private profileService = inject(ProfileService);

  public isEditMode = computed(() => {
    const user = this.profileService.profile();
    return user?.type === 'super_admin';
  });

  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ add, helpCircleOutline, informationCircleOutline, fastFoodOutline, cardOutline, imageOutline, optionsOutline, ticketOutline, giftOutline, createOutline, trashOutline, addOutline });
  }

  ngOnInit() {
    this.helpService.loadTopics();
  }

  async addSection() {
    const alert = await this.alertCtrl.create({
      header: 'Nova Categoria',
      inputs: [
        { name: 'id', type: 'text', placeholder: 'ID (ex: section_finance)' },
        { name: 'title', type: 'text', placeholder: 'Título da Categoria' },
        { name: 'icon', type: 'text', placeholder: 'Ícone (ex: card-outline)' },
        { name: 'order', type: 'number', placeholder: 'Ordem (ex: 1)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Salvar', 
          handler: async (data) => {
            if (!data.id || !data.title) return false;
            try {
              await this.helpService.createSection(data);
            } catch (e) {
              console.error(e);
            }
            return true;
          } 
        }
      ]
    });
    await alert.present();
  }

  async editSection(section: any, event: Event) {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Editar Categoria',
      inputs: [
        { name: 'title', type: 'text', value: section.title, placeholder: 'Título da Categoria' },
        { name: 'icon', type: 'text', value: section.icon, placeholder: 'Ícone' },
        { name: 'order', type: 'number', value: section.order, placeholder: 'Ordem' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Salvar', 
          handler: async (data) => {
            try {
              await this.helpService.updateSection(section._id, data);
            } catch (e) {
              console.error(e);
            }
            return true;
          } 
        }
      ]
    });
    await alert.present();
  }

  async deleteSection(section: any, event: Event) {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a categoria "${section.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Excluir', 
          role: 'destructive',
          handler: async () => {
            try {
              await this.helpService.deleteSection(section._id);
            } catch (e) {
              console.error(e);
            }
          } 
        }
      ]
    });
    await alert.present();
  }

  async addTopic(section: any, event: Event) {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Novo Tópico',
      inputs: [
        { name: 'id', type: 'text', placeholder: 'ID (ex: topic_name)' },
        { name: 'title', type: 'text', placeholder: 'Título do Tópico' },
        { name: 'content', type: 'textarea', placeholder: 'Conteúdo (um parágrafo por linha)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Salvar', 
          handler: async (data) => {
            if (!data.id || !data.title) return false;
            try {
              // Converte linhas de texto em array
              data.content = data.content ? data.content.split('\\n').filter((p: string) => p.trim() !== '') : [];
              await this.helpService.addTopic(section._id, data);
            } catch (e) {
              console.error(e);
            }
            return true;
          } 
        }
      ]
    });
    await alert.present();
  }

  async editTopic(topic: any, section: any, event: Event) {
    event.stopPropagation();
    const contentText = Array.isArray(topic.content) ? topic.content.join('\\n') : topic.content;
    
    const alert = await this.alertCtrl.create({
      header: 'Editar Tópico',
      inputs: [
        { name: 'title', type: 'text', value: topic.title, placeholder: 'Título do Tópico' },
        { name: 'content', type: 'textarea', value: contentText, placeholder: 'Conteúdo' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Salvar', 
          handler: async (data) => {
            try {
              data.content = data.content ? data.content.split('\\n').filter((p: string) => p.trim() !== '') : [];
              await this.helpService.updateTopic(section._id, topic._id, data);
            } catch (e) {
              console.error(e);
            }
            return true;
          } 
        }
      ]
    });
    await alert.present();
  }

  async deleteTopic(topic: any, section: any, event: Event) {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o tópico "${topic.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Excluir', 
          role: 'destructive',
          handler: async () => {
            try {
              await this.helpService.deleteTopic(section._id, topic._id);
            } catch (e) {
              console.error(e);
            }
          } 
        }
      ]
    });
    await alert.present();
  }
}

