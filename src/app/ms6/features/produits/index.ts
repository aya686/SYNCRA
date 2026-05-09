// Models
export * from './models/produit.model';
export * from './models/stock.model';

// Services
export * from './services/produit.service';

// Re-export types from produit.model that reference stock
export type { Stock, StockRequest } from './models/stock.model';
