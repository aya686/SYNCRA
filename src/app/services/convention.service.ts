import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Convention } from '../models/investissement.model';

@Injectable({
  providedIn: 'root'
})
export class ConventionService {
  private apiUrl = 'http://localhost:8085/api/conventions';

  constructor(private http: HttpClient) {}

  getAllConventions(): Observable<Convention[]> {
    return this.http.get<Convention[]>(this.apiUrl);
  }

  getConventionById(id: number): Observable<Convention> {
    return this.http.get<Convention>(`${this.apiUrl}/${id}`);
  }

  getConventionsByInvestisseur(investisseurId: number): Observable<Convention[]> {
    return this.http.get<Convention[]>(`${this.apiUrl}/investisseur/${investisseurId}`);
  }

  getConventionsByProjet(projetId: number): Observable<Convention[]> {
    return this.http.get<Convention[]>(`${this.apiUrl}/projet/${projetId}`);
  }

  getConventionsByStatut(statut: string): Observable<Convention[]> {
    return this.http.get<Convention[]>(`${this.apiUrl}/statut/${statut}`);
  }

  createConvention(convention: Convention): Observable<Convention> {
    return this.http.post<Convention>(this.apiUrl, convention);
  }

  signerConvention(id: number): Observable<Convention> {
    return this.http.patch<Convention>(`${this.apiUrl}/${id}/signer`, {});
  }

  resilierConvention(id: number): Observable<Convention> {
    return this.http.patch<Convention>(`${this.apiUrl}/${id}/resilier`, {});
  }
}
