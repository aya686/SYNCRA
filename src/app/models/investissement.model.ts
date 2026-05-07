export interface Investisseur {
  id?: number;
  userId: number;
  nom: string;
  email: string;
  telephone?: string;
  typeInvestisseur: TypeInvestisseur;
  secteursInteret?: string;
  budgetTotal?: number;
  ribBancaire?: string;
  documentJustificatif?: string;
  profilVerifie: boolean;
  scoreFiabilite?: number;
  dateCreation?: string;
  misesFonds?: MiseFonds[];
  conventions?: Convention[];
}

export enum TypeInvestisseur {
  PRIVE = 'PRIVE',
  ENTREPRISE = 'ENTREPRISE',
  INSTITUTIONNEL = 'INSTITUTIONNEL',
  BUSINESS_ANGEL = 'BUSINESS_ANGEL'
}

export interface MiseFonds {
  id?: number;
  montant: number;
  pourcentageParticipation: number;
  dureeMois?: number;
  typeInvestissement: TypeInvestissement;
  statut: StatutMiseFonds;
  preuveFonds?: string;
  ribBancaire?: string;
  motifRefus?: string;
  scoreViabilite?: number;
  roiEstime?: number;
  niveauRisque?: NiveauRisque;
  recommandationIa?: string;
  pourcentageAcceptation?: number;
  causeAcceptation?: string;
  dateSoumission?: string;
  dateTraitement?: string;
  investisseur?: Investisseur;
  projetId: number;
}

export enum TypeInvestissement {
  PRISE_PARTICIPATION = 'PRISE_PARTICIPATION',
  PRET = 'PRET',
  DON = 'DON'
}

export enum StatutMiseFonds {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_REVISION = 'EN_REVISION',
  VALIDEE = 'VALIDEE',
  REFUSEE = 'REFUSEE',
  ANNULEE = 'ANNULEE'
}

export enum NiveauRisque {
  FAIBLE = 'FAIBLE',
  MOYEN = 'MOYEN',
  ELEVE = 'ELEVE',
  TRES_ELEVE = 'TRES_ELEVE'
}

export interface Convention {
  id?: number;
  reference: string;
  titre: string;
  description?: string;
  montant: number;
  pourcentageParticipation: number;
  dureeMois?: number;
  clauseRachat: boolean;
  detailClauseRachat?: string;
  statut: StatutConvention;
  typeConvention: TypeConvention;
  dateSignature?: string;
  dateDebut?: string;
  dateFin?: string;
  dateCreation?: string;
  projetId: number;
  porteurId: number;
  investisseur?: Investisseur;
  partenaire?: Partenaire;
  miseFondsId?: number;
  signeInvestisseur: boolean;
  signePorteur: boolean;
}

export enum StatutConvention {
  EN_COURS_SIGNATURE = 'EN_COURS_SIGNATURE',
  ACTIVE = 'ACTIVE',
  EXPIREE = 'EXPIREE',
  RESILIEE = 'RESILIEE',
  SUSPENDUE = 'SUSPENDUE'
}

export enum TypeConvention {
  INVESTISSEMENT_PRIVE = 'INVESTISSEMENT_PRIVE',
  PARTENARIAT_INSTITUTIONNEL = 'PARTENARIAT_INSTITUTIONNEL',
  ACCORD_CADRE = 'ACCORD_CADRE'
}

export interface Partenaire {
  id?: number;
  nom: string;
  description?: string;
  typePartenaire: TypePartenaire;
  email?: string;
  telephone?: string;
  siteWeb?: string;
  logoUrl?: string;
  perimetre?: string;
  montantTotalEngage?: number;
  nombreProjetsCouvers?: number;
  actif: boolean;
  dateDebut?: string;
  dateCreation?: string;
  conventions?: Convention[];
}

export enum TypePartenaire {
  BANQUE = 'BANQUE',
  ORGANISME_ETAT = 'ORGANISME_ETAT',
  FONDS_INVESTISSEMENT = 'FONDS_INVESTISSEMENT',
  INCUBATEUR = 'INCUBATEUR',
  AUTRE = 'AUTRE'
}

export interface Negociation {
  id?: number;
  statut: StatutNegociation;
  montantPropose?: number;
  pourcentagePropose?: number;
  dureeProposeeMois?: number;
  montantFinal?: number;
  pourcentageFinal?: number;
  dureeFinaleMois?: number;
  clauseRachatNegociee: boolean;
  dateOuverture?: string;
  dateCloture?: string;
  investisseurUserId: number;
  porteurUserId: number;
  miseFonds?: MiseFonds;
  messages?: MessageNegociation[];
}

export enum StatutNegociation {
  EN_COURS = 'EN_COURS',
  ACCEPTEE = 'ACCEPTEE',
  ECHOUEE = 'ECHOUEE',
  ANNULEE = 'ANNULEE'
}

export interface MessageNegociation {
  id?: number;
  contenu: string;
  dateEnvoi: string;
  roleExpediteur: RoleExpediteur;
  negociation?: Negociation;
}

export enum RoleExpediteur {
  INVESTISSEUR = 'INVESTISSEUR',
  PORTEUR = 'PORTEUR'
}
