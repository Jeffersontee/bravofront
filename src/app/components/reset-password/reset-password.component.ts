import { FormsModule, NgForm } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { OtpInputComponent } from '../otp-input/otp-input.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, OtpInputComponent]
})
export class ResetPasswordComponent  implements OnInit {

  @Input() model: any;
  otp!: string;
  length!: number;
  flag!: number;
  @Output() check_email: EventEmitter<any> = new EventEmitter();
  @Output() verify_otp: EventEmitter<any> = new EventEmitter();
  @Output() set_password: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {}
  
  getOtpLength(length: number) {
    this.length = length;
  }

  onOtpChange(otp: string) {
    this.otp = otp;
    console.log(this.otp);
  }

  getData() {
    let data: any = {};
    if(this.model?.email == '' && this.model?.otp == '') {
      data = {
        title: 'Esqueceu sua senha', 
        subTitle: 'Insira seu e-mail para o processo de verificação. Enviaremos um código de verificação para o seu e-mail.', 
        button: 'ENVIAR OTP'
      };
      this.otp = '';
      this.flag = 1;
    } else if(this.model?.email != '' && this.model?.otp == '') {
      data = {title: 'Verifique seu e-mail', subTitle: 'Insira o código de verificação enviado para o seu e-mail.', button: 'VERIFICAR'};
      this.flag = 2;
    } else {
      data = {
        title: 'Redefinir senha', 
        subTitle: 'Digite sua nova senha, que deve ter pelo menos 8 caracteres.', 
        button: 'SALVAR'
      };
      this.flag = 3;
    }
    console.log(data);
    return data;
  }

  onSubmit(form: NgForm) {
    console.log(form);
    if(!form.valid) return;
    if(this.flag == 1) this.check_email.emit(form.value.email);
    else if(this.flag == 2) this.verify_otp.emit(this.otp);
    else this.set_password.emit(form.value.new_password);
  }

}

