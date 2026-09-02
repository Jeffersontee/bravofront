import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, 
  IonContent, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardContent 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, 
    IonContent, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardContent
  ]
})
export class TermsPage {
  activeTab = signal<'terms' | 'privacy'>('terms');

  segmentChanged(event: any) {
    this.activeTab.set(event.detail.value);
  }
}
