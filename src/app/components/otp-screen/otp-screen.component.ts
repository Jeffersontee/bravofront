import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { GlobalService } from 'src/app/services/global/global.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { OtpInputComponent } from '../otp-input/otp-input.component';

import { addIcons } from 'ionicons';
import { arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-otp-screen',
  templateUrl: './otp-screen.component.html',
  styleUrls: ['./otp-screen.component.scss'],
  standalone: true,
  imports: [IonicModule, OtpInputComponent]
})
export class OtpScreenComponent  implements OnInit {

  @Input() sendOtp = false;
  otp: string | undefined;
  length: number | undefined;
  @Output() verified: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private global: GlobalService,
    private profile: ProfileService
  ) {
    addIcons({ arrowForwardOutline })
  }

  ngOnInit() {
    if(this.sendOtp) this.resend();
  }

  getOtpLength(length: number | undefined) {
    this.length = length;
  }

  onOtpChange(otp: string | undefined) {
    this.otp = otp;
    console.log(this.otp);
  }

  resend() {
    console.log('send otp again');
    this.global.showLoader();
    this.profile.resendOtp()
    .then((response: any) => {
      console.log(response);
      this.global.hideLoader();
      if(response?.success) this.global.successToast('Um código OTP será enviado para o seu e-mail para verificação de e-mail');
    })
    .catch(e => {
      console.log(e);
      this.global.hideLoader();
      let msg = 'Algo deu errado! Tente novamente.';
      this.global.checkErrorMessageForAlert(e, msg);
      // if(e?.error?.message) {
      //   msg = e.error.message;
      // }
      // this.global.showAlert(msg);
    });
  }

 async verify() {
    if(this.otp?.length != this.length) return this.global.showAlert('Por favor, insira o código OTP correto.');
    this.global.showLoader();
    this.profile.verifyEmailOtp({ verification_token: this.otp })
    .then(response => {
      console.log(response);
      this.global.hideLoader();
      this.global.successToast('Seu e-mail foi verificado com sucesso.');
      this.verified.emit(true);
    })
    .catch(e => {
      console.log(e);
      this.global.hideLoader();
      let msg = 'Algo deu errado! Por favor, tente novamente.';
      this.global.checkErrorMessageForAlert(e, msg);
      // if(e?.error?.message) {
      //   msg = e.error.message;
      // }
      // this.global.showAlert(msg);
    });
  }

}