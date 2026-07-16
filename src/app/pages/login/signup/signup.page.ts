import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonItemGroup, IonList, IonItem, IonIcon, IonText, IonButton, IonSpinner, IonInput } from '@ionic/angular/standalone';
import { GlobalService } from 'src/app/services/global/global.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Strings } from 'src/app/enum/strings';
// Icon
import { addIcons } from 'ionicons';
import { person, eyeOutline, mail, call ,eyeOffOutline, key } from 'ionicons/icons';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, 
    IonItemGroup, IonList, IonItem, IonIcon, IonText, IonButton, IonSpinner, 
    IonInput
  ]
})
export class SignupPage implements OnInit, OnDestroy {

  isLoading: boolean = false;
  public passwordHidden: boolean = true;
  public confirmPasswordHidden: boolean = true;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private global: GlobalService
  ) { 
    addIcons({ person, eyeOutline, mail, call, eyeOffOutline, key });
  }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    if(!form.valid) return;
    this.register(form);
  }

  async register(form: NgForm) {
    this.isLoading = true;
    // Explicitamente constrói o payload para garantir que apenas os campos necessários sejam enviados
    const { name, email, phone, password } = form.value;
    const payload = { name, email, phone, password };
    console.log('Dados enviados ao backend:', payload);

    try {
      await this.authService.register(payload);
      this.router.navigateByUrl(Strings.TABS + '/otp', { replaceUrl: true });
      form.reset();
      this.global.successToast('Um código OTP será enviado para o seu e-mail para verificação de e-mail.');
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
