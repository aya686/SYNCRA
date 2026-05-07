import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Investisseur } from '../models/investissement.model';

@Injectable({
  providedIn: 'root'
})
export class InvestisseurService {
  private apiUrl = 'http://localhost:8085/api/investisseurs';

  constructor(private http: HttpClient) {}

  getAllInvestisseurs(): Observable<Investisseur[]> {
    return this.http.get<Investisseur[]>(this.apiUrl);
  }

  getInvestisseurById(id: number): Observable<Investisseur> {
    return this.http.get<Investisseur>(`${this.apiUrl}/${id}`);
  }

  getInvestisseurByUserId(userId: number): Observable<Investisseur> {
    return this.http.get<Investisseur>(`${this.apiUrl}/user/${userId}`);
  }

  createInvestisseur(investisseur: Investisseur): Observable<Investisseur> {
    return this.http.post<Investisseur>(this.apiUrl, investisseur);
  }

  updateInvestisseur(id: number, investisseur: Investisseur): Observable<Investisseur> {
    return this.http.put<Investisseur>(`${this.apiUrl}/${id}`, investisseur);
  }

  verifierInvestisseur(id: number): Observable<Investisseur> {
    return this.http.patch<Investisseur>(`${this.apiUrl}/${id}/verifier`, {});
  }
}
