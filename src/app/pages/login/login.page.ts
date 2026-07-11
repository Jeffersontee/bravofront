import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-title>Bravo Instalações</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding ion-text-center">
      <ion-card style="max-width: 400px; margin: 80px auto; padding: 20px;">
        <ion-card-header>
          <ion-card-title>Login</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Seja bem-vindo ao sistema de gestão Bravo Instalações.</p>
          <ion-button expand="block" [routerLink]="['/establishment-admin/dashboard']" class="ion-margin-top">
            Entrar (Painel Admin)
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, RouterModule]
})
export class LoginPage {}
