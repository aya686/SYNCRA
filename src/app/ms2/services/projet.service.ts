import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet, Avancement } from '../models/projet.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjetService {
private apiUrl = `${environment.projetsApi}/projets`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Projet[]> {
    return this.http.get<Projet[]>(this.apiUrl);
  }

  getByPorteur(porteurId: number): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.apiUrl}/porteur/${porteurId}`);
  }

  getById(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.apiUrl}/${id}`);
  }

  create(projet: Projet): Observable<Projet> {
    return this.http.post<Projet>(this.apiUrl, projet);
  }

  update(id: number, projet: Projet): Observable<Projet> {
    return this.http.put<Projet>(`${this.apiUrl}/${id}`, projet);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  archiver(id: number): Observable<Projet> {
    return this.http.patch<Projet>(`${this.apiUrl}/${id}/archiver`, {});
  }

 getAvancement(projetId: number): Observable<Avancement> {
  return this.http.get<Avancement>(`${this.apiUrl}/${projetId}/avancement`);
}

  recalculerAvancement(projetId: number): Observable<Avancement> {
    return this.http.post<Avancement>(`${this.apiUrl}/${projetId}/recalculer-avancement`, {});
  }
  assignerMoniteur(projetId: number, moniteurId: number): Observable<Projet> {
  return this.http.patch<Projet>(
    `${this.apiUrl}/${projetId}/assigner-moniteur?moniteurId=${moniteurId}`, {});
}

getProjetsMoniteur(moniteurId: number): Observable<Projet[]> {
  return this.http.get<Projet[]>(`${this.apiUrl}/moniteur/${moniteurId}`);
}
}