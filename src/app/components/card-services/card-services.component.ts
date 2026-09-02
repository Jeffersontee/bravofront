import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { registerServiceIcons } from 'src/app/utils/service-icons';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  priceText: string;
  priceValue: number;
  iconName: string;
  bgColor: string;
  iconColor: string;
}

@Component({
  selector: 'app-card-services',
  templateUrl: './card-services.component.html',
  styleUrls: ['./card-services.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class CardServicesComponent {
  // Inputs e Outputs do Angular 18
  public category = input.required<ServiceCategory>();
  public select = output<void>();

  constructor() {
    registerServiceIcons();
  }

  public onCardClick() {
    this.select.emit();
  }
}
