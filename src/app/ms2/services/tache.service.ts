import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tache, StatutTache, SousTache } from '../models/tache.model';
 
@Injectable({ providedIn: 'root' })
export class TacheService {
  private base = '/api/taches';
  constructor(private http: HttpClient) {}
 
  getByProjet(projetId: number): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.base}/projet/${projetId}`);
  }
 
  getById(id: number): Observable<Tache> {
    return this.http.get<Tache>(`${this.base}/${id}`);
  }
 
  updateStatut(id: number, statut: StatutTache): Observable<Tache> {
  return this.http.patch<Tache>(
    `${this.base}/${id}/statut`,
    null,
    { params: { statut } }
  );
}
 getSousTaches(tacheId: number): Observable<SousTache[]> {
  return this.http.get<SousTache[]>(`${this.base}/${tacheId}/sous-taches`);
}

updateStatutSousTache(id: number, statut: StatutTache): Observable<SousTache> {
  return this.http.patch<SousTache>(`/api/taches/sous-taches/${id}/statut?statut=${statut}`, {});
}
 
  update(id: number, tache: Partial<Tache>): Observable<Tache> {
    return this.http.put<Tache>(`${this.base}/${id}`, tache);
  }
}