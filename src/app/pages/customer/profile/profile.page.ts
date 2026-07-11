import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, 
  IonIcon, IonLabel, IonNote, IonList, IonItem 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, mailOutline, phonePortraitOutline, locationOutline, 
  logOutOutline, chevronForwardOutline, walletOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, 
    IonButton, IonIcon, IonLabel, IonNote, IonList, IonItem
  ]
})
export class ProfilePage {
  private router = inject(Router);
  private orderService = inject(OrderService);

  public customerName = this.orderService.customerName;
  public customerAddress = this.orderService.customerAddress;
  public customerPhone = this.orderService.customerPhone;

  public user = {
    email: 'jefferson@livecodesystem.com.br'
  };

  constructor() {
    addIcons({ 
      personOutline, mailOutline, phonePortraitOutline, locationOutline, 
      logOutOutline, chevronForwardOutline, walletOutline 
    });
  }

  public logout() {
    // Redireciona para o login fictício
    this.router.navigate(['/login']);
  }
}
