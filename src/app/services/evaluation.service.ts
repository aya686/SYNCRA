import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evaluation } from '../models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = 'http://localhost:8085/api/evaluations';

  constructor(private http: HttpClient) {}

  // POST évaluer une candidature
  evaluerCandidature(candidatureId: number, evaluation: Evaluation): Observable<Evaluation> {
    return this.http.post<Evaluation>(`${this.apiUrl}/candidature/${candidatureId}`, evaluation);
  }

  // GET évaluation d'une candidature
  getEvaluationByCandidature(candidatureId: number): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.apiUrl}/candidature/${candidatureId}`);
  }

  // PUT modifier une évaluation
  updateEvaluation(id: number, evaluation: Evaluation): Observable<Evaluation> {
    return this.http.put<Evaluation>(`${this.apiUrl}/${id}`, evaluation);
  }

  // GET toutes les évaluations d'un évaluateur
  getEvaluationsByEvaluateur(evaluateurId: number): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/evaluateur/${evaluateurId}`);
  }
}
