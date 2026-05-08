// etudiant.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EtudiantService {
  private readonly baseUrl = 'http://localhost:8082';
  private apiUrl = `${this.baseUrl}/api/etudiants`;

  constructor(private http: HttpClient) {}

  create(userId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/${userId}`, data);
  }
}