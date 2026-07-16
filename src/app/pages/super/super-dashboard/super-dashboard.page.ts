import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-super-dashboard',
  templateUrl: './super-dashboard.page.html',
  styleUrls: ['./super-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SuperDashboardPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
