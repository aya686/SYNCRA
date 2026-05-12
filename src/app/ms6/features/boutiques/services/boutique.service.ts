import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Boutique, BoutiqueRequest, Configuration, ConfigurationRequest, StatsBoutique } from '../models/boutique.model';

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {
  private apiUrl = `${environment.hichemApi}/boutiques`;

  constructor(private http: HttpClient) {}

  getAllBoutiques(): Observable<Boutique[]> {
    return this.http.get<Boutique[]>(this.apiUrl);
  }

  getBoutiqueById(id: number): Observable<Boutique> {
    return this.http.get<Boutique>(`${this.apiUrl}/${id}`);
  }

  createBoutique(request: BoutiqueRequest): Observable<Boutique> {
    return this.http.post<Boutique>(this.apiUrl, request);
  }

  updateBoutique(id: number, request: BoutiqueRequest): Observable<Boutique> {
    return this.http.put<Boutique>(`${this.apiUrl}/${id}`, request);
  }

  deleteBoutique(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleSuspendBoutique(id: number): Observable<Boutique> {
    return this.http.patch<Boutique>(`${this.apiUrl}/${id}/suspend`, {});
  }

  getBoutiqueStats(id: number): Observable<StatsBoutique> {
    return this.http.get<StatsBoutique>(`${this.apiUrl}/${id}/stats`);
  }

  getConfiguration(id: number): Observable<Configuration> {
    return this.http.get<Configuration>(`${this.apiUrl}/${id}/config`);
  }

  updateConfiguration(id: number, request: ConfigurationRequest): Observable<Configuration> {
    return this.http.put<Configuration>(`${this.apiUrl}/${id}/config`, request);
  }
}
