import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DossierSante } from '../models/dossier-sante.model';

@Injectable({
  providedIn: 'root'
})
export class DossierSanteService {
  private apiUrl = '/api/dossier-sante';

  constructor(private http: HttpClient) {}

  findAll(): Observable<DossierSante[]> {
    return this.http.get<DossierSante[]>(this.apiUrl);
  }

  findById(id: number): Observable<DossierSante> {
    return this.http.get<DossierSante>(`${this.apiUrl}/${id}`);
  }

  create(data: DossierSante): Observable<DossierSante> {
    return this.http.post<DossierSante>(this.apiUrl, data);
  }

  update(id: number, data: DossierSante): Observable<DossierSante> {
    return this.http.put<DossierSante>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}