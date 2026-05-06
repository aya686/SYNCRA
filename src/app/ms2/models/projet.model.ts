export enum StatutProjet {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ARCHIVE = 'ARCHIVE',
  ANNULE = 'ANNULE'
}

export enum ModeGuidage {
  MONITEUR = 'MONITEUR',
  IA       = 'IA',
  AUCUN    = 'AUCUN'
}

export interface Projet {
  id?: number;
  porteurId: number;
  titre: string;
  description?: string;
  statut?: StatutProjet;
  dateDebut?: string;
  dateFin?: string;
  budget?: number;
  categorie?: string;
  moniteurId?: number;
  modeGuidage?: ModeGuidage;
}

export interface Avancement {
  id?: number;
  pourcentage: number;
  dateCalcul?: string;
  notesSuivi?: string;
}

export interface ProjetAvecAvancement extends Projet {
  avancement?: Avancement;
}