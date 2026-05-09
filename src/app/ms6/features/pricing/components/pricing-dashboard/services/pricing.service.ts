import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PricingConfigurationRequest {
  produitId: number;
  prixBase: number;
  prixMin?: number;
  prixMax?: number;
  strategie: string;
  coefficientDemande?: number;
  coefficientConcurrence?: number;
  coefficientSaisonnalite?: number;
}

export interface PricingConfigurationResponse {
  configId: number;
  produitId: number;
  nomProduit: string;
  prixBase: number;
  prixMin: number;
  prixMax: number;
  strategie: string;
  elasticitePrix: number | null;
  coefficientDemande: number;
  coefficientConcurrence: number;
  coefficientSaisonnalite: number;
  actif: boolean;
  dateCreation: string;
}

export interface PriceCalculationRequest {
  produitId: number;
  prixActuel?: number;
  stockDisponible?: number;
  vuesDerniereHeure?: number;
  ventesDerniereHeure?: number;
  prixConcurrent?: number;
  appliquerAutomatiquement?: boolean;
}

export interface PriceCalculationResponse {
  produitId: number;
  nomProduit: string;
  prixActuel: number;
  prixCalcule: number;
  variationPercent: number;
  raisonAjustement: string;
  elasticiteEstimee: number | null;
  revenuEstimeAncienPrix: number;
  revenuEstimeNouveauPrix: number;
  gainRevenuPotentiel: number;
  facteursConsideres: string[];
  appliquable: boolean;
  message: string;
}

export interface ElasticityCalculationResponse {
  produitId: number;
  nomProduit: string;
  elasticiteCalculee: number | null;
  interpretation: string;
  pointsDonnees: DataPoint[];
  coefficientDetermination: number | null;
  formuleUtilisee: string;
}

export interface DataPoint {
  date: string;
  prix: number;
  quantite: number;
  elasticitePonctuelle: number | null;
}

export interface PriceSimulationRequest {
  produitId: number;
  nouveauPrix: number;
  stockDisponible?: number;
}

export interface PriceSimulationResponse {
  produitId: number;
  nomProduit: string;
  prixActuel: number;
  prixSimule: number;
  variationPercent: number;
  quantiteEstimeeAncienPrix: number;
  quantiteEstimeeNouveauPrix: number;
  revenuAncienPrix: number;
  revenuNouveauPrix: number;
  margeEstimee: number;
  recommandation: string;
}

export interface PricingAnalyticsDTO {
  totalProduitsDynamiques: number;
  totalChangements24h: number;
  variationPrixMoyenne: number;
  gainRevenuTotal: number;
  topAugmentations: TopVariationDTO[];
  topReductions: TopVariationDTO[];
}

export interface TopVariationDTO {
  produitId: number;
  nomProduit: string;
  ancienPrix: number;
  nouveauPrix: number;
  variationPercent: number;
}

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  private apiUrl = 'http://localhost:8086/ms6/api/pricing';

  constructor(private http: HttpClient) {}

  // Configuration
  createConfiguration(request: PricingConfigurationRequest): Observable<PricingConfigurationResponse> {
    return this.http.post<PricingConfigurationResponse>(`${this.apiUrl}/config`, request);
  }

  getConfiguration(produitId: number): Observable<PricingConfigurationResponse> {
    return this.http.get<PricingConfigurationResponse>(`${this.apiUrl}/config/${produitId}`);
  }

  getAllConfigurations(): Observable<PricingConfigurationResponse[]> {
    return this.http.get<PricingConfigurationResponse[]>(`${this.apiUrl}/configs`);
  }

  // Elasticité
  calculateElasticity(produitId: number, periodeJours: number = 30): Observable<ElasticityCalculationResponse> {
    return this.http.post<ElasticityCalculationResponse>(
      `${this.apiUrl}/elasticity/${produitId}?periodeJours=${periodeJours}`,
      {}
    );
  }

  // Calcul prix optimal
  calculateOptimalPrice(request: PriceCalculationRequest): Observable<PriceCalculationResponse> {
    return this.http.post<PriceCalculationResponse>(
      `${this.apiUrl}/calculate/${request.produitId}`,
      request
    );
  }

  // Appliquer prix optimal
  applyOptimalPrice(produitId: number): Observable<PriceCalculationResponse> {
    return this.http.post<PriceCalculationResponse>(`${this.apiUrl}/apply/${produitId}`, {});
  }

  // Simulation
  simulatePriceChange(request: PriceSimulationRequest): Observable<PriceSimulationResponse> {
    return this.http.post<PriceSimulationResponse>(
      `${this.apiUrl}/simulate/${request.produitId}`,
      request
    );
  }

  // Analytics
  getAnalytics(): Observable<PricingAnalyticsDTO> {
    return this.http.get<PricingAnalyticsDTO>(`${this.apiUrl}/analytics`);
  }

  // Stratégies
  getStrategies(): Observable<string> {
    return this.http.get(`${this.apiUrl}/strategies`, { responseType: 'text' });
  }
}
