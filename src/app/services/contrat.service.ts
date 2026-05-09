import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contrat } from '../models/contrat.model';

@Injectable({
  providedIn: 'root'
})
export class ContratService {
  private apiUrl = 'http://localhost:8085/api/contrats';

  constructor(private http: HttpClient) {}

  // Get all contracts (admin only)
  getAllContrats(): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(this.apiUrl);
  }

  // Get contract by ID
  getContratById(id: number): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.apiUrl}/${id}`);
  }

  // Get contracts for a specific user
  getContratsByUser(userId: number): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Get contracts by status
  getContratsByStatut(statut: string): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/statut/${statut}`);
  }

  // Create contract manually
  createContrat(contrat: Contrat): Observable<Contrat> {
    return this.http.post<Contrat>(this.apiUrl, contrat);
  }

  // Generate contract automatically from candidature
  genererContrat(candidatureId: number): Observable<Contrat> {
    return this.http.post<Contrat>(`${this.apiUrl}/generer`, { candidatureId });
  }

  // Update contract
  updateContrat(id: number, contrat: Contrat): Observable<Contrat> {
    return this.http.put<Contrat>(`${this.apiUrl}/${id}`, contrat);
  }

  // Sign contract
  signerContrat(id: number, userId: number, signatureImage?: string): Observable<Contrat> {
    return this.http.patch<Contrat>(`${this.apiUrl}/${id}/signer`, { userId, signatureImage });
  }

  // Terminate contract
  terminerContrat(id: number): Observable<Contrat> {
    return this.http.patch<Contrat>(`${this.apiUrl}/${id}/terminer`, {});
  }

  // Rescind contract
  resilierContrat(id: number): Observable<Contrat> {
    return this.http.patch<Contrat>(`${this.apiUrl}/${id}/resilier`, {});
  }
}
