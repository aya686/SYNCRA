import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionTravail } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private base = '/api/sessions';
  constructor(private http: HttpClient) {}

  getByTache(tacheId: number): Observable<SessionTravail[]> {
    return this.http.get<SessionTravail[]>(`${this.base}/tache/${tacheId}`);
  }

 demarrer(tacheId: number, utilisateurId: number, niveauCharge: number): Observable<SessionTravail> {
  return this.http.post<SessionTravail>(this.base, {
    tacheId,
    utilisateurId,
    niveauCharge
  });
}

  terminer(id: number): Observable<SessionTravail> {
    return this.http.patch<SessionTravail>(`${this.base}/${id}/terminer`, {});
  }
  getByUtilisateur(userId: number): Observable<SessionTravail[]> {
  return this.http.get<SessionTravail[]>(`${this.base}/utilisateur/${userId}`);
}
}