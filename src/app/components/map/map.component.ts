import { 
  Component, OnInit, AfterViewInit, OnDestroy, 
  ElementRef, ViewChild, Renderer2, inject, input, output 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsService } from '../../services/google-maps/google-maps.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private mapsService = inject(GoogleMapsService);
  private renderer = inject(Renderer2);

  @ViewChild('mapElement', { static: true }) mapElementRef!: ElementRef;

  public center = input<{ lat: number; lng: number }>({ lat: -23.55052, lng: -46.633308 });
  public isInteractive = true;

  public locationChange = output<any>();

  private googleMaps: any;
  private map: any;
  private marker: any;
  private mapListener: any;
  private mapChangeSub?: Subscription;

  ngOnInit() {}

  async ngAfterViewInit() {
    await this.initMap();

    this.mapChangeSub = this.mapsService.markerChange.subscribe(async (loc: any) => {
      if (loc?.lat && this.googleMaps && this.map) {
        const location = new this.googleMaps.LatLng(loc.lat, loc.lng);
        this.map.panTo(location);
        if (this.marker) {
          this.marker.setPosition(location);
        }
      }
    });
  }

  private async initMap() {
    try {
      this.googleMaps = await this.mapsService.loadGoogleMaps();
      const currentCenter = this.center();
      const location = new this.googleMaps.LatLng(currentCenter.lat, currentCenter.lng);
      const mapEl = this.mapElementRef.nativeElement;

      this.map = new this.googleMaps.Map(mapEl, {
        center: location,
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy'
      });

      this.renderer.addClass(mapEl, 'visible');

      this.marker = new this.googleMaps.Marker({
        position: location,
        map: this.map,
        draggable: true,
        animation: this.googleMaps.Animation?.DROP
      });

      this.mapListener = this.googleMaps.event.addListener(this.marker, 'dragend', async () => {
        const lat = this.marker.getPosition().lat();
        const lng = this.marker.getPosition().lng();
        await this.handleLocationSelected(lat, lng);
      });

      // Também emite o primeiro endereço ao carregar
      await this.handleLocationSelected(currentCenter.lat, currentCenter.lng);
    } catch (e) {
      console.warn('Não foi possível inicializar Google Maps SDK. Modo estático/resiliente ativado:', e);
      const currentCenter = this.center();
      await this.handleLocationSelected(currentCenter.lat, currentCenter.lng);
    }
  }

  private async handleLocationSelected(lat: number, lng: number) {
    try {
      const geocoded = await this.mapsService.getAddress(lat, lng);
      this.locationChange.emit(geocoded);
    } catch (err) {
      console.warn('Erro ao obter geocodificação:', err);
      this.locationChange.emit({
        title: 'Local Selecionado',
        address: `Coordenadas (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        street: 'Local Selecionado',
        lat,
        lng
      });
    }
  }

  ngOnDestroy() {
    if (this.mapListener && this.googleMaps) {
      this.googleMaps.event.removeListener(this.mapListener);
    }
    if (this.mapChangeSub) {
      this.mapChangeSub.unsubscribe();
    }
  }
}
