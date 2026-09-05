import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Strings } from 'src/app/enum/strings';
import { Address } from 'src/app/models/address.model';

export interface CoverageResult {
  is_covered: boolean;
  distance_km: number;
  max_radius_km: number;
  estimated_duration_min: number;
  base_location?: {
    lat: number;
    lng: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.serverUrl}${Strings.API_ADDRESSES}`;

  // Signals reativos para gerenciamento de estado
  private _addresses = signal<Address[]>([]);
  private _activeAddress = signal<Address | null>(null);
  public isLoading = signal<boolean>(false);

  public addresses = this._addresses.asReadonly();
  public activeAddress = this._activeAddress.asReadonly();

  constructor() {
    this.restoreStoredAddress();
  }

  private restoreStoredAddress() {
    try {
      const stored = localStorage.getItem(Strings.USER_LOCATION);
      if (stored && stored !== 'undefined') {
        const parsed = JSON.parse(stored);
        if (parsed?.lat && parsed?.lng) {
          this._activeAddress.set(Address.fromJson(parsed));
        }
      }
    } catch (e) {
      console.warn('Erro ao restaurar endereço do localStorage:', e);
    }
  }

  /**
   * Altera o endereço ativo e persiste no storage local
   */
  public changeActiveAddress(address: Address | null) {
    this._activeAddress.set(address);
    if (address && address.lat) {
      localStorage.setItem(Strings.USER_LOCATION, JSON.stringify(address));
    } else {
      localStorage.removeItem(Strings.USER_LOCATION);
    }
  }

  public async changeAddress(address: Address | null) {
    this.changeActiveAddress(address);
  }

  public clearAddress() {
    this.changeActiveAddress(null);
  }

  public async getAddresses(limit?: number): Promise<Address[]> {
    return this.loadUserAddresses();
  }

  /**
   * Carrega todos os endereços do usuário autenticado
   */
  public async loadUserAddresses(): Promise<Address[]> {
    this.isLoading.set(true);
    try {
      const res: any = await lastValueFrom(this.http.get<{ success: boolean; data: { addresses: any[] } }>(`${this.apiUrl}/userAddresses`));
      const rawList = res?.data?.addresses || [];
      const mapped = rawList.map((item: any) => Address.fromJson(item));
      this._addresses.set(mapped);

      // Se o usuário tiver um endereço padrão e ainda não houver activeAddress, define o padrão
      const defaultAddr = mapped.find((a: Address) => a.is_default) || mapped[0];
      if (defaultAddr && !this._activeAddress()) {
        this.changeActiveAddress(defaultAddr);
      }

      this.isLoading.set(false);
      return mapped;
    } catch (e) {
      this.isLoading.set(false);
      console.error('Erro ao carregar endereços do usuário:', e);
      return [];
    }
  }

  /**
   * Salva um novo endereço
   */
  public async createAddress(addressData: Partial<Address>): Promise<Address | null> {
    this.isLoading.set(true);
    try {
      const res: any = await lastValueFrom(this.http.post<{ success: boolean; data: any }>(`${this.apiUrl}/create`, addressData));
      const newAddress = Address.fromJson(res?.data);

      this._addresses.update(current => [newAddress, ...current]);
      this.changeActiveAddress(newAddress);

      this.isLoading.set(false);
      return newAddress;
    } catch (e) {
      this.isLoading.set(false);
      console.error('Erro ao criar endereço:', e);
      throw e;
    }
  }

  /**
   * Atualiza um endereço existente
   */
  public async updateAddress(id: string, addressData: Partial<Address>): Promise<Address | null> {
    this.isLoading.set(true);
    try {
      const res: any = await lastValueFrom(this.http.put<{ success: boolean; data: any }>(`${this.apiUrl}/edit/${id}`, addressData));
      const updated = Address.fromJson(res?.data);

      this._addresses.update(current => current.map(item => item._id === id ? updated : item));
      if (this._activeAddress()?._id === id) {
        this.changeActiveAddress(updated);
      }

      this.isLoading.set(false);
      return updated;
    } catch (e) {
      this.isLoading.set(false);
      console.error('Erro ao atualizar endereço:', e);
      throw e;
    }
  }

  /**
   * Exclui um endereço
   */
  public async deleteAddress(id: string): Promise<boolean> {
    this.isLoading.set(true);
    try {
      await lastValueFrom(this.http.delete(`${this.apiUrl}/delete/${id}`));
      this._addresses.update(current => current.filter(item => item._id !== id));

      if (this._activeAddress()?._id === id) {
        const remaining = this._addresses();
        this.changeActiveAddress(remaining.length > 0 ? remaining[0] : null);
      }

      this.isLoading.set(false);
      return true;
    } catch (e) {
      this.isLoading.set(false);
      console.error('Erro ao excluir endereço:', e);
      throw e;
    }
  }

  /**
   * Define endereço como padrão
   */
  public async setDefaultAddress(id: string): Promise<Address | null> {
    try {
      const res: any = await lastValueFrom(this.http.patch<{ success: boolean; data: any }>(`${this.apiUrl}/default/${id}`, {}));
      const updated = Address.fromJson(res?.data);

      this._addresses.update(current => current.map(item => ({
        ...item,
        is_default: item._id === id
      })));

      this.changeActiveAddress(updated);
      return updated;
    } catch (e) {
      console.error('Erro ao definir endereço padrão:', e);
      throw e;
    }
  }

  /**
   * Valida cobertura geográfica (Geofencing)
   */
  public async checkCoverage(lat: number, lng: number, companyId?: string): Promise<CoverageResult | null> {
    try {
      const params: any = { lat, lng };
      if (companyId) params.company_id = companyId;

      const res: any = await lastValueFrom(this.http.get<{ success: boolean; data: CoverageResult }>(`${this.apiUrl}/checkCoverage`, { params }));
      return res?.data || null;
    } catch (e) {
      console.warn('Erro ao verificar cobertura:', e);
      return null;
    }
  }

  /**
   * Obtém localização atual via GPS do navegador / dispositivo
   */
  public getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo navegador.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  }
}
