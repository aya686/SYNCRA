import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StockResume {
  totalProduits: number;
  stocksEnAlerte: number;
  stocksEpuises: number;
  stocksOk: number;
}

export interface Stock {
  stockId: number;
  quantite: number;
  seuilAlerte: number;
  entrepot: string;
  produit: {
    produitId: number;
    nom: string;
    boutique?: {
      nom: string;
    };
  };
}

export interface AlerteStock {
  alerteId: number;
  quantiteAvant: number;
  quantiteApres: number;
  seuilAlerte: number;
  type: 'STOCK_BAS' | 'STOCK_EPUIS' | 'RESTOCK' | 'STOCK_INSUFFISANT';
  emailEnvoye: boolean;
  dateAlerte: string;
  message: string;
  produit: {
    nom: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:8086/ms6/api';

  constructor(private http: HttpClient) {}

  // Récupérer le résumé des stocks
  getStockResume(): Observable<StockResume> {
    return this.http.get<StockResume>(`${this.apiUrl}/stocks/resume`);
  }

  // Récupérer les stocks en alerte
  getStocksEnAlerte(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/stocks/alertes`);
  }

  // Récupérer les stocks épuisés
  getStocksEpuises(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/stocks/epuises`);
  }

  // Récupérer les alertes récentes
  getAlertesRecentes(): Observable<AlerteStock[]> {
    return this.http.get<AlerteStock[]>(`${this.apiUrl}/stocks/alertes-recentes`);
  }

  // Modifier le seuil d'alerte
  updateSeuilAlerte(produitId: number, nouveauSeuil: number): Observable<Stock> {
    return this.http.put<Stock>(`${this.apiUrl}/stocks/${produitId}/seuil?nouveauSeuil=${nouveauSeuil}`, {});
  }

  // Réapprovisionner un stock
  reapprovisionner(produitId: number, quantite: number): Observable<Stock> {
    return this.http.put<Stock>(`${this.apiUrl}/stocks/${produitId}/reapprovisionner?quantite=${quantite}`, {});
  }

  // Tester l'envoi d'email
  testEmail(): Observable<string> {
    return this.http.post(`${this.apiUrl}/stocks/test-email`, {}, { responseType: 'text' });
  }
}
