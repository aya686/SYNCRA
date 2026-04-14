import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { FormationDisplay } from '../../shared/models/formation.model';

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = 'http://localhost:8089/event_db/api/formations';
  private sessionsApiUrl = 'http://localhost:8089/event_db/api/sessions';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // ============ MÉTHODES FORMATION ============
  
  getFormations(): Observable<FormationDisplay[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        map(formations => {
          console.log('Formations reçues de l\'API:', formations);
          return formations.map(f => ({
            id: f.formationId,
            titre: f.titre,
            description: `Formation de niveau ${f.niveau}`,
            dureeTotale: f.dureeHeures,
            niveau: f.niveau,
            prix: f.prix,
            certificate: f.certificate,
            createdAt: new Date(f.createdAt || Date.now())
          }));
        })
      );
  }

  getFormation(id: number): Observable<FormationDisplay> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(f => ({
          id: f.formationId,
          titre: f.titre,
          description: `Formation de niveau ${f.niveau}`,
          dureeTotale: f.dureeHeures,
          niveau: f.niveau,
          prix: f.prix,
          certificate: f.certificate,
          createdAt: new Date(f.createdAt || Date.now())
        }))
      );
  }

  createFormation(formationData: any): Observable<FormationDisplay> {
    const formationToSend = {
      titre: formationData.titre,
      niveau: formationData.niveau,
      dureeHeures: formationData.dureeTotale,
      certificate: formationData.certificate,
      prix: formationData.prix,
      statut: 'active'
    };
    return this.http.post<any>(this.apiUrl, formationToSend, { headers: this.getHeaders() })
      .pipe(
        map(created => ({
          id: created.formationId,
          titre: created.titre,
          description: `Formation de niveau ${created.niveau}`,
          dureeTotale: created.dureeHeures,
          niveau: created.niveau,
          prix: created.prix,
          certificate: created.certificate,
          createdAt: new Date()
        }))
      );
  }

  updateFormation(id: number, formationData: any): Observable<FormationDisplay> {
    const formationToSend = {
      titre: formationData.titre,
      niveau: formationData.niveau,
      dureeHeures: formationData.dureeTotale,
      certificate: formationData.certificate,
      prix: formationData.prix,
      statut: 'active'
    };
    return this.http.put<any>(`${this.apiUrl}/${id}`, formationToSend, { headers: this.getHeaders() })
      .pipe(
        map(updated => ({
          id: updated.formationId,
          titre: updated.titre,
          description: `Formation de niveau ${updated.niveau}`,
          dureeTotale: updated.dureeHeures,
          niveau: updated.niveau,
          prix: updated.prix,
          certificate: updated.certificate,
          createdAt: new Date()
        }))
      );
  }

  deleteFormation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ============ MÉTHODES SESSION ============

  getSessions(formationId?: number): Observable<any[]> {
    let url = this.sessionsApiUrl;
    if (formationId) {
      url += `?formationId=${formationId}`;
    }
    return this.http.get<any[]>(url, { headers: this.getHeaders() })
      .pipe(
        map(sessions => {
          console.log('Sessions reçues:', sessions);
          return sessions.map(s => ({
            id: s.sessionId || s.id,
            formationId: s.formationId,
            lieu: s.lieu,
            formateur: s.intervenant,
            dateDebut: s.dateHeure,
            dateFin: s.dateFin,
            capaciteMax: s.capaciteMax,
            statut: s.statut
          }));
        })
      );
  }

  getSession(id: number): Observable<any> {
    return this.http.get<any>(`${this.sessionsApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(s => ({
          id: s.sessionId || s.id,
          formationId: s.formationId,
          lieu: s.lieu,
          formateur: s.intervenant,
          dateDebut: s.dateHeure,
          dateFin: s.dateFin,
          capaciteMax: s.capaciteMax,
          statut: s.statut
        }))
      );
  }

  createSession(session: any): Observable<any> {
    const sessionToSend = {
      formationId: session.formationId,
      lieu: session.lieu,
      formateur: session.formateur,
      titre: session.titre || 'Session de formation',
      dateDebut: session.dateDebut,
      dateFin: session.dateFin,
      capaciteMax: session.capaciteMax,
      statut: session.statut
    };
    console.log('Envoi session:', sessionToSend);
    return this.http.post<any>(this.sessionsApiUrl, sessionToSend, { headers: this.getHeaders() });
  }

  updateSession(id: number, session: any): Observable<any> {
    const sessionToSend = {
      formationId: session.formationId,
      lieu: session.lieu,
      formateur: session.formateur,
      titre: session.titre || 'Session de formation',
      dateDebut: session.dateDebut,
      dateFin: session.dateFin,
      capaciteMax: session.capaciteMax,
      statut: session.statut
    };
    return this.http.put<any>(`${this.sessionsApiUrl}/${id}`, sessionToSend, { headers: this.getHeaders() });
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sessionsApiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ============ MÉTHODES PARTICIPATION ============

  getParticipations(sessionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.sessionsApiUrl}/${sessionId}/participations`, { headers: this.getHeaders() })
      .pipe(map(p => p || []));
  }

  inscrireParticipant(participation: any): Observable<any> {
    return this.http.post<any>(`${this.sessionsApiUrl}/${participation.sessionId}/inscriptions`, participation, { headers: this.getHeaders() });
  }

  updateProgression(participationId: number, progression: number): Observable<any> {
    return this.http.put<any>(`${this.sessionsApiUrl}/participations/${participationId}/progression`, { progression }, { headers: this.getHeaders() });
  }

  // ============ MÉTHODES COMPÉTENCES ============

  getCompetences(formationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${formationId}/competences`, { headers: this.getHeaders() })
      .pipe(map(c => c || []));
  }
}