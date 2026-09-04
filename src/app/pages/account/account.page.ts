import { Component, ElementRef, OnInit, ViewChild, signal, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { powerOutline, checkmarkOutline, chevronForwardOutline, checkmarkCircleOutline, timeOutline, chevronDownCircleOutline, homeOutline, mailOutline, callOutline, receiptOutline, alertCircleOutline, walletOutline, personOutline } from 'ionicons/icons';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonText, IonIcon, IonButtons, IonButton, IonAvatar, IonSpinner, IonLabel, IonToolbar, IonModal, IonRefresherContent, IonRefresher, IonTitle, IonCol, IonGrid, IonRow, IonMenuButton } from '@ionic/angular/standalone';
import { OtpScreenComponent } from 'src/app/components/otp-screen/otp-screen.component';
import { environment } from 'src/environments/environment';
import { GlobalService } from 'src/app/services/global/global.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { AccountFormComponent } from 'src/app/components/account-form/account-form.component';
import { Strings } from 'src/app/enum/strings';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonModal, IonButtons, IonButton, IonAvatar, IonSpinner, IonText, IonIcon, IonLabel, IonToolbar, IonRefresherContent, IonRefresher, IonTitle, IonCol, IonRow, IonMenuButton, IonGrid, RouterModule, FormsModule, OtpScreenComponent]
})
export class AccountPage implements OnInit {

  @ViewChild('filePicker', {static: false}) filePickerRef!: ElementRef;
  @ViewChild('otp_modal') modal!: IonModal;
  serverUrl = environment.serverUrl;
  
  public global = inject(GlobalService);
  private profileService = inject(ProfileService);
  private auth = inject(AuthService);
  private router = inject(Router);

  profile = this.profileService.profile; 
  isLoading = signal(false);
  verifyOtp = signal(false);
  Strings = Strings;
  
  constructor() {
    addIcons({ powerOutline,mailOutline,callOutline,receiptOutline,homeOutline,checkmarkOutline,chevronForwardOutline,checkmarkCircleOutline,timeOutline,chevronDownCircleOutline, alertCircleOutline, walletOutline, personOutline });
  }

  ngOnInit() {
    this.getData();
  }
  
  async getData() {
    try {
      this.isLoading.set(true);
      await this.profileService.getProfile();
      this.isLoading.set(false);
    } catch(e) {
      console.log(e);
      this.isLoading.set(false);
      this.global.checkMessageForErrorToast(e);
    }
  }
  
  confirmLogout() {
    this.global.showAlert(
      'Tem certeza de que deseja sair?',
      'Confirmar',
      [
        {
          text: 'Não',
          role: 'cancel'
        }, {
          text: 'Sim',
          handler: () => {
            this.logout();
          }
        }
      ]
    );
  }

  async logout() {
    try {
      await this.global.showLoader();
      await this.auth.logout();
      this.global.hideLoader();
    } catch(e) {
      console.log(e);
      this.global.hideLoader();
      this.global.checkMessageForErrorToast(e);
    }
  }

  async editProfile() {
    const options = {
      component: AccountFormComponent,
      componentProps: {
        profile: this.profile()
      },
      cssClass: 'inline_modal',
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.8,
      swipeToClose: true,
    };
    const result = await this.global.createModal(options);
    if (result) {
      if (result.token && result.refreshToken) {
        console.log('🔑 [AccountPage] Novos tokens detectados, atualizando sessão...');
        await this.auth.setUserData(result.token, result.refreshToken);
      }

      if (result?.email_changed === true) {
        this.verifyOtp.set(true);
        this.global.successToast('Como seu e-mail foi alterado, enviamos um código OTP para validação.');
      } else {
        this.global.successToast('Perfil atualizado com sucesso!');
      }
    }
  }

  resetOtpModal(value: any) {
    console.log(value);
    this.verifyOtp.set(false);
  }

  otpVerified(event: any) {
    if(event) this.modal.dismiss();
  }

  async editPicture() {
    try {
      if(this.global.checkPlatformForWeb()) this.filePickerRef.nativeElement.click();
      else {
        const imageData = await this.global.takePicture();
        if(imageData && imageData.base64String) {
          const blob = this.global.getBlob(imageData.base64String);
          const imageFile = new File([blob], 'profile.png', { type: 'image/png' });
          this.uploadProfilePic(imageFile);
        }
      }
    } catch(e) {
      console.log(e);
    }
  }

  async onFileChosen(event: any) {
    try {
      const imageFile = this.global.chooseImageFile(event);
      console.log('imagedata: ', imageFile);
      if(imageFile) {
        this.uploadProfilePic(imageFile);
      }
    } catch(e) {
      console.log(e);
    }
  }

  async uploadProfilePic(imageFile: any) {
    try {
      this.global.showLoader();
      let postData = new FormData();
      postData.append('profileImages', imageFile, imageFile.name || 'profile.jpg');
      const response = await this.profileService.updateProfilePic(postData);
      console.log(response);
      this.global.successToast('Foto de perfil atualizada');
      this.global.hideLoader();
    } catch(e) {
      console.log(e);
      this.global.hideLoader();
      this.global.checkMessageForErrorToast(e);
    }
  }

  async doRefresh(event: any) {
    console.log('Operação de atualização iniciada');
    await this.getData();
    event.target.complete();
  }
  
  ionViewDidEnter() {
    console.log('ionViewDidEnter AccountPage');
    this.global.customStatusbar(true);
  }
  
  ionViewDidLeave() {
    console.log('ionViewDidLeave AccountPage');
    this.global.customStatusbar();
  }

  navigateToPayments() {
    const user = this.profile();
    if (!user) return;

    const isSuperAdmin = user.type === Strings.SUPER_TYPE;
    const permissions = user.permissions || [];
    const hasFinancialPermission = isSuperAdmin || permissions.includes('COMPANY_FINANCIAL_PANEL');

    if (hasFinancialPermission) {
      this.router.navigate(this.getBaseRoute('payments'));
    } else {
      this.global.errorToast('Acesso Restrito: Você precisa de liberação para acessar o módulo Financeiro e Faturas.');
    }
  }

  getBaseRoute(path: string): string[] {
    const type = this.profile()?.type;
    let base = '/customer'; // Default ou cliente

    if (type === Strings.SUPER_TYPE) base = '/super-admin';
    else if (type === Strings.COMPANY_OWNER_TYPE) base = '/company';
    else if (type === Strings.COLLABORATOR_TYPE) base = '/collaborator';
    
    // Fallback pra /company/service-orders por ex
    if (path === 'orders') return [base, 'service-orders'];
    if (path === 'address') return [base, 'address'];
    if (path === 'payments') return [base, 'payments'];
    
    return [base, path];
  }
}
