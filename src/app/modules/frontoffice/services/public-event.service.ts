import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
  latitude?: number;      // ← AJOUTER
  longitude?: number; 
  imageUrl?: string;    // ← AJOUTER
}

@Injectable({
  providedIn: 'root'
})
export class PublicEventService {
  private apiUrl = 'http://localhost:8089/event_db/api/events';
  imageUrl?: string;

  constructor(private http: HttpClient) {}

  getEvents(): Observable<PublicEvent[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(events => events.map(e => ({
        id: e.evenementId,
        titre: e.titre,
        description: e.description || `Découvrez ${e.titre}`,
        dateDebut: new Date(e.dateHeure),
        dateFin: e.dateFin ? new Date(e.dateFin) : new Date(e.dateHeure),
        lieu: e.lieu,
        capaciteMax: e.capacite,
        placesDisponibles: e.capacite - (e.nbInscrits || 0),
        type: e.type,
        prix: e.prix || 0,
        latitude: e.latitude,      // ← AJOUTER
        longitude: e.longitude,     // ← AJOUTER
        imageUrl: e.imageUrl || null
        
        

      })))
    );
  }

  getEvent(id: number): Observable<PublicEvent> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(e => ({
        id: e.evenementId,
        titre: e.titre,
        description: e.description || `Découvrez ${e.titre}`,
        dateDebut: new Date(e.dateHeure),
        dateFin: e.dateFin ? new Date(e.dateFin) : new Date(e.dateHeure),
        lieu: e.lieu,
        capaciteMax: e.capacite,
        placesDisponibles: e.capacite - (e.nbInscrits || 0),
        type: e.type,
        prix: e.prix || 0,
        latitude: e.latitude,      // ← AJOUTER
        longitude: e.longitude     // ← AJOUTER
      }))
    );
  }
}