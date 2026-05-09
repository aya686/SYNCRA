import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Litige } from '../models/contrat.model';

@Injectable({
  providedIn: 'root'
})
export class LitigeService {
  private apiUrl = 'http://localhost:8085/api/litiges';

  constructor(private http: HttpClient) {}

  // Get all disputes (admin only)
  getAllLitiges(): Observable<Litige[]> {
    return this.http.get<Litige[]>(this.apiUrl);
  }

  // Get dispute by ID
  getLitigeById(id: number): Observable<Litige> {
    return this.http.get<Litige>(`${this.apiUrl}/${id}`);
  }

  // Get disputes for a specific contract
  getLitigesByContrat(contratId: number): Observable<Litige[]> {
    return this.http.get<Litige[]>(`${this.apiUrl}/contrat/${contratId}`);
  }

  // Get disputes by status
  getLitigesByStatut(statut: string): Observable<Litige[]> {
    return this.http.get<Litige[]>(`${this.apiUrl}/statut/${statut}`);
  }

  // Open dispute for a contract
  ouvrirLitige(contratId: number, litige: Litige): Observable<Litige> {
    return this.http.post<Litige>(`${this.apiUrl}/contrat/${contratId}`, litige);
  }

  // Admin takes charge of dispute
  prendreEnCharge(id: number, adminId: number): Observable<Litige> {
    return this.http.patch<Litige>(`${this.apiUrl}/${id}/prendre-en-charge`, { adminId });
  }

  // Resolve dispute
  resoudreLitige(id: number, decision: string, commentaire: string): Observable<Litige> {
    return this.http.patch<Litige>(`${this.apiUrl}/${id}/resoudre`, { decisionAdmin: decision, commentaireResolution: commentaire });
  }

  // Close dispute
  fermerLitige(id: number): Observable<Litige> {
    return this.http.patch<Litige>(`${this.apiUrl}/${id}/fermer`, {});
  }
}
