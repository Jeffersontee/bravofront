import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  constructor() { }
  // pode ser async?
  async setStorage(key: string, value: string) {
    // Salva e retorna a Promise para permitir await no chamador
    return await Preferences.set({ key: key, value: value });
  }

  async getStorage(key: string) {
    return await Preferences.get({ key: key });
  }

  // remove e type void entao retorna a Promise para o chamador aguardar
  async removeStorage(key: string) {
    return await Preferences.remove({ key: key });
  }

  // remove tudo tomar cuidado - void não precisa de return mais se tivesse daria erro?
  clearStorage() {
    //Storage.clear();
    Preferences.clear();
  }

}
