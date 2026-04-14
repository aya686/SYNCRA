import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Evaluation } from '../../shared/models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private evaluations: Evaluation[] = [];

  constructor() {
    this.loadMockEvaluations();
  }

  private loadMockEvaluations(): void {
    this.evaluations = [
      {
        id: 1,
        sessionId: 1,
        participantId: 1,
        note: 15.5,
        commentaire: 'Très bonne formation, formateur excellent',
        competencesAcquises: ['Components', 'Services'],
        dateEvaluation: new Date()
      },
      {
        id: 2,
        sessionId: 1,
        participantId: 2,
        note: 17,
        commentaire: 'Formation complète et bien structurée',
        competencesAcquises: ['Components', 'Services', 'RxJS'],
        dateEvaluation: new Date()
      }
    ];
  }

  getParticipationStats(eventId?: number): Observable<any> {
    const stats = {
      totalInscrits: 150,
      totalPresences: 120,
      tauxParticipation: 80,
      tauxAbsenteeisme: 20,
      evolutionHebdomadaire: [
        { semaine: 'Sem 1', inscrits: 30, presences: 25 },
        { semaine: 'Sem 2', inscrits: 45, presences: 38 },
        { semaine: 'Sem 3', inscrits: 60, presences: 52 },
        { semaine: 'Sem 4', inscrits: 75, presences: 68 }
      ],
      parType: {
        conference: 100,
        workshop: 50,
        hackathon: 30,
        seminaire: 40
      }
    };
    return of(stats);
  }

  getProgressionStats(formationId?: number): Observable<any> {
    const stats = {
      moyenneProgression: 75,
      tauxCompletion: 65,
      repartitionNiveaux: {
        debutant: 35,
        intermediaire: 45,
        avance: 20
      },
      progressionParSession: [
        { session: 'Session 1', progression: 85, participants: 18 },
        { session: 'Session 2', progression: 70, participants: 22 },
        { session: 'Session 3', progression: 92, participants: 15 },
        { session: 'Session 4', progression: 60, participants: 25 }
      ],
      tempsMoyenCompletion: 35,
      tauxReussite: 78
    };
    return of(stats);
  }

  getEvaluationStats(formationId?: number): Observable<any> {
    const stats = {
      noteMoyenne: 14.8,
      totalEvaluations: 50,
      repartitionNotes: {
        '0-5': 2,
        '6-10': 8,
        '11-15': 25,
        '16-20': 15
      },
      competencesLesPlusAcquises: [
        { competence: 'Components', count: 45, pourcentage: 90 },
        { competence: 'Services', count: 40, pourcentage: 80 },
        { competence: 'RxJS', count: 35, pourcentage: 70 },
        { competence: 'NgRx', count: 28, pourcentage: 56 }
      ],
      satisfactionGlobale: 4.2,
      recommandation: 85
    };
    return of(stats);
  }

  createEvaluation(evaluation: Evaluation): Observable<Evaluation> {
    evaluation.id = Date.now();
    evaluation.dateEvaluation = new Date();
    this.evaluations.push(evaluation);
    return of(evaluation);
  }

  getEvaluationsBySession(sessionId: number): Observable<Evaluation[]> {
    return of(this.evaluations.filter(e => e.sessionId === sessionId));
  }
}