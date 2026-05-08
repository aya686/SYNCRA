// competence.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competence } from '../models/competence.model';

@Injectable({ providedIn: 'root' })
export class CompetenceService {
  private readonly baseUrl = 'http://localhost:8082';
  private apiUrl = `${this.baseUrl}/api/competences`;

  constructor(private http: HttpClient) {}

  getByUser(userId: number): Observable<Competence[]> {
    return this.http.get<Competence[]>(`${this.apiUrl}/user/${userId}`);
  }

  create(userId: number, competence: Competence): Observable<Competence> {
    return this.http.post<Competence>(`${this.apiUrl}/user/${userId}`, competence);
  }

  update(id: number, competence: Competence): Observable<Competence> {
    return this.http.put<Competence>(`${this.apiUrl}/${id}`, competence);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}