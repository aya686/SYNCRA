export interface Contrat {
  id?: number;
  titre: string;
  description?: string;
  montant: number;
  modalitePaiement?: string;
  dateDebut?: string;
  dateFin?: string;
  dateGeneration?: string;
  statut: StatutContrat;
  clientId: number;
  prestataireId: number;
  candidatureId?: number;
  offreId?: number;
  paiementId?: number;
  paiementEffectue?: boolean; // Indique si le paiement a été effectué
  clauses?: Clause[];
  signatures?: Signature[];
  litiges?: Litige[];
  signatureImage?: string; // Base64 encoded signature image
}

export enum StatutContrat {
  BROUILLON = 'BROUILLON',
  EN_ATTENTE = 'EN_ATTENTE',
  ACTIF = 'ACTIF',
  TERMINE = 'TERMINE',
  RESILIE = 'RESILIE',
  LITIGE = 'LITIGE'
}

export interface Clause {
  id?: number;
  titre: string;
  contenu: string;
  ordreAffichage?: number;
  obligatoire: boolean;
  typeClause?: TypeClause;
  contratId?: number;
}

export enum TypeClause {
  OBJET = 'OBJET',
  DELAI = 'DELAI',
  PAIEMENT = 'PAIEMENT',
  CONFIDENTIALITE = 'CONFIDENTIALITE',
  PROPRIETE_INTELLECTUELLE = 'PROPRIETE_INTELLECTUELLE',
  RESILIATION = 'RESILIATION',
  GARANTIE = 'GARANTIE',
  AUTRE = 'AUTRE'
}

export interface Signature {
  id?: number;
  userId: number;
  dateSignature?: string;
  role: string;
  contratId?: number;
  signatureImage?: string; // Base64 encoded signature image
}

export interface Litige {
  id?: number;
  motif: string;
  description?: string;
  statut: StatutLitige;
  typeLitige?: TypeLitige;
  declarantId: number;
  adminId?: number;
  decisionAdmin?: DecisionAdmin;
  commentaireResolution?: string;
  dateOuverture?: string;
  dateResolution?: string;
  piecesJointes?: string;
  contratId?: number;
}

export enum StatutLitige {
  OUVERT = 'OUVERT',
  EN_COURS = 'EN_COURS',
  RESOLU = 'RESOLU',
  FERME = 'FERME'
}

export enum TypeLitige {
  LIVRAISON_RETARD = 'LIVRAISON_RETARD',
  QUALITE_TRAVAIL = 'QUALITE_TRAVAIL',
  PAIEMENT_REFUSE = 'PAIEMENT_REFUSE',
  NON_CONFORMITE = 'NON_CONFORMITE',
  RUPTURE_CONTRAT = 'RUPTURE_CONTRAT',
  AUTRE = 'AUTRE'
}

export enum DecisionAdmin {
  EN_FAVEUR_CLIENT = 'EN_FAVEUR_CLIENT',
  EN_FAVEUR_PRESTATAIRE = 'EN_FAVEUR_PRESTATAIRE',
  COMPROMIS = 'COMPROMIS'
}
