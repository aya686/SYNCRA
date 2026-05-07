export interface Commande {
  commandeId: number;
  montantTotal: number;
  statut: string;
  date?: string;
  adresseLivraison: string;
  lignes: LigneCommande[];
  codePromo?: string;
  montantAvantRemise?: number;
  montantRemise?: number;
  promotionType?: string;
  promotionValeur?: number;
}

export interface CommandeRequest {
  adresseLivraison: string;
  lignes: LigneCommandeRequest[];
  codePromo?: string;
}

export interface PromoValidationResponse {
  valid: boolean;
  message: string;
  codePromo?: string;
  type?: string;
  valeur?: number;
  montantRemise?: number;
  montantAvantRemise?: number;
  montantApresRemise?: number;
}

export interface LigneCommande {
  ligneId: number;
  produitId: number;
  nomProduit: string;
  quantite: number;
  prixUnitaire: number;
  total: number;
}

export interface LigneCommandeRequest {
  produitId: number;
  quantite: number;
}

export interface StatutUpdateRequest {
  statut: string;
}

export interface Annulation {
  annulationId: number;
  commandeId: number;
  motif: string;
  dateAnnulation?: string;
  rembourse?: boolean;
  statut?: string;
}

export interface AnnulationRequest {
  motif: string;
  rembourse?: boolean;
}
