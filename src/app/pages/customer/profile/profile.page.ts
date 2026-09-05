import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { AddressService } from '../../../services/address/address.service';
import { AddressModalComponent } from '../../../components/address-modal/address-modal.component';
import { Address } from '../../../models/address.model';
import { 
  IonContent, IonIcon, ModalController, ToastController, AlertController, IonSpinner 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, mailOutline, phonePortraitOutline, locationOutline, 
  logOutOutline, chevronForwardOutline, walletOutline, addCircleOutline,
  homeOutline, businessOutline, pinOutline, trashOutline, starOutline,
  star, checkmarkCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonIcon, IonSpinner
  ]
})
export class ProfilePage implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  public addressService = inject(AddressService);
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  public customerProfile = computed(() => this.profileService.profile());
  public customerName = computed(() => this.customerProfile()?.name || 'Cliente');
  public customerEmail = computed(() => this.customerProfile()?.email || '');
  public customerPhone = computed(() => this.customerProfile()?.phone || 'Não informado');

  public isActionLoading = signal<boolean>(false);

  constructor() {
    addIcons({ 
      personOutline, mailOutline, phonePortraitOutline, locationOutline, 
      logOutOutline, chevronForwardOutline, walletOutline, addCircleOutline,
      homeOutline, businessOutline, pinOutline, trashOutline, starOutline,
      star, checkmarkCircleOutline
    });
  }

  async ngOnInit() {
    await this.addressService.loadUserAddresses();
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
      this.showToast('Endereço adicionado com sucesso!', 'success');
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

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  public logout() {
    this.authService.logout();
  }
}
