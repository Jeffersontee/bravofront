import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonIcon, IonSpinner, ModalController, ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  closeOutline, locationOutline, navigateOutline, addCircleOutline, 
  checkmarkCircle, checkmarkCircleOutline, homeOutline, businessOutline, 
  searchOutline, alertCircleOutline, arrowBackOutline, pinOutline
} from 'ionicons/icons';
import { AddressService } from '../../services/address/address.service';
import { CepService } from '../../services/cep/cep.service';
import { Address } from '../../models/address.model';

@Component({
  selector: 'app-address-modal',
  templateUrl: './address-modal.component.html',
  styleUrls: ['./address-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, 
    IonButtons, IonButton, IonContent, IonIcon, IonSpinner
  ]
})
export class AddressModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  public addressService = inject(AddressService);
  private cepService = inject(CepService);

  public viewMode = signal<'LIST' | 'FORM'>('LIST');
  public isDetectingGps = signal<boolean>(false);
  public isSearchingCep = signal<boolean>(false);
  public isSaving = signal<boolean>(false);

  // Form Fields
  public addressTitle = signal<string>('Casa');
  public addressCep = signal<string>('');
  public addressStreet = signal<string>('');
  public addressNumber = signal<string>('');
  public addressComplement = signal<string>('');
  public addressNeighborhood = signal<string>('');
  public addressCity = signal<string>('São Paulo');
  public addressState = signal<string>('SP');
  public addressLandmark = signal<string>('');
  public addressLat = signal<number>(-23.55052);
  public addressLng = signal<number>(-46.633308);
  public isDefault = signal<boolean>(true);

  constructor() {
    addIcons({
      closeOutline, locationOutline, navigateOutline, addCircleOutline,
      checkmarkCircle, checkmarkCircleOutline, homeOutline, businessOutline,
      searchOutline, alertCircleOutline, arrowBackOutline, pinOutline
    });
  }

  async ngOnInit() {
    await this.addressService.loadUserAddresses();
  }

  public dismiss(address?: Address) {
    this.modalCtrl.dismiss(address);
  }

  public selectAddress(addr: Address) {
    this.addressService.changeActiveAddress(addr);
    this.dismiss(addr);
  }

  public openNewAddressForm() {
    this.resetForm();
    this.viewMode.set('FORM');
  }

  public backToList() {
    this.viewMode.set('LIST');
  }

  public resetForm() {
    this.addressTitle.set('Casa');
    this.addressCep.set('');
    this.addressStreet.set('');
    this.addressNumber.set('');
    this.addressComplement.set('');
    this.addressNeighborhood.set('');
    this.addressCity.set('São Paulo');
    this.addressState.set('SP');
    this.addressLandmark.set('');
    this.addressLat.set(-23.55052);
    this.addressLng.set(-46.633308);
    this.isDefault.set(this.addressService.addresses().length === 0);
  }

  /**
   * Captura localização atual via GPS e define imediatamente
   */
  public async useCurrentGpsLocation() {
    this.isDetectingGps.set(true);
    try {
      const position = await this.addressService.getCurrentPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      this.addressLat.set(lat);
      this.addressLng.set(lng);

      const gpsAddressPayload: Partial<Address> = {
        title: 'Localização Atual (GPS)',
        address: `Localização GPS (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        street: 'Localização Atual via GPS',
        city: 'São Paulo',
        state: 'SP',
        lat,
        lng,
        is_default: this.addressService.addresses().length === 0
      };

      // Salva no banco e define como ativo
      const created = await this.addressService.createAddress(gpsAddressPayload);
      this.showToast('Localização GPS definida com sucesso!', 'success');
      this.dismiss(created || undefined);
    } catch (e: any) {
      console.error('Erro GPS:', e);
      this.showToast('Não foi possível obter a localização GPS. Por favor, insira o CEP ou endereço manualmente.', 'warning');
      this.viewMode.set('FORM');
    } finally {
      this.isDetectingGps.set(false);
    }
  }

  /**
   * Busca endereço automaticamente ao digitar o CEP
   */
  public onCepInput(event: any) {
    const rawValue = event.target.value || '';
    const formatted = this.cepService.formatCep(rawValue);
    this.addressCep.set(formatted);

    const clean = rawValue.replace(/\D/g, '');
    if (clean.length === 8) {
      this.isSearchingCep.set(true);
      this.cepService.searchCep(clean).subscribe({
        next: (data) => {
          this.isSearchingCep.set(false);
          if (data) {
            this.addressStreet.set(data.logradouro || '');
            this.addressNeighborhood.set(data.bairro || '');
            this.addressCity.set(data.localidade || 'São Paulo');
            this.addressState.set(data.uf || 'SP');
            this.showToast(`Endereço localizado: ${data.logradouro}, ${data.bairro}`, 'success');
          } else {
            this.showToast('CEP não encontrado. Por favor, preencha o endereço manualmente.', 'warning');
          }
        },
        error: () => {
          this.isSearchingCep.set(false);
        }
      });
    }
  }

  /**
   * Salva o novo endereço
   */
  public async saveAddress() {
    const street = this.addressStreet().trim();
    const number = this.addressNumber().trim();
    const neighborhood = this.addressNeighborhood().trim();
    const city = this.addressCity().trim();
    const state = this.addressState().trim();

    if (!street || !city) {
      this.showToast('Por favor, informe ao menos a rua/logradouro e a cidade.', 'warning');
      return;
    }

    this.isSaving.set(true);

    try {
      const fullAddress = `${street}${number ? ', ' + number : ''}${this.addressComplement() ? ' - ' + this.addressComplement() : ''} - ${neighborhood}, ${city} - ${state}`;

      const payload: Partial<Address> = {
        title: this.addressTitle() || 'Meu Endereço',
        zipcode: this.addressCep(),
        street,
        number,
        complement: this.addressComplement(),
        neighborhood,
        city,
        state,
        house: number,
        landmark: this.addressLandmark(),
        address: fullAddress,
        lat: this.addressLat(),
        lng: this.addressLng(),
        is_default: this.isDefault()
      };

      const created = await this.addressService.createAddress(payload);
      this.isSaving.set(false);

      if (created) {
        this.showToast('Endereço salvo com sucesso!', 'success');
        this.dismiss(created);
      }
    } catch (e: any) {
      this.isSaving.set(false);
      console.error('Erro ao salvar endereço:', e);
      this.showToast('Erro ao salvar endereço. Tente novamente.', 'danger');
    }
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
