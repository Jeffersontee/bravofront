import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterLink, RouterOutlet } from '@angular/router';
import { addIcons } from 'ionicons';
import { homeOutline, logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-super-layout',
  templateUrl: './super-layout.page.html',
  styleUrls: ['./super-layout.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, RouterOutlet]
})
export class SuperLayoutPage implements OnInit {
  private authService = inject(AuthService);

  constructor() {
    addIcons({ homeOutline, logOutOutline });
  }

  ngOnInit() {
  }

  logout() {
    this.authService.logoutUser(true);
  }
}
