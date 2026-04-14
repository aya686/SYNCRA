import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PublicFormation {
  id: number;
  titre: string;
  description: string;
  dureeTotale: number;
  niveau: string;
  prix: number;
  certificate: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PublicFormationService {
  private apiUrl = 'http://localhost:8089/event_db/api/formations';

  constructor(private http: HttpClient) {}

  getFormations(): Observable<PublicFormation[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(formations => formations.map(f => ({
        id: f.formationId,
        titre: f.titre,
        description: f.description || `Formation ${f.titre}`,
        dureeTotale: f.dureeHeures,
        niveau: f.niveau,
        prix: f.prix,
        certificate: f.certificate
      })))
    );
  }

  getFormation(id: number): Observable<PublicFormation> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(f => ({
        id: f.formationId,
        titre: f.titre,
        description: f.description || `Formation ${f.titre}`,
        dureeTotale: f.dureeHeures,
        niveau: f.niveau,
        prix: f.prix,
        certificate: f.certificate
      }))
    );
  }
}