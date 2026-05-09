// src/app/modules/frontoffice/services/public-event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface PublicEvent {
  id: number;
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  lieu: string;
  capaciteMax: number;
  placesDisponibles: number;
  type: string;
  prix: number;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  populariteReelle?: number;
  nbInscrits?: number;
}

@Injectable({ providedIn: 'root' })
export class PublicEventService {
  private apiUrl = 'http://localhost:8089/event_db/api/events';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<PublicEvent[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      switchMap(events => {
        if (!events || events.length === 0) return of([]);
        
        const eventsWithPopularity$ = events.map(event =>
          this.getEventPopularity(event.evenementId).pipe(
            map(popData => this.mapEventWithPopularity(event, popData))
          )
        );
        
        return forkJoin(eventsWithPopularity$);
      })
    );
  }

  getEvent(id: number): Observable<PublicEvent> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      switchMap(event =>
        this.getEventPopularity(id).pipe(
          map(popData => this.mapEventWithPopularity(event, popData))
        )
      )
    );
  }

  getEventPopularity(eventId: number): Observable<{ popularite: number; nbInscrits: number }> {
    return this.http.get<{ popularite: number; nbInscrits: number; capacite: number }>(
      `${this.apiUrl}/${eventId}/popularite`
    ).pipe(
      map(response => ({
        popularite: response.popularite || 0,
        nbInscrits: response.nbInscrits || 0
      }))
    );
  }

  private mapEventWithPopularity(rawEvent: any, popData: { popularite: number; nbInscrits: number }): PublicEvent {
    const capacite = rawEvent.capacite || 0;
    const nbInscrits = popData.nbInscrits || 0;
    
    return {
      id: rawEvent.evenementId,
      titre: rawEvent.titre,
      description: rawEvent.description || `Découvrez ${rawEvent.titre}`,
      dateDebut: new Date(rawEvent.dateHeure),
      dateFin: rawEvent.dateFin ? new Date(rawEvent.dateFin) : new Date(rawEvent.dateHeure),
      lieu: rawEvent.lieu || 'En ligne',
      capaciteMax: capacite,
      placesDisponibles: capacite - nbInscrits,
      type: rawEvent.type || 'Conference',
      prix: rawEvent.prix || 0,
      latitude: rawEvent.latitude,
      longitude: rawEvent.longitude,
      imageUrl: rawEvent.imageUrl || null,
      populariteReelle: Math.min(1, Math.max(0, popData.popularite)),
      nbInscrits: nbInscrits
    };
  }
}