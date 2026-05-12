import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avancement } from '../models/avancement.model';
 import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AvancementService {
  private base = `${environment.projetsApi}/projets`;
  constructor(private http: HttpClient) {}
 
  getByProjet(projetId: number): Observable<Avancement> {
    return this.http.get<Avancement>(`${this.base}/${projetId}/avancement`);
  }
 
  recalculer(projetId: number): Observable<Avancement> {
    return this.http.post<Avancement>(`${this.base}/${projetId}/avancement/recalculer`, {});
  }
}