import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consultation } from '../models/consultation.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private apiUrl = '/api/consultation';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(this.apiUrl);
  }

  findById(id: number): Observable<Consultation> {
    return this.http.get<Consultation>(`${this.apiUrl}/${id}`);
  }

  create(data: Consultation): Observable<Consultation> {
    return this.http.post<Consultation>(this.apiUrl, data);
  }

  update(id: number, data: Consultation): Observable<Consultation> {
    return this.http.put<Consultation>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}