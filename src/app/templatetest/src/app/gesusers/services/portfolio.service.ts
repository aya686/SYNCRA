// portfolio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Portfolio } from '../models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly baseUrl = 'http://localhost:8082';
  private apiUrl = `${this.baseUrl}/api/portfolios`;

  constructor(private http: HttpClient) {}

  getByUser(userId: number): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(`${this.apiUrl}/user/${userId}`);
  }

  create(userId: number, portfolio: Portfolio): Observable<Portfolio> {
    return this.http.post<Portfolio>(`${this.apiUrl}/user/${userId}`, portfolio);
  }

  update(id: number, portfolio: Portfolio): Observable<Portfolio> {
    return this.http.put<Portfolio>(`${this.apiUrl}/${id}`, portfolio);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}