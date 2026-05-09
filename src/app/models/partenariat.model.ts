export interface DemandePartenariat {
  id?: number;
  nom: string;
  prenom: string;
  nomSociete: string;
  description: string;
  dateCreationSociete: string;
  imageUrl?: string;
  email?: string;
  telephone?: string;
  statut: StatutDemandePartenariat;
  dateSoumission?: string;
  userId: number;
}

export enum StatutDemandePartenariat {
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVEE = 'APPROUVEE',
  REFUSEE = 'REFUSEE'
}

export interface PartenariatEntreprise {
  id?: number;
  demandePartenariatId: number;
  partenaire1Id: number;
  partenaire2Id: number;
  descriptionPartenariat: string;
  dateDebut: string;
  dateFin?: string;
  statut: StatutPartenariatEntreprise;
  conditions?: string;
  dateCreation?: string;
  demandePartenariat?: DemandePartenariat;
}

export enum StatutPartenariatEntreprise {
  ACTIF = 'ACTIF',
  TERMINE = 'TERMINE',
  SUSPENDU = 'SUSPENDU'
}
