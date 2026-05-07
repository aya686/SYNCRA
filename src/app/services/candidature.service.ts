import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidature, StatutCandidature } from '../models/candidature.model';

@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private apiUrl = 'http://localhost:8085/api/candidatures';

  constructor(private http: HttpClient) {}

  // GET toutes les candidatures (admin)
  getAllCandidatures(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(this.apiUrl);
  }

  // GET une candidature par ID
  getCandidatureById(id: number): Observable<Candidature> {
    return this.http.get<Candidature>(`${this.apiUrl}/${id}`);
  }

  // GET mes candidatures
  getMesCandidatures(candidatId: number): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/candidat/${candidatId}`);
  }

  // GET candidatures d'une offre
  getCandidaturesByOffre(offreId: number): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/offre/${offreId}`);
  }

  // GET compter candidatures d'une offre
  countByOffre(offreId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/offre/${offreId}/count`);
  }

  // POST soumettre une candidature
  soumettreCandidature(offreId: number, candidature: Candidature): Observable<Candidature> {
    return this.http.post<Candidature>(`${this.apiUrl}/offre/${offreId}`, candidature);
  }

  // PATCH accepter une candidature
  accepterCandidature(id: number): Observable<Candidature> {
    return this.http.patch<Candidature>(`${this.apiUrl}/${id}/accepter`, {});
  }

  // PATCH refuser une candidature
  refuserCandidature(id: number): Observable<Candidature> {
    return this.http.patch<Candidature>(`${this.apiUrl}/${id}/refuser`, {});
  }

  // PATCH mettre en shortlist
  mettreEnShortlist(id: number): Observable<Candidature> {
    return this.http.patch<Candidature>(`${this.apiUrl}/${id}/shortlist`, {});
  }

  // Helper: label du statut
  getStatutLabel(statut: StatutCandidature): string {
    const labels: Record<StatutCandidature, string> = {
      EN_ATTENTE: 'En attente',
      EN_REVISION: 'En révision',
      SHORTLIST: 'Shortlist',
      ACCEPTEE: 'Acceptée',
      REFUSEE: 'Refusée'
    };
    return labels[statut] || statut;
  }

  // Helper: classe du badge
  getStatutBadgeClass(statut: StatutCandidature): string {
    const classes: Record<StatutCandidature, string> = {
      EN_ATTENTE: 'badge-warning',
      EN_REVISION: 'badge-info',
      SHORTLIST: 'badge-primary',
      ACCEPTEE: 'badge-success',
      REFUSEE: 'badge-danger'
    };
    return classes[statut] || 'badge-secondary';
  }
}
