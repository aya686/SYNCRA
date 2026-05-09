export interface Evaluation {
  id: number;
  sessionId: number;
  participantId: number;
  note: number;
  commentaire: string;
  competencesAcquises: string[];
  dateEvaluation: Date;
}