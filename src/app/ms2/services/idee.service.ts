import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Idee } from '../models/idee.model';
import { Projet } from '../models/projet.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class IdeeService {
  private base = `${environment.projetsApi}/idees`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Idee[]> {
    return this.http.get<Idee[]>(this.base);
  }

  getByAuteur(auteurId: number): Observable<Idee[]> {
    return this.http.get<Idee[]>(`${this.base}/auteur/${auteurId}`);
  }

  create(idee: Partial<Idee>): Observable<Idee> {
    return this.http.post<Idee>(this.base, idee);
  }

  update(id: number, idee: Partial<Idee>): Observable<Idee> {
    return this.http.put<Idee>(`${this.base}/${id}`, idee);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  valider(id: number): Observable<Idee> {
    return this.http.put<Idee>(`${this.base}/${id}`, {
      statut: 'ACCEPTEE'
    } as Partial<Idee>);
  }

  rejeter(id: number): Observable<Idee> {
    return this.http.put<Idee>(`${this.base}/${id}`, {
      statut: 'REJETEE'
    } as Partial<Idee>);
  }

transformerEnProjet(ideeId: number, projet: any): Observable<{idee: Idee, projet: any}> {
    return this.http.post<{idee: Idee, projet: any}>(
        `${this.base}/${ideeId}/transformer`, projet
    );
}
}