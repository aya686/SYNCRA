export interface Evaluation {
  id?: number;
  note: number;
  commentaire?: string;
  feedbackCandidat?: string;
  scoreIa?: number;
  pointsForts?: string;
  pointsFaibles?: string;
  dateEvaluation?: string;
  evaluateurId?: number;
  candidature?: Candidature;
}

export interface Candidature {
  id?: number;
  lettreMotivation: string;
  portfolioUrl?: string;
  tarifPropose: number;
  dateSoumission?: string;
  statut: StatutCandidature;
  scoreIa?: number;
  candidatId: number;
  offre?: {
    id: number;
    titre: string;
    description: string;
    budgetMin: number;
    budgetMax?: number;
    deadline: string;
    categorie?: {
      id: number;
      nom: string;
    };
  };
  evaluation?: Evaluation;
}

export enum StatutCandidature {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_REVISION = 'EN_REVISION',
  SHORTLIST = 'SHORTLIST',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE'
}
