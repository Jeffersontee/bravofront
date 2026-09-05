import { Component, OnInit, ElementRef, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { AddressService } from '../../../services/address/address.service';
import { GlobalService } from '../../../services/global/global.service';
import { AddressModalComponent } from '../../../components/address-modal/address-modal.component';
import { AccountFormComponent } from '../../../components/account-form/account-form.component';
import { Address } from '../../../models/address.model';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonIcon, IonAvatar, IonSpinner, IonRefresher, IonRefresherContent, ModalController, ToastController, AlertController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, mailOutline, callOutline, locationOutline, 
  powerOutline, logOutOutline, chevronForwardOutline, walletOutline, 
  addCircleOutline, homeOutline, businessOutline, pinOutline, 
  trashOutline, starOutline, star, checkmarkCircleOutline,
  receiptOutline, alertCircleOutline, chevronDownCircleOutline, cameraOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonIcon, IonAvatar, IonSpinner, IonRefresher, IonRefresherContent
  ]
})
export class ProfilePage implements OnInit {
  @ViewChild('filePicker', { static: false }) filePickerRef!: ElementRef;

  private router = inject(Router);
  public authService = inject(AuthService);
  public profileService = inject(ProfileService);
  public addressService = inject(AddressService);
  public global = inject(GlobalService);
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  public customerProfile = computed(() => this.profileService.profile());
  public customerName = computed(() => this.customerProfile()?.name || 'Cliente');
  public customerEmail = computed(() => this.customerProfile()?.email || '');
  public customerPhone = computed(() => this.customerProfile()?.phone || 'Não informado');
  public isEmailVerified = computed(() => Boolean(this.customerProfile()?.email_verified));

  public isActionLoading = signal<boolean>(false);
  public isPhotoUploading = signal<boolean>(false);

  constructor() {
    addIcons({ 
      personOutline, mailOutline, callOutline, locationOutline, 
      powerOutline, logOutOutline, chevronForwardOutline, walletOutline, 
      addCircleOutline, homeOutline, businessOutline, pinOutline, 
      trashOutline, starOutline, star, checkmarkCircleOutline,
      receiptOutline, alertCircleOutline, chevronDownCircleOutline, cameraOutline
    });
  }

  async ngOnInit() {
    await this.addressService.loadUserAddresses();
  }

  public async doRefresh(event: any) {
    await this.profileService.getProfile(true);
    await this.addressService.loadUserAddresses();
    event.target.complete();
  }

  public navigateToOrders() {
    this.router.navigate(['/customer/orders']);
  }

  public async editProfile() {
    const options = {
      component: AccountFormComponent,
      componentProps: {
        profile: this.customerProfile()
      },
      cssClass: 'inline_modal',
      breakpoints: [0, 0.5, 0.88],
      initialBreakpoint: 0.88,
      swipeToClose: true,
    };
    const result = await this.global.createModal(options);
    if (result) {
      if (result.token && result.refreshToken) {
        await this.authService.setUserData(result.token, result.refreshToken);
      }
      await this.profileService.getProfile(true);
      this.showToast('Perfil atualizado com sucesso!', 'success');
    }
  }

  public async editPicture() {
    try {
      if (this.global.checkPlatformForWeb()) {
        this.filePickerRef.nativeElement.click();
      } else {
        const imageData = await this.global.takePicture();
        if (imageData && imageData.base64String) {
          const blob = this.global.getBlob(imageData.base64String);
          const imageFile = new File([blob], 'profile.png', { type: 'image/png' });
          await this.uploadProfilePic(imageFile);
        }
      }
    } catch (e) {
      console.log('Erro ao selecionar foto:', e);
    }
  }

  public async onFileChosen(event: any) {
    try {
      const imageFile = this.global.chooseImageFile(event);
      if (imageFile) {
        await this.uploadProfilePic(imageFile);
      }
    } catch (e) {
      console.log('Erro ao processar arquivo selecionado:', e);
    }
  }

  public async uploadProfilePic(imageFile: any) {
    this.isPhotoUploading.set(true);
    try {
      await this.global.showLoader('Atualizando foto...');
      const postData = new FormData();
      postData.append('profileImages', imageFile, imageFile.name || 'profile.jpg');
      await this.profileService.updateProfilePic(postData);
      await this.profileService.getProfile(true);
      this.showToast('Foto de perfil atualizada com sucesso!', 'success');
    } catch (e) {
      console.log('Erro ao enviar foto:', e);
      this.showToast('Erro ao atualizar foto de perfil.', 'danger');
    } finally {
      this.global.hideLoader();
      this.isPhotoUploading.set(false);
    }
  }

  public async openAddAddressModal() {
    const modal = await this.modalCtrl.create({
      component: AddressModalComponent,
      breakpoints: [0, 0.6, 0.95],
      initialBreakpoint: 0.95
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data._id) {
      this.addressService.changeActiveAddress(data);
      this.showToast('Endereço definido com sucesso!', 'success');
    }
  }

  public async setAsDefault(addr: Address, event: Event) {
    event.stopPropagation();
    if (!addr._id || addr.is_default) return;

    this.isActionLoading.set(true);
    try {
      await this.addressService.setDefaultAddress(addr._id);
      this.showToast(`"${addr.title}" definido como endereço principal.`, 'success');
    } catch (e) {
      this.showToast('Erro ao alterar endereço principal.', 'danger');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  public async confirmDeleteAddress(addr: Address, event: Event) {
    event.stopPropagation();
    if (!addr._id) return;

    const alert = await this.alertCtrl.create({
      header: 'Excluir Endereço',
      message: `Deseja realmente remover o endereço "${addr.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            try {
              await this.addressService.deleteAddress(addr._id!);
              this.showToast('Endereço excluído com sucesso.', 'success');
            } catch (e) {
              this.showToast('Erro ao excluir endereço.', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  public async confirmLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Sair da Conta',
      message: 'Tem certeza que deseja encerrar a sua sessão?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sair',
          role: 'destructive',
          handler: () => this.authService.logout()
        }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
