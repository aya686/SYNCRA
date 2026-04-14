import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-viewer-container">
      <div id="viewer-map" style="height: 250px; width: 100%; border-radius: 12px;"></div>
      <div class="map-link">
        <a [href]="getGoogleMapsLink()" target="_blank" class="btn-map-link">
          📍 Ouvrir dans Google Maps
        </a>
      </div>
    </div>
  `,
  styles: [`
    .map-viewer-container {
      margin: 15px 0;
    }
    .map-link {
      margin-top: 10px;
      text-align: center;
    }
    .btn-map-link {
      display: inline-block;
      background: #4f46e5;
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 13px;
      transition: background 0.3s;
    }
    .btn-map-link:hover {
      background: #4338ca;
    }
  `]
})
export class MapViewerComponent implements OnInit, AfterViewInit {
  @Input() latitude: number = 48.8566;
  @Input() longitude: number = 2.3522;
  @Input() address: string = '';
  
  private map: any;
  private leafletLoaded = false;
  private retryCount = 0;

  ngOnInit(): void {
    this.loadLeaflet();
  }

  ngAfterViewInit(): void {
    // Vérification supplémentaire après la vue
    if (this.leafletLoaded) {
      this.initViewerMap();
    }
  }

  private loadLeaflet(): void {
    // Vérifier si Leaflet est déjà chargé
    if (typeof (window as any).L !== 'undefined') {
      this.leafletLoaded = true;
      this.initViewerMap();
      return;
    }

    // Charger CSS d'abord
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Puis charger le script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      this.leafletLoaded = true;
      this.initViewerMap();
    };
    script.onerror = () => {
      console.error('Erreur chargement Leaflet, tentative de rechargement...');
      if (this.retryCount < 3) {
        this.retryCount++;
        setTimeout(() => this.loadLeaflet(), 1000);
      }
    };
    document.head.appendChild(script);
  }

  private initViewerMap(): void {
  const mapElement = document.getElementById('viewer-map');
  if (!mapElement) {
    console.error('Élément map non trouvé');
    return;
  }
  
  if (!this.leafletLoaded || typeof (window as any).L === 'undefined') {
    console.error('Leaflet non chargé');
    return;
  }

  // Vérifier que les coordonnées sont valides
  if (!this.latitude || !this.longitude) {
    console.error('Coordonnées invalides:', this.latitude, this.longitude);
    // Afficher un message dans la div
    mapElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f0f0f0;color:#666;">📍 Coordonnées non disponibles</div>';
    return;
  }

  const L = (window as any).L;
  
  if (this.map) {
    this.map.remove();
  }
  
  try {
    this.map = L.map('viewer-map').setView([this.latitude, this.longitude], 14);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);
    
    L.marker([this.latitude, this.longitude]).addTo(this.map)
      .bindPopup(this.address || 'Emplacement')
      .openPopup();
      
    console.log('Carte initialisée avec succès');
  } catch (error) {
    console.error('Erreur initialisation carte:', error);
  }
}
  getGoogleMapsLink(): string {
    return `https://www.google.com/maps/search/?api=1&query=${this.latitude},${this.longitude}`;
  }
}