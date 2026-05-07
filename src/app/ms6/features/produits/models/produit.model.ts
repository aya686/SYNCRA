import type { Stock, StockRequest } from './stock.model';

export interface Produit {
  produitId: number;
  nom: string;
  description?: string;
  prix: number;
  prixPromo?: number;
  categories?: string;
  images?: string;
  actif: boolean;
  archive?: boolean;
  boutiqueId: number;
  stock?: Stock;
  promotionIds?: number[];
}

export interface ProduitRequest {
  nom: string;
  description?: string;
  prix: number;
  categories?: string;
  images?: string;
  boutiqueId: number;
  stock?: StockRequest;
  actif?: boolean;
}

export type { Stock, StockRequest };
