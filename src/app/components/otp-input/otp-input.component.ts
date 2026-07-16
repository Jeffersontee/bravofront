import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgOtpInputModule } from 'ng-otp-input';

@Component({
  selector: 'app-otp-input',
  templateUrl: './otp-input.component.html',
  styleUrls: ['./otp-input.component.scss'],
  standalone: true,
  imports: [NgOtpInputModule]
})
export class OtpInputComponent  implements OnInit {

  config = {
    length: 6,
    allowNumbersOnly: true,
    inputClass: 'otp-input-style'
  };
  @Output() otp: EventEmitter<any> = new EventEmitter();
  @Output() length: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.length.emit(this.config.length);
  }

  onOtpChange(otp: any) {
    this.otp.emit(otp);
  }

}

