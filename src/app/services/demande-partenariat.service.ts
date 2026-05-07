import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DemandePartenariat, PartenariatEntreprise } from '../models/partenariat.model';

@Injectable({
  providedIn: 'root'
})
export class DemandePartenariatService {
  private apiUrl = 'http://localhost:8085/api/demandes-partenariat';
  private partenariatApiUrl = 'http://localhost:8085/api/partenariats-entreprise';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // DemandePartenariat methods
  getAllDemandes(): Observable<DemandePartenariat[]> {
    return this.http.get<DemandePartenariat[]>(this.apiUrl);
  }

  getDemandeById(id: number): Observable<DemandePartenariat> {
    return this.http.get<DemandePartenariat>(`${this.apiUrl}/${id}`);
  }

  createDemande(demande: DemandePartenariat): Observable<DemandePartenariat> {
    return this.http.post<DemandePartenariat>(this.apiUrl, demande, this.httpOptions);
  }

  updateDemande(id: number, demande: DemandePartenariat): Observable<DemandePartenariat> {
    return this.http.put<DemandePartenariat>(`${this.apiUrl}/${id}`, demande, this.httpOptions);
  }

  deleteDemande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // PartenariatEntreprise methods
  getAllPartenariats(): Observable<PartenariatEntreprise[]> {
    return this.http.get<PartenariatEntreprise[]>(this.partenariatApiUrl);
  }

  getPartenariatById(id: number): Observable<PartenariatEntreprise> {
    return this.http.get<PartenariatEntreprise>(`${this.partenariatApiUrl}/${id}`);
  }

  createPartenariat(partenariat: PartenariatEntreprise): Observable<PartenariatEntreprise> {
    return this.http.post<PartenariatEntreprise>(this.partenariatApiUrl, partenariat, this.httpOptions);
  }

  updatePartenariat(id: number, partenariat: PartenariatEntreprise): Observable<PartenariatEntreprise> {
    return this.http.put<PartenariatEntreprise>(`${this.partenariatApiUrl}/${id}`, partenariat, this.httpOptions);
  }

  deletePartenariat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.partenariatApiUrl}/${id}`);
  }

  getHorsPartenariat(): Observable<PartenariatEntreprise[]> {
    return this.http.get<PartenariatEntreprise[]>(`${this.partenariatApiUrl}/hors-partenariat`);
  }
}
