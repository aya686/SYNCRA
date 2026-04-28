import { Component, Output, EventEmitter, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

declare var L: any;

@Component({
  selector: 'app-map-picker',
  template: `
    <div class="map-container">
      <button type="button" class="btn-open-map" (click)="openMapModal()">
        🗺️ Ouvrir la carte pour choisir un lieu
      </button>
      
      <div *ngIf="showMap" class="map-modal">
        <div class="map-modal-content">
          <div class="map-modal-header">
            <h3>Sélectionnez un emplacement sur la carte</h3>
            <button class="close-btn" (click)="closeMapModal()">✕</button>
          </div>
          <div class="map-modal-body">
            <div id="picker-map" style="height: 400px; width: 100%;"></div>
          </div>
          <div class="map-modal-footer">
            <button class="btn-confirm" (click)="confirmLocation()">Confirmer cette position</button>
            <button class="btn-cancel" (click)="closeMapModal()">Annuler</button>
          </div>
        </div>
      </div>
      
      <div *ngIf="selectedAddress" class="selected-location">
        <p><strong>📍 Lieu sélectionné :</strong></p>
        <p>{{selectedAddress}}</p>
        <p class="coords">Lat: {{selectedLat}}, Lng: {{selectedLng}}</p>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      margin: 10px 0;
    }
    .btn-open-map {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      width: 100%;
    }
    .btn-open-map:hover {
      background: #5a67d8;
    }
    .map-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .map-modal-content {
      background: white;
      border-radius: 12px;
      width: 80%;
      max-width: 800px;
      max-height: 90vh;
      overflow: hidden;
    }
    .map-modal-header {
      padding: 15px 20px;
      background: #667eea;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .map-modal-header h3 {
      margin: 0;
    }
    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }
    .map-modal-body {
      padding: 20px;
    }
    .map-modal-footer {
      padding: 15px 20px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      border-top: 1px solid #e0e0e0;
    }
    .btn-confirm {
      background: #27ae60;
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-cancel {
      background: #95a5a6;
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 6px;
      cursor: pointer;
    }
    .selected-location {
      margin-top: 10px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 13px;
    }
    .coords {
      font-size: 11px;
      color: #666;
      margin-top: 5px;
    }
  `]
})
export class MapPickerComponent implements AfterViewInit {
  @Output() locationSelected = new EventEmitter<{lat: number, lng: number, address: string}>();
  
  showMap = false;
  selectedLat: number = 48.8566;
  selectedLng: number = 2.3522;
  selectedAddress: string = '';
  private map: any;
  private marker: any;

  ngAfterViewInit(): void {}

  openMapModal(): void {
    this.showMap = true;
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  closeMapModal(): void {
    this.showMap = false;
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    const mapElement = document.getElementById('picker-map');
    if (!mapElement) return;
    
    // Charger Leaflet dynamiquement si nécessaire
    if (typeof L === 'undefined') {
      this.loadLeafletScript();
      return;
    }
    
    this.createMap();
  }

  private loadLeafletScript(): void {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      this.createMap();
    };
    document.head.appendChild(script);
  }

  private createMap(): void {
    this.map = L.map('picker-map').setView([this.selectedLat, this.selectedLng], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);
    
    this.marker = L.marker([this.selectedLat, this.selectedLng], {
      draggable: true
    }).addTo(this.map);
    
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.updateMarkerPosition(lat, lng);
    });
    
    this.marker.on('dragend', (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      this.updateMarkerPosition(lat, lng);
    });
  }

  private async updateMarkerPosition(lat: number, lng: number): Promise<void> {
    this.selectedLat = lat;
    this.selectedLng = lng;
    this.marker.setLatLng([lat, lng]);
    this.map.setView([lat, lng], 15);
    this.selectedAddress = await this.getAddressFromCoords(lat, lng);
  }

  private async getAddressFromCoords(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=fr`);
      const data = await response.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch {
      return `${lat}, ${lng}`;
    }
  }

confirmLocation(): void {
  console.log('=== CONFIRMATION LIEU ===');
  console.log('Latitude:', this.selectedLat);
  console.log('Longitude:', this.selectedLng);
  console.log('Adresse:', this.selectedAddress);
  
  this.locationSelected.emit({
    lat: this.selectedLat,
    lng: this.selectedLng,
    address: this.selectedAddress
  });
  this.closeMapModal();
}
}