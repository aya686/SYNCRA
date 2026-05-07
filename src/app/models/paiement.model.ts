// Module 5: Paiements - Modèles TypeScript

// ═══════════════════════════════════════════
// PAIEMENT
// ═══════════════════════════════════════════
export interface Paiement {
  id?: number;
  reference: string;
  montantTotal: number;
  montantPaye: number;
  montantRestant: number;
  devise: string;
  tauxTva: number;
  montantTva?: number;
  tauxCommission: number;
  montantCommission?: number;
  statut: StatutPaiement;
  modePaiement?: ModePaiement;
  payeurId: number;
  beneficiaireId: number;
  contratId?: number;
  miseFondsId?: number;
  dateCreation?: string;
  dateEcheance?: string;
  datePaiementComplet?: string;
  transactions?: Transaction[];
  factures?: Facture[];
  echeances?: Echeance[];
  commissions?: Commission[];
}

export enum StatutPaiement {
  EN_ATTENTE = 'EN_ATTENTE',
  PARTIELLEMENT_PAYE = 'PARTIELLEMENT_PAYE',
  PAYE = 'PAYE',
  EN_RETARD = 'EN_RETARD',
  REMBOURSE = 'REMBOURSE',
  ANNULE = 'ANNULE',
  BLOQUE = 'BLOQUE'
}

export enum ModePaiement {
  VIREMENT_BANCAIRE = 'VIREMENT_BANCAIRE',
  CHEQUE = 'CHEQUE',
  ESPECES = 'ESPECES',
  CARTE_BANCAIRE = 'CARTE_BANCAIRE',
  FLOUCI = 'FLOUCI',
  D17 = 'D17'
}

// ═══════════════════════════════════════════
// TRANSACTION
// ═══════════════════════════════════════════
export interface Transaction {
  id?: number;
  reference: string;
  montant: number;
  typeTransaction: TypeTransaction;
  statut: StatutTransaction;
  description?: string;
  expediteurId: number;
  destinataireId: number;
  motifEchec?: string;
  numeroExterne?: string;
  dateTransaction: string;
  dateValidation?: string;
  paiement?: Paiement;
}

export enum TypeTransaction {
  PAIEMENT_INITIAL = 'PAIEMENT_INITIAL',
  PAIEMENT_SOLDE = 'PAIEMENT_SOLDE',
  REMBOURSEMENT = 'REMBOURSEMENT',
  COMMISSION = 'COMMISSION',
  ACOMPTE = 'ACOMPTE'
}

export enum StatutTransaction {
  EN_COURS = 'EN_COURS',
  VALIDEE = 'VALIDEE',
  ECHOUEE = 'ECHOUEE',
  ANNULEE = 'ANNULEE',
  REMBOURSEE = 'REMBOURSEE'
}

// ═══════════════════════════════════════════
// FACTURE
// ═══════════════════════════════════════════
export interface Facture {
  id?: number;
  numeroFacture: string;
  titre: string;
  montantHt: number;
  tauxTva: number;
  montantTva: number;
  montantTtc: number;
  statut: StatutFacture;
  typeFacture: TypeFacture;
  emetteurId: number;
  nomEmetteur?: string;
  destinataireId: number;
  nomDestinataire?: string;
  notes?: string;
  pdfUrl?: string;
  dateEmission: string;
  dateEcheance?: string;
  datePaiement?: string;
  paiement?: Paiement;
  lignes?: LigneFacture[];
}

export enum StatutFacture {
  EMISE = 'EMISE',
  ENVOYEE = 'ENVOYEE',
  PAYEE = 'PAYEE',
  EN_RETARD = 'EN_RETARD',
  ANNULEE = 'ANNULEE'
}

export enum TypeFacture {
  FACTURE = 'FACTURE',
  AVOIR = 'AVOIR',
  PROFORMA = 'PROFORMA',
  RECU = 'RECU'
}

// ═══════════════════════════════════════════
// LIGNE FACTURE
// ═══════════════════════════════════════════
export interface LigneFacture {
  id?: number;
  description: string;
  quantite: number;
  unite?: string;
  prixUnitaireHt: number;
  tauxRemise: number;
  montantHt: number;
  tauxTva: number;
  montantTva: number;
  montantTtc: number;
  ordre?: number;
  facture?: Facture;
}

// ═══════════════════════════════════════════
// ECHEANCE
// ═══════════════════════════════════════════
export interface Echeance {
  id?: number;
  numeroEcheance: number;
  montant: number;
  pourcentage?: number;
  description?: string;
  statut: StatutEcheance;
  dateEcheance: string;
  datePaiement?: string;
  rappelEnvoye: boolean;
  dateRappel?: string;
  paiement?: Paiement;
}

export enum StatutEcheance {
  EN_ATTENTE = 'EN_ATTENTE',
  PAYEE = 'PAYEE',
  EN_RETARD = 'EN_RETARD',
  ANNULEE = 'ANNULEE'
}

// ═══════════════════════════════════════════
// COMMISSION
// ═══════════════════════════════════════════
export interface Commission {
  id?: number;
  taux: number;
  montantBase: number;
  montantCommission: number;
  statut: StatutCommission;
  typeCommission: TypeCommission;
  description?: string;
  dateCalcul?: string;
  datePrelevement?: string;
  paiement?: Paiement;
}

export enum StatutCommission {
  EN_ATTENTE = 'EN_ATTENTE',
  PRELEVEE = 'PRELEVEE',
  REMBOURSEE = 'REMBOURSEE'
}

export enum TypeCommission {
  PLATEFORME = 'PLATEFORME',
  PARTENAIRE = 'PARTENAIRE',
  AUTRE = 'AUTRE'
}
