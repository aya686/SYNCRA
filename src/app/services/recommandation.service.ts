// src/app/services/recommendation.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RecommendationCriteria {
  resourceType?: 'MACHINE' | 'SERVICE' | null;

  // Machine
  machineType?: string;
  category?: string;
  transactionType?: string;

  // Service
  serviceType?: string;

  // Communs
  maxBudget?: number | null;
  minBudget?: number | null;
  preferredLocation?: string;
  minRating?: number | null;
  requiresAvailability?: boolean;
  requiredQuantity?: number | null;

  // Poids (optionnel — 0 à 10 chacun, défaut : 30/25/20/15/10)
  weightType?: number;
  weightBudget?: number;
  weightLocation?: number;
  weightRating?: number;
  weightAvailability?: number;

  subCategory?: string;
  businessType?: string;
}

export interface ScoredResult {
  id: number;
  resourceType: 'MACHINE' | 'SERVICE';
  name: string;
  description?: string;
  category?: string;
  type?: string;
  transactionType?: string;
  price: number;
  priceUnit?: string;
  location?: string;
  contactInfo?: string;
  rating: number;
  reviewCount: number;
  availability: string;
  imageUrls?: string[];
  stockQuantity?: number;

  supplierId: number;
  supplierName?: string;
  supplierCompanyName?: string;
  isInApp?: boolean;

  // Score
  totalScore: number;
  scoreType: number;
  scoreBudget: number;
  scoreLocation: number;
  scoreRating: number;
  scoreAvailability: number;

  // UI
  reasons: string[];
  recommendationLevel: 'TOP' | 'GOOD' | 'AVERAGE' | 'LOW';
  badge?: string;
}

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private apiUrl = 'http://localhost:8083/api/recommendations';

  constructor(private http: HttpClient) {}

  /** Appel principal avec tous les critères */
  getRecommendations(criteria: RecommendationCriteria): Observable<ScoredResult[]> {
    return this.http.post<ScoredResult[]>(this.apiUrl, criteria);
  }

  /** Appel simplifié via GET (pour les filtres rapides) */
  getQuickRecommendations(criteria: RecommendationCriteria): Observable<ScoredResult[]> {
    let params = new HttpParams();
    if (criteria.resourceType)        params = params.set('resourceType', criteria.resourceType);
    if (criteria.category)            params = params.set('category', criteria.category);
    if (criteria.machineType)         params = params.set('machineType', criteria.machineType);
    if (criteria.serviceType)         params = params.set('serviceType', criteria.serviceType);
    if (criteria.transactionType)     params = params.set('transactionType', criteria.transactionType);
    if (criteria.maxBudget != null)   params = params.set('maxBudget', criteria.maxBudget.toString());
    if (criteria.minBudget != null)   params = params.set('minBudget', criteria.minBudget.toString());
    if (criteria.preferredLocation)   params = params.set('location', criteria.preferredLocation);
    if (criteria.minRating != null)   params = params.set('minRating', criteria.minRating.toString());
    if (criteria.requiresAvailability != null)
      params = params.set('requiresAvailability', criteria.requiresAvailability.toString());
    if (criteria.requiredQuantity != null)
      params = params.set('requiredQuantity', criteria.requiredQuantity.toString());

    return this.http.get<ScoredResult[]>(`${this.apiUrl}/quick`, { params });
  }

  // ─── HELPERS UI ──────────────────────────────────────────────

  getLevelColor(level: string): string {
    switch(level) {
      case 'TOP':     return '#6366f1';
      case 'GOOD':    return '#16a34a';
      case 'AVERAGE': return '#f59e0b';
      case 'LOW':     return '#94a3b8';
      default: return '#94a3b8';
    }
  }

  getLevelLabel(level: string): string {
    switch(level) {
      case 'TOP':     return 'Parfait';
      case 'GOOD':    return 'Très bien';
      case 'AVERAGE': return 'Correct';
      case 'LOW':     return 'Partiel';
      default: return '—';
    }
  }

  getScoreGradient(score: number): string {
    if (score >= 80) return 'linear-gradient(90deg, #6366f1, #8b5cf6)';
    if (score >= 60) return 'linear-gradient(90deg, #16a34a, #22c55e)';
    if (score >= 40) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    return 'linear-gradient(90deg, #94a3b8, #cbd5e1)';
  }

  getAvailabilityText(avail: string): string {
    switch(avail) {
      case 'AVAILABLE':   return 'Disponible';
      case 'UNAVAILABLE': return 'Indisponible';
      case 'RESERVED':    return 'Réservé';
      default: return avail;
    }
  }
}