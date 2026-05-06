import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet, Avancement } from '../models/projet.model';

@Injectable({ providedIn: 'root' })
export class ProjetService {
  private base = '/api/projets';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Projet[]> {
    return this.http.get<Projet[]>(this.base);
  }

  getByPorteur(porteurId: number): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.base}/porteur/${porteurId}`);
  }

  getById(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.base}/${id}`);
  }

  create(projet: Projet): Observable<Projet> {
    return this.http.post<Projet>(this.base, projet);
  }

  update(id: number, projet: Projet): Observable<Projet> {
    return this.http.put<Projet>(`${this.base}/${id}`, projet);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  archiver(id: number): Observable<Projet> {
    return this.http.patch<Projet>(`${this.base}/${id}/archiver`, {});
  }

 getAvancement(projetId: number): Observable<Avancement> {
  return this.http.get<Avancement>(`${this.base}/${projetId}/avancement`);
}

  recalculerAvancement(projetId: number): Observable<Avancement> {
    return this.http.post<Avancement>(`${this.base}/${projetId}/recalculer-avancement`, {});
  }
  assignerMoniteur(projetId: number, moniteurId: number): Observable<Projet> {
  return this.http.patch<Projet>(
    `${this.base}/${projetId}/assigner-moniteur?moniteurId=${moniteurId}`, {});
}

getProjetsMoniteur(moniteurId: number): Observable<Projet[]> {
  return this.http.get<Projet[]>(`${this.base}/moniteur/${moniteurId}`);
}
}