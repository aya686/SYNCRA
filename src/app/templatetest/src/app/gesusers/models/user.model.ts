export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  telephone?: string;
  photo?: string;
  statut?: 'ACTIF' | 'EN_ATTENTE' | 'SUSPENDU' | 'BANNI';
  dateInscription?: string;
  derniereConnexion?: string;
}