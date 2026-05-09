// src/app/modules/frontoffice/services/heatmap.service.ts
import { Injectable } from '@angular/core';
import { PublicEventService, PublicEvent } from './public-event.service';

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  eventId?: number;
  titre?: string;
}

export interface HeatmapConfig {
  radius: number;      // Rayon d'influence en pixels
  blur: number;        // Flou
  minOpacity: number;
  maxOpacity: number;
  gradient: { [key: number]: string };
}

@Injectable({ providedIn: 'root' })
export class HeatmapService {
  constructor(private eventService: PublicEventService) {}

  /**
   * Calcule la densité des événements par région (Kernel Density Estimation)
   * Formule: f(x) = (1/n) * Σ K((x - xi) / h)
   */
  calculateEventDensity(events: PublicEvent[], bandwidth: number = 0.5): HeatmapPoint[] {
    if (!events || events.length === 0) return [];
    
    // Filtrer les événements avec coordonnées
    const eventsWithCoords = events.filter(e => e.latitude && e.longitude);
    if (eventsWithCoords.length === 0) return [];
    
    const points: HeatmapPoint[] = [];
    
    // Pour chaque événement, calculer sa contribution à la densité locale
    for (const event of eventsWithCoords) {
      // Compter les événements à proximité
      let nearbyCount = 0;
      for (const other of eventsWithCoords) {
        if (event.id === other.id) continue;
        const distance = this.haversineDistance(
          event.latitude!, event.longitude!,
          other.latitude!, other.longitude!
        );
        if (distance < bandwidth * 100) {
          nearbyCount++;
        }
      }
      
      // Intensité basée sur le nombre d'événements proches + popularité
      const popularityFactor = 1 - (event.placesDisponibles / event.capaciteMax);
      const intensity = Math.min(1, (nearbyCount / 5) * 0.5 + popularityFactor * 0.5);
      
      points.push({
        lat: event.latitude!,
        lng: event.longitude!,
        intensity: Math.max(0.1, Math.min(1, intensity)),
        eventId: event.id,
        titre: event.titre
      });
    }
    
    return points;
  }

  /**
   * Distance de Haversine (calcul précis entre coordonnées GPS)
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Configuration par défaut pour Leaflet.heat
   */
  getDefaultHeatmapConfig(): HeatmapConfig {
    return {
      radius: 25,
      blur: 15,
      minOpacity: 0.3,
      maxOpacity: 0.8,
      gradient: {
        0.2: '#00c2d4',   // Cyan (faible densité)
        0.4: '#0a6ebd',   // Bleu (moyenne)
        0.6: '#5E35B1',   // Violet (haute)
        0.8: '#e74c3c',   // Rouge (très haute)
        1.0: '#ff0000'     // Rouge intense (maximum)
      }
    };
  }

  /**
   * Convertit les points pour Leaflet.heat
   */
  toLeafletFormat(points: HeatmapPoint[]): [number, number, number][] {
    return points.map(p => [p.lat, p.lng, p.intensity]);
  }

  /**
   * Calcule les zones chaudes (clustering géographique)
   * Regroupe les événements proches
   */
  findHotspots(events: PublicEvent[], minClusterSize: number = 2): Array<{
    center: { lat: number; lng: number };
    events: PublicEvent[];
    intensity: number;
    radius: number;
  }> {
    const eventsWithCoords = events.filter(e => e.latitude && e.longitude);
    const clusters: Array<{ events: PublicEvent[]; center: { lat: number; lng: number } }> = [];
    
    for (const event of eventsWithCoords) {
      let added = false;
      
      for (const cluster of clusters) {
        const distance = this.haversineDistance(
          event.latitude!, event.longitude!,
          cluster.center.lat, cluster.center.lng
        );
        
        if (distance < 10) { // 10km de rayon
          cluster.events.push(event);
          // Recalculer le centre
          const avgLat = cluster.events.reduce((sum, e) => sum + e.latitude!, 0) / cluster.events.length;
          const avgLng = cluster.events.reduce((sum, e) => sum + e.longitude!, 0) / cluster.events.length;
          cluster.center = { lat: avgLat, lng: avgLng };
          added = true;
          break;
        }
      }
      
      if (!added) {
        clusters.push({
          events: [event],
          center: { lat: event.latitude!, lng: event.longitude! }
        });
      }
    }
    
    return clusters
      .filter(c => c.events.length >= minClusterSize)
      .map(c => ({
        center: c.center,
        events: c.events,
        intensity: Math.min(1, c.events.length / 10),
        radius: 5 + Math.min(15, c.events.length * 2)
      }));
  }
}