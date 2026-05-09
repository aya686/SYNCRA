import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paiement, Transaction, Facture, Echeance, Commission, StatutPaiement, TypeTransaction } from '../models/paiement.model';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private apiUrl = 'http://localhost:8085/api/paiements';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // ═══════════════════════════════════════════
  // PAIEMENT METHODS
  // ═══════════════════════════════════════════

  getAllPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(this.apiUrl);
  }

  getPaiementById(id: number): Observable<Paiement> {
    return this.http.get<Paiement>(`${this.apiUrl}/${id}`);
  }

  getMesPaiements(userId: number): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.apiUrl}/user/${userId}`);
  }

  getPaiementsByStatut(statut: StatutPaiement): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getPaiementsStats(): Observable<{ totalPaye: number; totalCommissions: number }> {
    return this.http.get<{ totalPaye: number; totalCommissions: number }>(`${this.apiUrl}/stats`);
  }

  creerPaiement(paiement: Paiement): Observable<Paiement> {
    return this.http.post<Paiement>(this.apiUrl, paiement, this.httpOptions);
  }

  creerPaiementDepuisContrat(
    contratId: number,
    payeurId: number,
    beneficiaireId: number,
    montant: number
  ): Observable<Paiement> {
    const params = new URLSearchParams();
    params.append('contratId', contratId.toString());
    params.append('payeurId', payeurId.toString());
    params.append('beneficiaireId', beneficiaireId.toString());
    params.append('montant', montant.toString());

    return this.http.post<Paiement>(
      `${this.apiUrl}/depuis-contrat`,
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
  }

  bloquerPaiement(id: number): Observable<Paiement> {
    return this.http.patch<Paiement>(`${this.apiUrl}/${id}/bloquer`, {});
  }

  debloquerPaiement(id: number): Observable<Paiement> {
    return this.http.patch<Paiement>(`${this.apiUrl}/${id}/debloquer`, {});
  }

  // ═══════════════════════════════════════════
  // TRANSACTION METHODS
  // ═══════════════════════════════════════════

  initierPaiement(
    paiementId: number,
    montant: number,
    type: TypeTransaction,
    expediteurId: number
  ): Observable<Transaction> {
    const params = new URLSearchParams();
    params.append('montant', montant.toString());
    params.append('type', type);
    params.append('expediteurId', expediteurId.toString());

    return this.http.post<Transaction>(
      `${this.apiUrl}/${paiementId}/initier`,
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
  }

  validerTransaction(id: number): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/transactions/${id}/valider`, {});
  }

  rembourserTransaction(id: number): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/transactions/${id}/rembourser`, {});
  }

  // ═══════════════════════════════════════════
  // COMMISSION METHODS
  // ═══════════════════════════════════════════

  preleverCommission(id: number): Observable<Commission> {
    return this.http.patch<Commission>(`${this.apiUrl}/commissions/${id}/prelever`, {});
  }
}
