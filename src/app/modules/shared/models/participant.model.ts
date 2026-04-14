export interface Participant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'talent' | 'collaborateur' | 'porteur_idee';
  createdAt: Date;
}