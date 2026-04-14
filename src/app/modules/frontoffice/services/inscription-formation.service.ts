import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InscriptionFormation {
  inscriptionFormationId: number;
  participantId: number;
  sessionId: number;
  dateInscription: Date;
  statut: string;
  progression: number;
  dateCompletion?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionFormationService {
  private apiUrl = 'http://localhost:8089/event_db/api/inscriptions-formation';

  constructor(private http: HttpClient) {}

  // Créer une inscription à une session de formation
  createInscription(participantId: number, sessionId: number): Observable<InscriptionFormation> {
    return this.http.post<InscriptionFormation>(`${this.apiUrl}?participantId=${participantId}&sessionId=${sessionId}`, {});
  }

  // Récupérer les inscriptions d'un participant
  getByParticipant(participantId: number): Observable<InscriptionFormation[]> {
    return this.http.get<InscriptionFormation[]>(`${this.apiUrl}/participant/${participantId}`);
  }

  // Récupérer les inscriptions d'une session
  getBySession(sessionId: number): Observable<InscriptionFormation[]> {
    return this.http.get<InscriptionFormation[]>(`${this.apiUrl}/session/${sessionId}`);
  }

  // Nombre d'inscrits par session
  getNbInscrits(sessionId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/session/${sessionId}/count`);
  }

  // Mettre à jour la progression
  updateProgression(inscriptionId: number, progression: number): Observable<InscriptionFormation> {
    return this.http.put<InscriptionFormation>(`${this.apiUrl}/${inscriptionId}/progression?progression=${progression}`, {});
  }

  // Supprimer une inscription
  deleteInscription(inscriptionId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${inscriptionId}`);
  }
}