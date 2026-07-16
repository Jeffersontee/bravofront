import { Component, inject, signal, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, IonIcon, IonModal, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  mailOutline, lockClosedOutline, construct, key, mail, eyeOffOutline, 
  eyeOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth/auth.service';
import { GlobalService } from '../../services/global/global.service';
import { ResetPasswordComponent } from 'src/app/components/reset-password/reset-password.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonIcon, IonModal, IonText, RouterLink, ResetPasswordComponent
  ]
})
export class LoginPage implements OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private global = inject(GlobalService);

  // Inputs controlados via signals
  public emailInput = signal<string>('');
  public passwordInput = signal<string>('');
  public isLogin = signal<boolean>(false);

  @ViewChild('forgot_pwd_modal') modal!: IonModal;

  type: boolean = true;
  
  reset_pwd_model = {
    email: '',
    otp: '',
    new_password: ''
  };

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, construct, key, mail, eyeOffOutline, eyeOutline });
  }

  ngOnInit() {
    this.checkIfLoggedIn();
  }

  async checkIfLoggedIn() {
    try {
      const val = await this.authService.getToken();
      if(val) {
        this.navigateByRole();
      }
    } catch (e) {
      console.log(e);
    }
  }

  public isFormValid(): boolean {
    return (
      this.emailInput().trim().length > 5 &&
      this.passwordInput().trim().length >= 6
    );
  }

  public login() {
    if (!this.isFormValid()) return;
    
    this.isLogin.set(true);
    this.global.showLoader();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: Requisição levou muito tempo')), 15000)
    );
    
    Promise.race([
      this.authService.login(this.emailInput().trim(), this.passwordInput().trim()),
      timeoutPromise
    ])
    .then(async data => {
      console.log('Login bem-sucedido:', data);
      this.isLogin.set(false);
      this.global.hideLoader();
      this.navigateByRole();
    })
    .catch(e => {
      console.error('Erro no login:', e);
      this.isLogin.set(false);
      this.global.hideLoader();
      let msg = 'Não foi possível iniciar sessão. Verifique suas credenciais.';
      if(e?.error?.message) {
        msg = e.error.message;
      } else if(e?.message) {
        msg = e.message;
      }
      this.global.showAlert(msg);
    });
  }

  async navigateByRole() {
    const user = await this.authService.getUser();
    if (user && user.type) {
      this.authService.redirect(user.type);
    } else {
      this.router.navigate(['/tabs'], { replaceUrl: true });
    }
  }

  changeType() {
    this.type = !this.type;
  }

  reset(event: any) {
    console.log(event);
    this.reset_pwd_model = {
      email: '',
      otp: '',
      new_password: ''
    };
  }

  sendResetPasswordEmailOtp(email: string) {
    this.global.showLoader();
    this.authService.sendResetPasswordOtp(email).then(data => {
      console.log(data);
      this.reset_pwd_model = {...this.reset_pwd_model, email};
      this.global.hideLoader();
    })
    .catch(e => {
      console.log(e);
      this.global.hideLoader();
      let msg = 'Algo deu errado. Tente novamente';
      this.global.checkErrorMessageForAlert(e, msg);
    });
  }

  verifyResetPasswordOtp(otp: string) {
    this.global.showLoader();
    this.authService.verifyResetPasswordOtp(this.reset_pwd_model.email, otp).then(data => {
      console.log(data);
      this.reset_pwd_model = {...this.reset_pwd_model, otp};
      this.global.hideLoader();
    })
    .catch(e => {
      console.log(e);
      this.global.hideLoader();
      let msg = 'Algo deu errado. Tente novamente.';
      this.global.checkErrorMessageForAlert(e, msg);
    }); 
  }

  resetPassword(new_password: string) {
    this.global.showLoader();
    this.reset_pwd_model = {...this.reset_pwd_model, new_password};
    this.authService.resetPassword(this.reset_pwd_model).then(data => {
      console.log(data);
      this.global.hideLoader();
      this.modal.dismiss();
      this.global.successToast('Sua senha foi alterada com sucesso. Faça login agora.');
    })
    .catch(e => {
      console.log(e);
      this.global.hideLoader();
      let msg = 'Algo deu errado. Tente novamente.';
      this.global.checkErrorMessageForAlert(e, msg);
    });
  }

  ionViewWillLeave() {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }
  }

  ngOnDestroy() {
    if (this.modal) {
      this.modal.dismiss();
    }
  }
}
