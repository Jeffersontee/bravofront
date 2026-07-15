import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { VisitModalComponent } from 'src/app/components/visit-modal/visit-modal.component';

@Component({
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.page.html',
  styleUrls: ['./company-dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule]
})
export class CompanyDashboardPage implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  async openVisitModal() {
    const modal = await this.modalCtrl.create({
      component: VisitModalComponent,
      cssClass: 'custom-visit-modal' // Define this in global.scss
    });
    return await modal.present();
  }

}
