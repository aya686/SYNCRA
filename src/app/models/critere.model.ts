export interface Critere {
  id?: number;
  nom: string;
  description?: string;
  poids: number;
  obligatoire: boolean;
  type: TypeCritere;
}

export enum TypeCritere {
  COMPETENCE = 'COMPETENCE',
  EXPERIENCE = 'EXPERIENCE',
  DIPLOME = 'DIPLOME',
  LANGUE = 'LANGUE',
  DISPONIBILITE = 'DISPONIBILITE',
  AUTRE = 'AUTRE'
}
