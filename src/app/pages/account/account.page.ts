import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton
  ]
})
export class AccountPage {
  private authService = inject(AuthService);

  public logout() {
    this.authService.logout();
  }
}
