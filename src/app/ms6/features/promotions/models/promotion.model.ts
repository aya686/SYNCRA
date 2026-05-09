export interface Promotion {
  promoId: number;
  type: string;
  valeur: number;
  dateDebut?: string;
  dateFin?: string;
  codePromo?: string;
  active: boolean;
}

export interface PromotionRequest {
  type: string;
  valeur: number;
  dateDebut?: string;
  dateFin?: string;
  codePromo?: string;
}
