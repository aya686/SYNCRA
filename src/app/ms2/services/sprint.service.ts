import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sprint } from '../models/sprint.model';
 import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SprintService {
  private base = `${environment.projetsApi}/sprints`;
  constructor(private http: HttpClient) {}
 
  getByProjet(projetId: number): Observable<Sprint[]> {
    return this.http.get<Sprint[]>(`${this.base}/projet/${projetId}`);
  }
 
  getById(id: number): Observable<Sprint> {
    return this.http.get<Sprint>(`${this.base}/${id}`);
  }
}
 