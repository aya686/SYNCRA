import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Jalon } from '../models/jalon.model';
 
@Injectable({ providedIn: 'root' })
export class JalonService {
  private base = '/api/jalons';
  constructor(private http: HttpClient) {}
 
  getByProjet(projetId: number): Observable<Jalon[]> {
    return this.http.get<Jalon[]>(`${this.base}/projet/${projetId}`);
  }
 
  updateAtteint(id: number, atteint: boolean): Observable<Jalon> {
    return this.http.patch<Jalon>(`${this.base}/${id}/atteint`, { atteint });
  }
}