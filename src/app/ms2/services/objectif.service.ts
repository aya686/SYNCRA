import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Objectif } from '../models/objectif.model';
 import { environment } from 'src/environments/environment';
 
@Injectable({ providedIn: 'root' })
export class ObjectifService {
  private base = `${environment.projetsApi}/objectifs`;
  constructor(private http: HttpClient) {}
 
  getByProjet(projetId: number): Observable<Objectif[]> {
    return this.http.get<Objectif[]>(`${this.base}/projet/${projetId}`);
  }
 
  updateAtteint(id: number, atteint: boolean): Observable<Objectif> {
    return this.http.patch<Objectif>(`${this.base}/${id}/atteint`, { atteint });
  }
}