import { Injectable, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Strings } from 'src/app/enum/strings';
import { Address } from 'src/app/models/address.model';
import { environment } from 'src/environments/environment'; // Importar environment
import { ApiService } from '../api/api.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  readonly radius = signal(environment.deliveryRadiusKm); // Raio de entrega como Signal

  private _addresses = signal<Address[]>([]);
  private _addressChange = signal<Address | null>(null);

  // Exposição de Signals reativos (Read-only) para os componentes
  addresses = this._addresses.asReadonly();
  addressChange = this._addressChange.asReadonly();

  constructor(
    private api: ApiService,
    private storage: StorageService
  ) { }

  async getStoredAddress(): Promise<Address | null> {
    const stored = await this.storage.getStorage(Strings.USER_LOCATION);
    const address = (stored?.value && stored.value !== 'undefined') ? JSON.parse(stored.value) : null;
    
    // Se encontrou no storage e o estado atual está vazio, atualiza o Signal de endereço ativo
    if (address && address.lat && !this._addressChange()) {
      this._addressChange.set(address);
    }
    return address;
  }

  clearAddress() {
    this._addressChange.set(null);
  }

  async getAddresses(limit?: number, page?: number) {
    try {
      let addresses: Address[];
      let address_data: any;
      if(limit) {
        const address_data$ = this.api.get('addresses/getUserLimitedAddresses', { limit });
        // address_data = await (address_data$).toPromise();
        address_data = await lastValueFrom(address_data$);
        const rawAddresses = Array.isArray(address_data?.data) ? address_data.data : [];
        addresses = rawAddresses.map((addr: any) => Address.fromJson(addr));
      } else {
        const address_data$ = this.api.get('addresses/userAddresses', page ? { page } : null);
        // address_data = await address_data$.toPromise();
        address_data = await lastValueFrom(address_data$);
        
        // Mapeia os dados brutos para instâncias da classe Address
        const rawAddresses = address_data?.data?.addresses || [];
        if (Array.isArray(rawAddresses)) {
          addresses = rawAddresses.map((addr: any) => Address.fromJson(addr));
        } else {
          addresses = [];
        }
      }
      if(page) {
        this._addresses.update(current => [...current, ...addresses]);
      } else {
        console.log(addresses);
        this._addresses.set(addresses);
      }
      return address_data;
    } catch(e) {
      console.log(e);
      throw(e);
    }
  }

  async addAddress(param: any, no_address_change?: boolean) {
    try {
      //param.id = Math.random().toString(36).substring(2); // gera um id aleatorio, pode ser melhorado usando uma biblioteca como uuid
      //param.user_id = '1'; // user id, pode ser melhorado usando o id do usuário logado
      const res: any = await lastValueFrom(this.api.post('addresses/create', param));      
      !environment.production && console.log('Raw API Response (addAddress):', res);
      
      // O fromJson agora é inteligente o suficiente para extrair o dado, 
      // mas passamos res diretamente para garantir
      let address = Address.fromJson(res?.data);
      
      console.log('added address: ', address);

      // Se o backend não retornou o _id no create, buscamos no banco via lat/lng 
      // para garantir que o Carrinho receba o ID persistente na hora.
      if(!address._id && address.lat) {
        const validated = await this.checkExistAddress(address);
        if(validated && validated._id) address = validated;
      }

      // Atualização reativa do array de endereços
      this._addresses.update(current => [...current, address]);
      
      // Garante que o novo endereço seja definido como o ativo e persistido no storage
      if(!no_address_change) await this.changeAddress(address);
      
      return address
    } catch (e) {
      throw(e);
    }
  }

  async updateAddress(id: string, param: any) {
    try {
      const res: any = await lastValueFrom(this.api.put(`addresses/edit/${id}`, param));
      !environment.production && console.log('Raw API Response (updateAddress):', res);
      
      // Garante o mapeamento do _id após a atualização
      const address = Address.fromJson(res?.data);
      
      console.log('updated address: ', address);
      this._addresses.update(current => current.map(x => x._id == id ? address : x));

    //this._addressChange.next(data);
      return address;
    } catch (e) {
      throw(e);
    }
  }

  async deleteAddress(param: Address) {
    try {
      const response = await lastValueFrom(this.api.delete('addresses/delete/' + param._id));
      const currentAddresses = this._addresses().filter(x => x._id != param._id);
      this._addresses.set(currentAddresses);
      return currentAddresses;
    } catch (e) {
      throw(e);
    }
  }

  /**
   * Altera o endereço ativo e persiste no storage para manter entre sessões
   */
  async changeAddress(address: Address) {
    // Persiste no storage se tiver ao menos a latitude (contexto básico)
    if (address?.lat) {
      // Se o título estiver vindo do mapa (ex: "81") mas tivermos dados salvos, 
      // poderíamos validar aqui, mas o importante é salvar o objeto com _id.
      !environment.production && console.log('[AddressService] Persistindo endereço ativo:', address);
      
      // Garante que salvamos um objeto simples com todas as propriedades, incluindo _id
      const plainAddress = address instanceof Address ? { ...address } : address;
      await this.storage.setStorage(Strings.USER_LOCATION, JSON.stringify(plainAddress));
    }
    this._addressChange.set(address);
  }

  async checkExistAddress(location: any) {
    if (!location?.lat || !location?.lng) return null;
    console.log('check exist address: ', location);
    let loc: Address = location;
    try {
      const res: any = await lastValueFrom(this.api.get(
        'addresses/checkAddress', 
        { lat: location.lat, lng: location.lng }
      ));
      
      // Se o endereço existir no banco, converte para a classe Address (garante o _id)
      if(res && res.data) loc = Address.fromJson(res.data); // Acessa a propriedade data do envelope
      
      console.log(loc);
      this.changeAddress(loc);
      return loc;
    } catch (e) {
      throw(e)
    }
  }
 
}
