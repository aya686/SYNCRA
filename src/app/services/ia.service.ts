import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IaService {
  private apiUrl = 'http://localhost:8085/api/ia';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Prédire le budget recommandé pour une offre
  predireBudget(params: {
    categorie: string;
    dureeJours: number;
    nbCriteres: number;
    scorePublieur?: number;
    nbPostes?: number;
  }): Observable<any> {
    const queryParams = new URLSearchParams();
    queryParams.append('categorie', params.categorie);
    queryParams.append('dureeJours', params.dureeJours.toString());
    queryParams.append('nbCriteres', params.nbCriteres.toString());
    queryParams.append('scorePublieur', (params.scorePublieur || 50).toString());
    queryParams.append('nbPostes', (params.nbPostes || 1).toString());

    return this.http.post(
      `${this.apiUrl}/predict-budget?${queryParams.toString()}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Erreur prédiction budget:', error);
        return of({ success: false, error: 'Service IA indisponible' });
      })
    );
  }

  // Détecter si une offre est suspecte
  detecterFraude(params: {
    categorie: string;
    dureeJours: number;
    nbCriteres: number;
    scorePublieur: number;
    nbPostes: number;
    budget: number;
  }): Observable<any> {
    const queryParams = new URLSearchParams();
    queryParams.append('categorie', params.categorie);
    queryParams.append('dureeJours', params.dureeJours.toString());
    queryParams.append('nbCriteres', params.nbCriteres.toString());
    queryParams.append('scorePublieur', params.scorePublieur.toString());
    queryParams.append('nbPostes', params.nbPostes.toString());
    queryParams.append('budget', params.budget.toString());

    return this.http.post(
      `${this.apiUrl}/detect-fraud?${queryParams.toString()}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Erreur détection fraude:', error);
        return of({ success: false, estSuspecte: false, error: 'Service IA indisponible' });
      })
    );
  }

  // Analyse complète d'une offre (budget + fraude)
  analyserOffre(params: {
    categorie: string;
    dureeJours: number;
    nbCriteres: number;
    scorePublieur: number;
    nbPostes: number;
    budget: number;
  }): Observable<any> {
    const queryParams = new URLSearchParams();
    queryParams.append('categorie', params.categorie);
    queryParams.append('dureeJours', params.dureeJours.toString());
    queryParams.append('nbCriteres', params.nbCriteres.toString());
    queryParams.append('scorePublieur', params.scorePublieur.toString());
    queryParams.append('nbPostes', params.nbPostes.toString());
    queryParams.append('budget', params.budget.toString());

    return this.http.post(
      `${this.apiUrl}/analyze-offre?${queryParams.toString()}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Erreur analyse offre:', error);
        return of({ success: false, alerte: false, error: 'Service IA indisponible' });
      })
    );
  }
}
