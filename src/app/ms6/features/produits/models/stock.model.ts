export interface Stock {
  stockId: number;
  quantite: number;
  seuilAlerte?: number;
  entrepot?: string;
  alerteStock?: boolean;
}

export interface StockRequest {
  quantite: number;
  seuilAlerte?: number;
  entrepot?: string;
}
