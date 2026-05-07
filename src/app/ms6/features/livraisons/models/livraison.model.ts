export interface Livraison {
  livraisonId: number;
  commandeId: number;
  adresse: string;
  transporteur?: string;
  tracking?: string;
  statut: string;
  dateExp?: string;
  dateLiv?: string;
  // Weather fields
  weatherTemp?: number;
  weatherCondition?: string;
  weatherDescription?: string;
  weatherIcon?: string;
  weatherAlert?: boolean;
}

export interface LivraisonRequest {
  commandeId: number;
  adresse: string;
  transporteur?: string;
  tracking?: string;
}

export interface LivraisonUpdateRequest {
  adresse?: string;
  transporteur?: string;
  tracking?: string;
}

export interface Retour {
  retourId: number;
  livraisonId: number;
  motif: string;
  statut: string;
  dateRetour?: string;
  condition?: string;
}

export interface RetourRequest {
  motif: string;
  condition?: string;
}

export interface Remboursement {
  remboursementId: number;
  retourId: number;
  montant: number;
  methode: string;
  statut: string;
  dateTraitement?: string;
}

export interface RemboursementRequest {
  montant: number;
  methode: string;
}
