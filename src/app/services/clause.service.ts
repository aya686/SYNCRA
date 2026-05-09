import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Clause } from '../models/contrat.model';

@Injectable({
  providedIn: 'root'
})
export class ClauseService {
  private apiUrl = 'http://localhost:8085/api/clauses';

  constructor(private http: HttpClient) {}

  // Get clauses for a specific contract
  getClausesByContrat(contratId: number): Observable<Clause[]> {
    return this.http.get<Clause[]>(`${this.apiUrl}/contrat/${contratId}`);
  }

  // Get clause by ID
  getClauseById(id: number): Observable<Clause> {
    return this.http.get<Clause>(`${this.apiUrl}/${id}`);
  }

  // Add clause to contract
  addClauseToContrat(contratId: number, clause: Clause): Observable<Clause> {
    return this.http.post<Clause>(`${this.apiUrl}/contrat/${contratId}`, clause);
  }

  // Update clause
  updateClause(id: number, clause: Clause): Observable<Clause> {
    return this.http.put<Clause>(`${this.apiUrl}/${id}`, clause);
  }

  // Delete clause
  deleteClause(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
