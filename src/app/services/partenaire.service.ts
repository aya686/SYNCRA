import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partenaire } from '../models/investissement.model';

@Injectable({
  providedIn: 'root'
})
export class PartenaireService {
  private apiUrl = 'http://localhost:8085/api/partenaires';

  constructor(private http: HttpClient) {}

  getAllPartenaires(): Observable<Partenaire[]> {
    return this.http.get<Partenaire[]>(this.apiUrl);
  }

  getPartenaireById(id: number): Observable<Partenaire> {
    return this.http.get<Partenaire>(`${this.apiUrl}/${id}`);
  }

  createPartenaire(partenaire: Partenaire): Observable<Partenaire> {
    return this.http.post<Partenaire>(this.apiUrl, partenaire);
  }

  updatePartenaire(id: number, partenaire: Partenaire): Observable<Partenaire> {
    return this.http.put<Partenaire>(`${this.apiUrl}/${id}`, partenaire);
  }

  deletePartenaire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
