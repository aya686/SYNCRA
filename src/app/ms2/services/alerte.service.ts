import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alerte, AnalyseIA } from '../models/alerte.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AlerteService {
  private base = `${environment.projetsApi}/alertes`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Alerte[]> {
    return this.http.get<Alerte[]>(this.base);
  }

  getByUtilisateur(userId: number): Observable<Alerte[]> {
    return this.http.get<Alerte[]>(`${this.base}/utilisateur/${userId}`);
  }

  getByProjet(projetId: number): Observable<Alerte[]> {
    return this.http.get<Alerte[]>(`${this.base}/projet/${projetId}`);
  }

  getNonTraitees(userId: number): Observable<Alerte[]> {
    return this.http.get<Alerte[]>(`${this.base}/utilisateur/${userId}/non-traitees`);
  }

  getAlerteBloquante(userId: number): Observable<Alerte> {
    return this.http.get<Alerte>(`${this.base}/utilisateur/${userId}/bloquante`);
  }

  marquerTraitee(id: number): Observable<Alerte> {
    return this.http.patch<Alerte>(`${this.base}/${id}/traiter`, {});
  }

  analyserIA(id: number): Observable<AnalyseIA> {
    return this.http.post<AnalyseIA>(`${this.base}/${id}/analyser-ia`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}