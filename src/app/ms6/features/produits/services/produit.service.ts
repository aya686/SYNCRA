import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produit, ProduitRequest } from '../models/produit.model';
import { Stock, StockRequest } from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllProduits(actif?: boolean, boutiqueId?: number): Observable<Produit[]> {
    let params = new HttpParams();
    if (actif !== undefined) {
      params = params.set('actif', actif.toString());
    }
    if (boutiqueId) {
      params = params.set('boutique', boutiqueId.toString());
    }
    return this.http.get<Produit[]>(`${this.apiUrl}/produits`, { params });
  }

  getProduitById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/produits/${id}`);
  }

  createProduit(request: ProduitRequest): Observable<Produit> {
    return this.http.post<Produit>(`${this.apiUrl}/produits`, request);
  }

  updateProduit(id: number, request: ProduitRequest): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/produits/${id}`, request);
  }

  archiveProduit(id: number): Observable<Produit> {
    return this.http.patch<Produit>(`${this.apiUrl}/produits/${id}/archive`, {});
  }

  unarchiveProduit(id: number): Observable<Produit> {
    return this.http.patch<Produit>(`${this.apiUrl}/produits/${id}/unarchive`, {});
  }

  deleteProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/produits/${id}`);
  }

  getStock(id: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiUrl}/produits/${id}/stock`);
  }

  updateStock(id: number, request: StockRequest): Observable<Stock> {
    return this.http.put<Stock>(`${this.apiUrl}/produits/${id}/stock`, request);
  }
}
