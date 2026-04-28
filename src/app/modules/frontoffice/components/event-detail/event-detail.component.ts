import { Component, OnInit, AfterViewInit  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicEventService } from '../../services/public-event.service';
import { MapViewerComponent } from './map-viewer.component';
import { SimilarityEngineService, SimilarItem } from '../../services/similarity-engine.service';
import { PopularityForecastService, ForecastResult } from '../../services/popularity-forecast.service';
import { FavoritesService } from '../../../shared/services/favorites.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit, AfterViewInit  {
  event: any = null;
  loading = true;
  similarEvents: SimilarItem[] = [];
  forecast: ForecastResult | null = null;
  isFavorite = false;
  constructor(
    private route: ActivatedRoute,
    private eventService: PublicEventService,
    
  ) {}
    ngAfterViewInit(): void {
    // Forcer le scroll en haut après le rendu complet
    window.scrollTo(0, 0);
  }


  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadEvent(id);
  }

  loadEvent(id: number): void {
    this.loading = true;
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        console.log('=== ÉVÉNEMENT CHARGÉ ===');
        console.log('Latitude:', event.latitude);
        console.log('Longitude:', event.longitude);
        console.log('Date fin:', event.dateFin);
        
        this.event = {
          ...event,
          latitude: event.latitude || null,
          longitude: event.longitude || null,
          dateFin: event.dateFin || event.dateDebut
        };
        this.loading = false;
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }
 isSameDay(): boolean {
    if (!this.event?.dateDebut || !this.event?.dateFin) return false;
    const debut = new Date(this.event.dateDebut);
    const fin = new Date(this.event.dateFin);
    return debut.toDateString() === fin.toDateString();
  }
}