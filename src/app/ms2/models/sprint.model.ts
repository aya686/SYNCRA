export enum StatutSprint {
  PLANIFIE = 'PLANIFIE',
  EN_COURS = 'EN_COURS',
  TERMINE  = 'TERMINE',
}
 
export interface Sprint {
  id?: number;
  projetId?: number;
  nom: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: StatutSprint;
  chargeTotal?: number;
}