// src/app/modules/frontoffice/components/favorites-list/favorites-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FavoritesService } from '../../../shared/services/favorites.service';
import { PublicEventService, PublicEvent } from '../../services/public-event.service';
import { DataCollectorService } from '../../../shared/services/data-collector.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
    selector: 'app-favorites-list',
    templateUrl: './favorites-list.component.html',
    styleUrls: ['./favorites-list.component.scss'],
    standalone: false
})
export class FavoritesListComponent implements OnInit {
  favoriteEvents: PublicEvent[] = [];  // ✅ Utiliser le bon type
  loading = true;

  constructor(
    private favoritesService: FavoritesService,
    private eventService: PublicEventService,
    private dataCollector: DataCollectorService,  // ✅ AJOUTER
    private authService: AuthService              // ✅ AJOUTER
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.loading = true;
    
    const favoriteIds = this.favoritesService.getFavoriteEventIds();
    
    if (favoriteIds.length === 0) {
      this.favoriteEvents = [];
      this.loading = false;
      return;
    }
    
    const promises = favoriteIds.map(id => 
      this.eventService.getEvent(id).toPromise()
    );
    
    Promise.all(promises).then(events => {
      this.favoriteEvents = events.filter(e => e) as PublicEvent[];
      this.loading = false;
    }).catch(err => {
      console.error('Erreur:', err);
      this.loading = false;
    });
  }

  removeFavorite(eventId: number) {
    const favoriteId = this.favoritesService.getFavoriteId(eventId);
    if (favoriteId) {
      this.favoritesService.removeFavorite(favoriteId).subscribe(() => {
        this.favoriteEvents = this.favoriteEvents.filter(e => e.id !== eventId);
      });
    }
  }

  getFavoriteId(eventId: number): number | null {
    return this.favoritesService.getFavoriteId(eventId);
  }
}