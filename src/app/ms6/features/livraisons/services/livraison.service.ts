import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Livraison, LivraisonRequest, LivraisonUpdateRequest, Retour, RetourRequest, Remboursement, RemboursementRequest } from '../models/livraison.model';

@Injectable({
  providedIn: 'root'
})
export class LivraisonService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllLivraisons(): Observable<Livraison[]> {
    return this.http.get<Livraison[]>(`${this.apiUrl}/livraisons`);
  }

  getLivraisonById(id: number): Observable<Livraison> {
    return this.http.get<Livraison>(`${this.apiUrl}/livraisons/${id}`);
  }

  createLivraison(request: LivraisonRequest): Observable<Livraison> {
    return this.http.post<Livraison>(`${this.apiUrl}/livraisons`, request);
  }

  updateLivraison(id: number, request: LivraisonUpdateRequest): Observable<Livraison> {
    return this.http.put<Livraison>(`${this.apiUrl}/livraisons/${id}`, request);
  }

  deleteLivraison(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/livraisons/${id}`);
  }

  updateLivraisonStatut(id: number, statut: string): Observable<Livraison> {
    let params = new HttpParams().set('statut', statut);
    return this.http.patch<Livraison>(`${this.apiUrl}/livraisons/${id}/statut`, {}, { params });
  }

  // Retours
  getRetoursByLivraison(id: number): Observable<Retour[]> {
    return this.http.get<Retour[]>(`${this.apiUrl}/livraisons/${id}/retours`);
  }

  initiateRetour(id: number, request: RetourRequest): Observable<Retour> {
    return this.http.post<Retour>(`${this.apiUrl}/livraisons/${id}/retours`, request);
  }

  getRetourById(id: number): Observable<Retour> {
    return this.http.get<Retour>(`${this.apiUrl}/retours/${id}`);
  }

  updateRetourStatut(id: number, statut: string): Observable<Retour> {
    let params = new HttpParams().set('statut', statut);
    return this.http.patch<Retour>(`${this.apiUrl}/retours/${id}/statut`, {}, { params });
  }

  // Remboursements
  createRemboursement(retourId: number, request: RemboursementRequest): Observable<Remboursement> {
    return this.http.post<Remboursement>(`${this.apiUrl}/retours/${retourId}/remboursement`, request);
  }

  getRemboursement(retourId: number): Observable<Remboursement> {
    return this.http.get<Remboursement>(`${this.apiUrl}/retours/${retourId}/remboursement`);
  }
}
