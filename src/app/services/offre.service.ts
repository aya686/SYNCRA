import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Offre, OffreFilter, StatutOffre } from '../models/offre.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OffreService {
  private apiUrl = `${environment.apiUrl}/offres`;

  constructor(private http: HttpClient) {}

  getAllOffres(): Observable<Offre[]> {
    return this.http.get<Offre[]>(this.apiUrl);
  }

  getActiveOffres(): Observable<Offre[]> {
    return this.http.get<Offre[]>(`${this.apiUrl}/active`);
  }

  getOffreById(id: number): Observable<Offre> {
    return this.http.get<Offre>(`${this.apiUrl}/${id}`);
  }

  getOffresByPublieur(publieurId: number): Observable<Offre[]> {
    return this.http.get<Offre[]>(`${this.apiUrl}/publieur/${publieurId}`);
  }

  searchOffres(filter: OffreFilter): Observable<Offre[]> {
    return this.http.post<Offre[]>(`${this.apiUrl}/search`, filter);
  }

  createOffre(offre: Offre): Observable<Offre> {
    return this.http.post<Offre>(this.apiUrl, offre);
  }

  updateOffre(id: number, offre: Offre): Observable<Offre> {
    return this.http.put<Offre>(`${this.apiUrl}/${id}`, offre);
  }

  updateStatut(id: number, statut: StatutOffre): Observable<Offre> {
    return this.http.patch<Offre>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  publierOffre(id: number): Observable<Offre> {
    return this.http.post<Offre>(`${this.apiUrl}/${id}/publier`, {});
  }

  cloturerOffre(id: number): Observable<Offre> {
    return this.http.post<Offre>(`${this.apiUrl}/${id}/cloturer`, {});
  }

  deleteOffre(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStatutLabel(statut: StatutOffre): string {
    const labels: { [key in StatutOffre]: string } = {
      [StatutOffre.BROUILLON]: 'Brouillon',
      [StatutOffre.ACTIVE]: 'Active',
      [StatutOffre.CLOTUREE]: 'Clôturée',
      [StatutOffre.ARCHIVEE]: 'Archivée',
      [StatutOffre.SUSPENDUE]: 'Suspendue'
    };
    return labels[statut] || statut;
  }

  getStatutBadgeClass(statut: StatutOffre): string {
    const classes: { [key in StatutOffre]: string } = {
      [StatutOffre.BROUILLON]: 'badge bg-secondary',
      [StatutOffre.ACTIVE]: 'badge bg-success',
      [StatutOffre.CLOTUREE]: 'badge bg-warning',
      [StatutOffre.ARCHIVEE]: 'badge bg-dark',
      [StatutOffre.SUSPENDUE]: 'badge bg-danger'
    };
    return classes[statut] || 'badge bg-light';
  }
}
