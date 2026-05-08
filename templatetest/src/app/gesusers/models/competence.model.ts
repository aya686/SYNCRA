export interface Competence {
  id?: number;
  libelle: string;
  niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'EXPERT';
  categorie?: string;
  userId?: number;
}

