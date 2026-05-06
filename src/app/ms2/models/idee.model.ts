export type StatutIdee = 'NOUVELLE' | 'ACCEPTEE' | 'REJETEE' | 'TRANSFORMEE';

export interface Idee {
  id?: number;
  auteurId?: number;
  titre: string;
  description?: string;
  categorie?: string;
  statut?: StatutIdee;
  projet?: any;
  
}