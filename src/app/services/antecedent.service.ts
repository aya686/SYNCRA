import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Antecedent } from '../models/antecedent.model';

@Injectable({
  providedIn: 'root'
})
export class AntecedentService {
  private apiUrl = '/api/antecedent';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Antecedent[]> {
    return this.http.get<Antecedent[]>(this.apiUrl);
  }

  findById(id: number): Observable<Antecedent> {
    return this.http.get<Antecedent>(`${this.apiUrl}/${id}`);
  }

  create(data: Antecedent): Observable<Antecedent> {
    return this.http.post<Antecedent>(this.apiUrl, data);
  }

  update(id: number, data: Antecedent): Observable<Antecedent> {
    return this.http.put<Antecedent>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}