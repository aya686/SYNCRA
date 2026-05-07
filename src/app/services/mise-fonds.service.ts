import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MiseFonds } from '../models/investissement.model';

@Injectable({
  providedIn: 'root'
})
export class MiseFondsService {
  private apiUrl = 'http://localhost:8085/api/mises-fonds';

  constructor(private http: HttpClient) {}

  getAllMisesFonds(): Observable<MiseFonds[]> {
    return this.http.get<MiseFonds[]>(this.apiUrl);
  }

  getMiseFondsById(id: number): Observable<MiseFonds> {
    return this.http.get<MiseFonds>(`${this.apiUrl}/${id}`);
  }

  getMisesFondsByInvestisseur(investisseurId: number): Observable<MiseFonds[]> {
    return this.http.get<MiseFonds[]>(`${this.apiUrl}/investisseur/${investisseurId}`);
  }

  getMisesFondsByProjet(projetId: number): Observable<MiseFonds[]> {
    return this.http.get<MiseFonds[]>(`${this.apiUrl}/projet/${projetId}`);
  }

  getMisesFondsByStatut(statut: string): Observable<MiseFonds[]> {
    return this.http.get<MiseFonds[]>(`${this.apiUrl}/statut/${statut}`);
  }

  soumettreMiseFonds(investisseurId: number, miseFonds: MiseFonds): Observable<MiseFonds> {
    // Envoyer uniquement les données de miseFonds (investisseurId est déjà dans l'URL)
    return this.http.post<MiseFonds>(`${this.apiUrl}/investisseur/${investisseurId}`, miseFonds);
  }

  validerMiseFonds(id: number): Observable<MiseFonds> {
    return this.http.patch<MiseFonds>(`${this.apiUrl}/${id}/valider`, {});
  }

  refuserMiseFonds(id: number, motifRefus: string): Observable<MiseFonds> {
    return this.http.patch<MiseFonds>(`${this.apiUrl}/${id}/refuser`, { motifRefus });
  }

  annulerMiseFonds(id: number): Observable<MiseFonds> {
    return this.http.patch<MiseFonds>(`${this.apiUrl}/${id}/annuler`, {});
  }

  mettreAJourAnalyseIA(id: number, pourcentageAcceptation: number, causeAcceptation: string): Observable<MiseFonds> {
    return this.http.patch<MiseFonds>(`${this.apiUrl}/${id}/analyse-ia`, {
      pourcentageAcceptation,
      causeAcceptation
    });
  }
}
