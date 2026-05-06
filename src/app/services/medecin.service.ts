import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medecin } from '../models/medecin.model';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  private apiUrl = '/api/medecin';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Medecin[]> {
    return this.http.get<Medecin[]>(this.apiUrl);
  }
}