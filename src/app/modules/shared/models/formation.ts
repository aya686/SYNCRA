export interface Formation {
  id: number;
  titre: string;
  description: string;
  dureeTotale: number;
  niveau: 'debutant' | 'intermediaire' | 'avance';
  prix: number;
  certificate: boolean;
  createdAt: Date;
}

export interface Session {
  id: number;
  formationId: number;
  dateDebut: Date;
  dateFin: Date;
  lieu: string;
  formateur: string;
  capaciteMax: number;
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
}

export interface Participation {
  id: number;
  sessionId: number;
  participantId: number;
  dateInscription: Date;
  statut: 'inscrit' | 'present' | 'absent' | 'abandon';
  progression: number;
  dateCompletion?: Date;
}

export interface Competence {
  id: number;
  nom: string;
  description: string;
  formationId: number;
}

export interface CompetenceAcquise {
  id: number;
  participantId: number;
  competenceId: number;
  dateAcquisition: Date;
  niveau: number;
}