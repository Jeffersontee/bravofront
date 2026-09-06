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
  searchOutline, alertCircleOutline, arrowBackOutline, pinOutline,
  chevronForwardOutline, checkmarkOutline
} from 'ionicons/icons';
import { AddressService } from '../../services/address/address.service';
import { CepService } from '../../services/cep/cep.service';
import { GoogleMapsService, GeocodedAddress } from '../../services/google-maps/google-maps.service';
import { Address } from '../../models/address.model';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-address-modal',
  templateUrl: './address-modal.component.html',
  styleUrls: ['./address-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, 
    IonButtons, IonButton, IonContent, IonIcon, IonSpinner, MapComponent
  ]
})
export class AddressModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  public addressService = inject(AddressService);
  private cepService = inject(CepService);
  private googleMapsService = inject(GoogleMapsService);

  public viewMode = signal<'LIST' | 'FORM' | 'GPS_MAP'>('LIST');
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

  // Exibição formatada do endereço no GPS Map
  public gpsFormattedAddress = signal<string>('');

  constructor() {
    addIcons({
      closeOutline, locationOutline, navigateOutline, addCircleOutline,
      checkmarkCircle, checkmarkCircleOutline, homeOutline, businessOutline,
      searchOutline, alertCircleOutline, arrowBackOutline, pinOutline,
      chevronForwardOutline, checkmarkOutline
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
    this.gpsFormattedAddress.set('');
    this.isDefault.set(this.addressService.addresses().length === 0);
  }

  /**
   * Captura localização atual via GPS, faz geocodificação e abre pré-tela com mini mapa
   */
  public async useCurrentGpsLocation() {
    this.isDetectingGps.set(true);
    try {
      const position = await this.addressService.getCurrentPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      this.addressLat.set(lat);
      this.addressLng.set(lng);

      // Geocodificação reversa
      const geocoded = await this.googleMapsService.getAddress(lat, lng);
      
      this.addressStreet.set(geocoded.street || 'Rua detectada');
      this.addressNumber.set(geocoded.number || '');
      this.addressNeighborhood.set(geocoded.neighborhood || '');
      this.addressCity.set(geocoded.city || 'São Paulo');
      this.addressState.set(geocoded.state || 'SP');
      this.addressCep.set(geocoded.zipcode || '');
      this.addressTitle.set(geocoded.title || 'Meu Endereço');
      this.gpsFormattedAddress.set(geocoded.address);

      // Abre a pré-tela de confirmação com mapa
      this.viewMode.set('GPS_MAP');
      this.showToast('Localização obtida! Confirme os detalhes do endereço.', 'success');
    } catch (e: any) {
      console.error('Erro GPS:', e);
      this.showToast('Não foi possível obter a localização GPS. Por favor, insira o CEP ou endereço manualmente.', 'warning');
      this.viewMode.set('FORM');
    } finally {
      this.isDetectingGps.set(false);
    }
  }

  /**
   * Atualização de endereço quando o usuário move o pin no mini mapa
   */
  public onMapLocationChange(loc: GeocodedAddress) {
    if (!loc) return;
    this.addressLat.set(loc.lat);
    this.addressLng.set(loc.lng);
    if (loc.street) this.addressStreet.set(loc.street);
    if (loc.number) this.addressNumber.set(loc.number);
    if (loc.neighborhood) this.addressNeighborhood.set(loc.neighborhood);
    if (loc.city) this.addressCity.set(loc.city);
    if (loc.state) this.addressState.set(loc.state);
    if (loc.zipcode) this.addressCep.set(loc.zipcode);
    this.gpsFormattedAddress.set(loc.address);
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
   * Salva o novo endereço (usado tanto no formulário manual quanto na pré-tela de GPS com mapa)
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
      const fullAddress = `${street}${number ? ', ' + number : ''}${this.addressComplement() ? ' - ' + this.addressComplement() : ''}${neighborhood ? ' - ' + neighborhood : ''}, ${city} - ${state}`;

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
        this.showToast('Endereço confirmado e salvo com sucesso!', 'success');
        this.dismiss(created);
      }
    } catch (e: any) {
      this.isSaving.set(false);
      console.error('Erro ao salvar endereço:', e);
      const msg = e?.error?.message || 'Erro ao salvar endereço. Tente novamente.';
      this.showToast(msg, 'danger');
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
