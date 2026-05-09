export interface Candidature {
  id?: number;
  lettreMotivation: string;
  portfolioUrl?: string;
  tarifPropose: number;
  dateSoumission?: string;
  statut: StatutCandidature;
  scoreIa?: number;
  cvResume?: string; // AI-generated CV summary (3 lines)
  aiReport?: string; // AI-generated brief report justifying the score
  candidatId: number;
  cv?: string; // CV filename or URL
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
  evaluation?: any;
}

export enum StatutCandidature {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_REVISION = 'EN_REVISION',
  SHORTLIST = 'SHORTLIST',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE'
}

export interface CandidatureFilter {
  statut?: StatutCandidature;
  offreId?: number;
  candidatId?: number;
}
