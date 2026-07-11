import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, receiptOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-customer-layout',
  templateUrl: './customer-layout.page.html',
  styleUrls: ['./customer-layout.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel]
})
export class CustomerLayoutPage {
  constructor() {
    addIcons({ homeOutline, receiptOutline, personOutline });
  }
}
