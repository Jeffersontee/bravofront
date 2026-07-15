import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AlertController, isPlatform, LoadingController, ToastController, ModalController } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { homeOutline, briefcaseOutline, locationOutline, closeCircle, chevronDownOutline  } from 'ionicons/icons';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {

  isLoading: boolean = false;
  private stop_toast: boolean = false;

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController
  ) {
    addIcons({ homeOutline, briefcaseOutline, locationOutline, closeCircle, chevronDownOutline }); 
   }

  /**
   * Remove o foco do elemento atual para evitar erros de aria-hidden
   * quando overlays (Alertas/Modais) são apresentados.
   */
  private blurActiveElement() {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }
  }

  async showAlert(message: string, header?: string, buttonArray?: any[], backdropDismiss: boolean = true, inputs?: any[]) {
    this.blurActiveElement();
    const alert = await this.alertCtrl.create({
      header: header ? header : 'Alerta',
      message: message,
      inputs: inputs ? inputs : [],
      buttons: buttonArray ? buttonArray : ['Ok'],
      backdropDismiss: backdropDismiss
    });
    await alert.present();
  }

  checkErrorMessageForAlert(error: any, msg?: string) {
    if(error?.error?.message) {
      msg = error.error.message;
    }
    console.log('error message alert: ', msg);
    this.showAlert(msg || 'Ocorreu um erro inesperado.');
  }

  async showToast(msg: string, color: string, position: any, duration = 3000) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: duration,
      color: color,
      position: position
    });
    toast.present();
  }

  async toastDismiss(data?: any) {
    await this.toastCtrl.dismiss(data);
  }

  async showButtonToast(msg: string, position?: any) {
    this.blurActiveElement();
    const toast = await this.toastCtrl.create({
      // header: 'Alert',
      message: msg,
      color: 'danger',
      position: position || 'bottom',
      buttons: [
        {
          side: 'end',
          text: 'VERIFY',
          handler: () => {
            this.toastDismiss(true);
          }
        }, {
          side: 'start',
          icon: 'close-circle',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await toast.present();
    const { data } = await toast.onDidDismiss();
    console.log('onDidDismiss resolved with role', data);
    if(data) return data;
  }

  stopToast() {
    this.stop_toast = true;
  }

  errorToast(msg?: string, duration = 4000) {
    if(!this.stop_toast) this.showToast(msg ? msg : 'Sem conexão com a internet', 'danger', 'bottom', duration);
    else this.stop_toast = false;
  }

  checkMessageForErrorToast(error: any, msg?: string) {
    if(error?.error?.message) {
      msg = error.error.message;
    }
    this.errorToast(msg);
  }

  successToast(msg: string) {
    this.showToast(msg, 'success', 'bottom');
  }

  infoToast(msg: string) {
    this.showToast(msg, 'secondary', 'bottom');
  }

  async showLoader(msg?: string, spinner?: any) {
    this.blurActiveElement();
    this.isLoading = true;
    try {
      const res = await this.loadingCtrl.create({
        message: msg,
        spinner: spinner ? spinner : 'bubbles'
      });
      await res.present();
      
      // Checagem extra caso hideLoader tenha sido chamado durante a animação de abertura
      if (!this.isLoading) {
        await res.dismiss();
      }
    } catch (e) {
      console.log('show loading error: ', e);
    }
  }

  async hideLoader() {
    this.isLoading = false;
    try {
      const loader = await this.loadingCtrl.getTop();
      if (loader) {
        await loader.dismiss();
      }
      console.log('dismissed');
    } catch (e) {
      console.log('error hide loader: ', e);
    }
  }

  async createModal(options: any) {
    this.blurActiveElement();
    const modal = await this.modalCtrl.create(options);
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data);
    if(data) return data;
  }

  modalDismiss(val?: any) {
    let data: any = val ? val : null;
    console.log('data', data);
    this.modalCtrl.dismiss(data);
  }

  getIcon(title: string) {
    const name = title.toLowerCase();
    switch(name) {
      case 'home': return 'home-outline';
      case 'work': return 'briefcase-outline';
      default: return 'location-outline';
    }
  }

  checkPlatformForWeb() {
    if(Capacitor.getPlatform() == 'web') return true;
    return false;
  }

  async customStatusbar(primaryColor?: boolean) {
    if(!this.checkPlatformForWeb()) {
      await StatusBar.setStyle({style: primaryColor ? Style.Dark : Style.Light});
      if(isPlatform('android')) await StatusBar.setBackgroundColor({ color: primaryColor ? '#de0f17' : '#ffffff'});
    }
  }

  async takePicture() {
    //await Camera.requestPermissions();
    const image = await Camera.getPhoto({
      quality: 90,
      // allowEditing: false,
      source: CameraSource.Prompt,
      width: 600,
      resultType: CameraResultType.Base64,
      saveToGallery: true
    });
    console.log('image: ', image);
    return image;
  }

  chooseImageFile(event: any) {
    console.log(event);
    const files = event.target.files;
    if(files.length == 0) return;
    const mimeType = files[0].type;
    if(mimeType.match(/image\/*/) == null) return;
    const file = files[0];
    // const filePath = 'restuarants/' + Date.now() + '_' + file.name;
    return file;
  }

  getBlob(b64Data: string) {
    let contentType = '';
    let sliceSize = 512;

    b64Data = b64Data.replace(/data\:image\/(jpeg|jpg|png)\;base64\,/gi, '');

    let byteCharacters = atob(b64Data);
    let byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    let blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  /**
   * Formata um valor numérico para a moeda local (BRL).
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
  
}
