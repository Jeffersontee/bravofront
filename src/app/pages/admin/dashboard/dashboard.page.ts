import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-dashboard',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-title>Dashboard Geral</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Seja bem-vindo, Administrador!</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          Este é o painel de controle inicial da Bravo Instalações. A estrutura do menu lateral já está totalmente operacional.
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
})
export class DashboardPage {}
