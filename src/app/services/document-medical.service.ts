import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentMedical } from '../models/document-medical.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentMedicalService {
  private apiUrl = '/api/document-medical';

  constructor(private http: HttpClient) {}

  findAll(): Observable<DocumentMedical[]> {
    return this.http.get<DocumentMedical[]>(this.apiUrl);
  }

  findById(id: number): Observable<DocumentMedical> {
    return this.http.get<DocumentMedical>(`${this.apiUrl}/${id}`);
  }

  create(data: DocumentMedical): Observable<DocumentMedical> {
    return this.http.post<DocumentMedical>(this.apiUrl, data);
  }

  update(id: number, data: DocumentMedical): Observable<DocumentMedical> {
    return this.http.put<DocumentMedical>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}