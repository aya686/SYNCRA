import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Commande, CommandeRequest, StatutUpdateRequest, Annulation, AnnulationRequest, PromoValidationResponse } from '../models/commande.model';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllCommandes(statut?: string, startDate?: string, endDate?: string): Observable<Commande[]> {
    let params = new HttpParams();
    if (statut) {
      params = params.set('statut', statut);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<Commande[]>(`${this.apiUrl}/commandes`, { params });
  }

  getCommandeById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/commandes/${id}`);
  }

  createCommande(request: CommandeRequest): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/commandes`, request);
  }

  updateStatut(id: number, request: StatutUpdateRequest): Observable<Commande> {
    return this.http.patch<Commande>(`${this.apiUrl}/commandes/${id}/statut`, request);
  }

  deleteCommande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/commandes/${id}`);
  }

  cancelCommande(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/commandes/${id}/cancel`, {});
  }

  createAnnulation(id: number, request: AnnulationRequest): Observable<Annulation> {
    return this.http.post<Annulation>(`${this.apiUrl}/commandes/${id}/annuler`, request);
  }

  getAnnulation(id: number): Observable<Annulation> {
    return this.http.get<Annulation>(`${this.apiUrl}/commandes/${id}/annulation`);
  }

  validatePromoCode(codePromo: string, montantTotal: number): Observable<PromoValidationResponse> {
    let params = new HttpParams()
      .set('codePromo', codePromo)
      .set('montantTotal', montantTotal.toString());
    return this.http.post<PromoValidationResponse>(`${this.apiUrl}/commandes/validate-promo`, null, { params });
  }
}
