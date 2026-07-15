import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonIcon 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, phonePortraitOutline, locationOutline, construct 
} from 'ionicons/icons';
import { OrderService } from '../../services/order/order.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonIcon
  ]
})
export class LoginPage {
  private router = inject(Router);
  private orderService = inject(OrderService);

  // Inputs controlados via signals
  public nameInput = signal<string>('');
  public phoneInput = signal<string>('');
  public addressInput = signal<string>('');

  constructor() {
    addIcons({ personOutline, phonePortraitOutline, locationOutline, construct });
  }

  public isFormValid(): boolean {
    return (
      this.nameInput().trim().length > 2 &&
      this.phoneInput().trim().length >= 8 &&
      this.addressInput().trim().length > 5
    );
  }

  public submitRegister() {
    if (!this.isFormValid()) return;

    // Atualiza os dados no serviço reativo
    this.orderService.customerName.set(this.nameInput().trim());
    this.orderService.customerPhone.set(this.phoneInput().trim());
    this.orderService.customerAddress.set(this.addressInput().trim());

    // Redireciona para a Home do cliente
    this.router.navigate(['/customer/home']);
  }

  public goToAdmin() {
    this.router.navigate(['/establishment-admin/dashboard']);
  }
}
