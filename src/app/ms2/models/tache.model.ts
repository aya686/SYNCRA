export enum StatutTache {
  A_FAIRE  = 'A_FAIRE',
  EN_COURS = 'EN_COURS',
  EN_REVUE = 'EN_REVUE',
  BLOQUE   = 'BLOQUE',
  TERMINE  = 'TERMINE',
}
 
export enum PrioriteTache {
  HAUTE   = 'HAUTE',
  MOYENNE = 'MOYENNE',
  BASSE   = 'BASSE',
}
 
export interface SousTache {
  id?: number;
  titre: string;
  statut?: string;
}
 
export interface Tache {
  id?: number;
  projetId?: number;
  titre: string;
  description?: string;
  priorite?: PrioriteTache;
  statut?: StatutTache;
  estimationHeures?: number;
  deadline?: string;
  sousTaches?: SousTache[];
}