import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { EventApi, EventDisplay, Inscription, convertApiToEventDisplay } from '../../shared/models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:8089/event_db/api/events';
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

// src/app/modules/events/services/event.service.ts

// src/app/modules/events/services/event.service.ts

getEvents(): Observable<EventDisplay[]> {
  return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() })
    .pipe(
      map(events => {
        console.log('=== PREMIER ÉVÉNEMENT API ===');
        console.log('Structure brute:', events[0]);
        console.log('Clés disponibles:', Object.keys(events[0]));
        
        return events.map(event => convertApiToEventDisplay(event));
      })
    );
}

getEvent(id: number): Observable<EventDisplay> {
  return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
    .pipe(
      map(event => convertApiToEventDisplay(event))
    );
}

  // src/app/modules/events/services/event.service.ts

createEvent(eventData: any): Observable<EventDisplay> {
  console.log('=== createEvent - Données reçues ===', eventData);
  
  const eventToSend = {
    titre: eventData.titre,
    description: eventData.description || '',  // ✅ AJOUTER CETTE LIGNE
    type: eventData.type,
    lieu: eventData.lieu,
    dateHeure: eventData.dateDebut ? new Date(eventData.dateDebut).toISOString() : new Date().toISOString(),
    dateFin: eventData.dateFin ? new Date(eventData.dateFin).toISOString() : null,
    capacite: Number(eventData.capaciteMax),
    prix: Number(eventData.prix) || 0,
    statut: eventData.statut || 'planifie',
    latitude: eventData.latitude ? Number(eventData.latitude) : null,
    longitude: eventData.longitude ? Number(eventData.longitude) : null,
    imageUrl: eventData.imageUrl || null  // ✅ AJOUTER CETTE LIGNE
  };
  
  console.log('Données envoyées à l\'API:', eventToSend);
  
  return this.http.post<EventApi>(this.apiUrl, eventToSend, { headers: this.getHeaders() })
    .pipe(
      map(created => {
        console.log('Réponse API:', created);
        return convertApiToEventDisplay(created);
      })
    );
}

updateEvent(id: number, eventData: any): Observable<EventDisplay> {
  const eventToSend = {
    titre: eventData.titre,
    description: eventData.description || '',  // ✅ AJOUTER CETTE LIGNE
    type: eventData.type,
    lieu: eventData.lieu,
    dateHeure: eventData.dateDebut ? new Date(eventData.dateDebut).toISOString() : new Date().toISOString(),
    dateFin: eventData.dateFin ? new Date(eventData.dateFin).toISOString() : null,
    capacite: Number(eventData.capaciteMax),
    prix: Number(eventData.prix) || 0,
    statut: eventData.statut,
    latitude: eventData.latitude ? Number(eventData.latitude) : null,
    longitude: eventData.longitude ? Number(eventData.longitude) : null,
    imageUrl: eventData.imageUrl || null  // ✅ AJOUTER CETTE LIGNE
  };
  
  console.log('Données mises à jour:', eventToSend);
  
  return this.http.put<EventApi>(`${this.apiUrl}/${id}`, eventToSend, { headers: this.getHeaders() })
    .pipe(
      map(updated => convertApiToEventDisplay(updated))
    );
}
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getInscriptions(eventId: number): Observable<Inscription[]> {
    // À implémenter quand vous aurez l'endpoint
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  inscrireParticipant(inscription: Inscription): Observable<Inscription> {
    // À implémenter quand vous aurez l'endpoint
    return new Observable(observer => {
      observer.next(inscription);
      observer.complete();
    });
  }

  updatePresence(inscriptionId: number, presence: boolean): Observable<Inscription> {
    // À implémenter quand vous aurez l'endpoint
    return new Observable(observer => {
      observer.next({} as Inscription);
      observer.complete();
    });
  }
}