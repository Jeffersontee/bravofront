import { Component, inject, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, receiptOutline, personOutline, calendarOutline } from 'ionicons/icons';
import { ThemeService } from '../../../services/theme/theme.service';
import { ServiceOrderService } from '../../../services/service-order/service-order.service';

@Component({
  selector: 'app-customer-layout',
  templateUrl: './customer-layout.page.html',
  styleUrls: ['./customer-layout.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge]
})
export class CustomerLayoutPage implements OnInit {
  private themeService = inject(ThemeService);
  public serviceOrderService = inject(ServiceOrderService);

  constructor() {
    addIcons({ homeOutline, receiptOutline, personOutline, calendarOutline });
  }

  ngOnInit() {
    this.themeService.loadAppearance('GLOBAL');
    this.serviceOrderService.getServiceOrders().subscribe();
  }
}
