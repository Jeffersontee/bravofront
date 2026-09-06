import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface GeocodedAddress {
  title: string;
  address: string;
  street: string;
  number?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipcode?: string;
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsService {
  private http = inject(HttpClient);
  private zone = inject(NgZone);

  public googleMaps: any = null;
  private _places = new BehaviorSubject<any[]>([]);
  private _markerChange = new BehaviorSubject<any>({});

  get places() {
    return this._places.asObservable();
  }

  get markerChange() {
    return this._markerChange.asObservable();
  }

  /**
   * Carrega o SDK do Google Maps dinamicamente se necessário
   */
  public loadGoogleMaps(): Promise<any> {
    const win = window as any;
    if (win.google && win.google.maps) {
      this.googleMaps = win.google.maps;
      return Promise.resolve(win.google.maps);
    }

    return new Promise((resolve, reject) => {
      const apiKey = environment.googleMapsApiKey;
      const script = document.createElement('script');
      script.id = 'googleMapsSdk';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        const loaded = (window as any).google;
        if (loaded && loaded.maps) {
          this.googleMaps = loaded.maps;
          resolve(loaded.maps);
        } else {
          reject(new Error('Google Maps SDK não disponível após carregamento'));
        }
      };

      script.onerror = (err) => {
        reject(err);
      };
    });
  }

  /**
   * Obtém endereço por coordenadas (Geocodificação Reversa) com fallback inteligente
   */
  public async getAddress(lat: number, lng: number): Promise<GeocodedAddress> {
    const apiKey = environment.googleMapsApiKey;
    
    // Tenta primeiro via Google Geocoding API se a chave estiver configurada
    if (apiKey && !apiKey.includes('YOUR_KEY')) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        const res: any = await this.http.get<any>(url).toPromise();

        if (res && res.results && res.results.length > 0) {
          return this.parseGoogleGeocodeResult(res.results[0], lat, lng);
        }
      } catch (err) {
        console.warn('Falha no Google Geocoding API, tentando fallback Nominatim:', err);
      }
    }

    // Fallback: OpenStreetMap Nominatim (Gratuito e universal)
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
      const nomRes: any = await this.http.get<any>(nominatimUrl).toPromise();

      if (nomRes && nomRes.address) {
        const addr = nomRes.address;
        const street = addr.road || addr.street || addr.pedestrian || 'Rua detectada';
        const number = addr.house_number || '';
        const neighborhood = addr.suburb || addr.neighbourhood || addr.city_district || '';
        const city = addr.city || addr.town || addr.municipality || 'São Paulo';
        const state = addr.state ? addr.state.slice(0, 2).toUpperCase() : 'SP';
        const zipcode = addr.postcode ? addr.postcode.replace(/\D/g, '') : '';
        const formatted = `${street}${number ? ', ' + number : ''}${neighborhood ? ' - ' + neighborhood : ''}, ${city} - ${state}`;

        return {
          title: street,
          address: formatted,
          street,
          number,
          neighborhood,
          city,
          state,
          zipcode,
          lat,
          lng
        };
      }
    } catch (nomErr) {
      console.warn('Falha no fallback Nominatim:', nomErr);
    }

    // Fallback final
    return {
      title: 'Localização Atual (GPS)',
      address: `Localização (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
      street: 'Localização GPS',
      number: '',
      neighborhood: '',
      city: 'São Paulo',
      state: 'SP',
      lat,
      lng
    };
  }

  private parseGoogleGeocodeResult(result: any, lat: number, lng: number): GeocodedAddress {
    const components = result.address_components || [];
    let street = '';
    let number = '';
    let neighborhood = '';
    let city = 'São Paulo';
    let state = 'SP';
    let zipcode = '';

    for (const comp of components) {
      const types = comp.types || [];
      if (types.includes('route')) {
        street = comp.long_name;
      } else if (types.includes('street_number')) {
        number = comp.long_name;
      } else if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('neighborhood')) {
        neighborhood = comp.long_name;
      } else if (types.includes('administrative_area_level_2') || types.includes('locality')) {
        city = comp.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = comp.short_name;
      } else if (types.includes('postal_code')) {
        zipcode = comp.long_name.replace(/\D/g, '');
      }
    }

    const title = street || result.formatted_address?.split(',')[0] || 'Meu Endereço';
    const formatted = result.formatted_address || `${street}, ${number} - ${neighborhood}, ${city} - ${state}`;

    return {
      title,
      address: formatted,
      street: street || title,
      number,
      neighborhood,
      city,
      state,
      zipcode,
      lat,
      lng
    };
  }

  public changeMarkerInMap(location: any) {
    this._markerChange.next(location);
  }
}
