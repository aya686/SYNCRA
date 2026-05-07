export interface AppelOffre {
  id?: number;
  titre: string;
  description?: string;
  dateOuverture?: string;
  dateCloture: string;
  budgetTotal?: number;
  conditionsParticipation?: string;
  documentsRequis?: string;
  statut?: StatutAppelOffre;
}

export enum StatutAppelOffre {
  OUVERT = 'OUVERT',
  CLOTURE = 'CLOTURE',
  ANNULE = 'ANNULE',
  ATTRIBUE = 'ATTRIBUE'
}
