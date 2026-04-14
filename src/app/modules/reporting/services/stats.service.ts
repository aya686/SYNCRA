import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'http://localhost:8089/event_db/api';

  constructor(private http: HttpClient) {}

  // Statistiques de participation
  getParticipationStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/participation`);
  }

  // Évolution des inscriptions (par période)
  getEvolutionStats(period: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/evolution?period=${period}`);
  }

  // Statistiques par type d'événement
  getStatsByType(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/by-type`);
  }

  // Statistiques globales (dashboard)
  getGlobalStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/global`);
  }
}