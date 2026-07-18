import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonLabel, IonItemGroup, IonList, IonItem, IonIcon, IonText, IonButton, IonSpinner, IonInput, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { GlobalService } from 'src/app/services/global/global.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Strings } from 'src/app/enum/strings';
// Icon
import { addIcons } from 'ionicons';
import { personOutline, eyeOutline, mailOutline, callOutline, eyeOffOutline, lockClosedOutline, businessOutline, documentOutline, documentTextOutline } from 'ionicons/icons';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, 
    IonItemGroup, IonList, IonItem, IonIcon, IonText, IonButton, IonSpinner, 
    IonInput, IonSegment, IonSegmentButton, IonLabel
  ]
})
export class SignupPage implements OnInit, OnDestroy {

  isLoading: boolean = false;
  isCompany: boolean = false;
  public passwordHidden: boolean = true;
  public confirmPasswordHidden: boolean = true;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private global: GlobalService
  ) { 
    addIcons({ personOutline, eyeOutline, mailOutline, callOutline, eyeOffOutline, lockClosedOutline, businessOutline, documentOutline, documentTextOutline });
  }

  ngOnInit() {
  }

  segmentChanged(event: any) {
    this.isCompany = event.detail.value === 'company';
  }

  onCnpjInput(event: any) {
    const input = event.target;
    let val = input.value;
    if (!val) return;

    val = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (val.length > 14) val = val.slice(0, 14);

    let formatted = val;
    if (val.length > 2) formatted = formatted.substring(0, 2) + '.' + formatted.substring(2);
    if (val.length > 5) formatted = formatted.substring(0, 6) + '.' + formatted.substring(6);
    if (val.length > 8) formatted = formatted.substring(0, 10) + '/' + formatted.substring(10);
    if (val.length > 12) formatted = formatted.substring(0, 15) + '-' + formatted.substring(15, 17);

    input.value = formatted;
  }

  onSubmit(form: NgForm) {
    if(!form.valid) return;
    this.register(form);
  }

  async register(form: NgForm) {
    this.isLoading = true;
    
    try {
      let user: any;
      if (this.isCompany) {
        const { owner_name, email, phone, password, company_name, cnpj } = form.value;
        const payload = { owner_name, email, phone, password, company_name, cnpj };
        const response = await this.authService.registerCompany(payload);
        user = response?.data?.user;
      } else {
        const { name, email, phone, password, cpf } = form.value;
        const payload = { name, email, phone, password, cpf };
        const response = await this.authService.register(payload);
        user = response?.data?.user;
      }

      this.authService.redirect(user?.type);
      form.reset();
      this.global.successToast('Um código OTP será enviado para o seu e-mail para verificação.');
    } catch (e) {
      console.log(e);
      let msg = 'Não foi possível cadastrá-lo(a), tente novamente.';
      this.global.checkErrorMessageForAlert(e, msg);
    } finally {
      this.isLoading = false;
    }
  }

  ionViewWillLeave() {
    // Remove focus from any focused elements before the page gets aria-hidden
    // This prevents accessibility violations where focused elements are hidden from screen readers
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }
  }

  ngOnDestroy() {
    // Clean up any resources
  }

}
