// src/app/modules/frontoffice/services/popularity-forecast.service.ts
import { Injectable } from '@angular/core';
import { PublicEventService, PublicEvent } from './public-event.service';
import { PublicFormationService, PublicFormation } from './public-formation.service';

export interface ForecastPoint {
  date: Date;
  value: number;
  isPrediction: boolean;
  confidenceLower?: number;
  confidenceUpper?: number;
}

export interface ForecastResult {
  historical: ForecastPoint[];
  forecast: ForecastPoint[];
  trend: '📈 HAUSSE' | '📉 BAISSE' | '➡️ STABLE';
  growthRate: number;
  nextMonthPrediction: number;
}

@Injectable({ providedIn: 'root' })
export class PopularityForecastService {
  constructor(
    private eventService: PublicEventService,
    private formationService: PublicFormationService
  ) {}

  /**
   * Génère des données historiques simulées basées sur le nombre de places disponibles
   * Plus les places sont rares, plus la popularité est élevée
   */
  private generateHistoricalData(item: any, type: 'event' | 'formation', months: number = 12): number[] {
    const data: number[] = [];
    const basePopularity = type === 'event' 
      ? (1 - (item.placesDisponibles / item.capaciteMax)) * 100
      : (item.prix > 0 ? 60 : 80);
    
    // Ajouter une tendance saisonnière et du bruit
    for (let i = 0; i < months; i++) {
      let value = basePopularity;
      // Saisonnalité (été = +20%, hiver = -10%)
      const seasonality = Math.sin(i * Math.PI / 6) * 15;
      // Tendance aléatoire
      const trend = Math.random() * 10 - 5;
      // Bruit
      const noise = Math.random() * 10 - 5;
      
      value += seasonality + trend + noise;
      data.push(Math.max(5, Math.min(100, Math.round(value))));
    }
    
    return data;
  }

  /**
   * Algorithme Holt-Winters (Triple Exponential Smoothing)
   * Prédit la popularité future avec prise en compte de la tendance et saisonnalité
   */
  private holtWinters(data: number[], seasonLength: number = 12, forecastPeriods: number = 3): {
    forecast: number[];
    level: number[];
    trend: number[];
    seasonal: number[];
  } {
    const n = data.length;
    const alpha = 0.3;      // Niveau
    const beta = 0.1;       // Tendance
    const gamma = 0.2;      // Saisonnalité
    
    // Initialisation
    let level: number[] = new Array(n);
    let trend: number[] = new Array(n);
    let seasonal: number[] = new Array(n + forecastPeriods);
    
    // Initialiser les composantes saisonnières
    const seasonalInit: number[] = [];
    for (let i = 0; i < seasonLength; i++) {
      seasonalInit.push(data[i] / (data.reduce((a, b) => a + b, 0) / n));
    }
    
    level[0] = data[0];
    trend[0] = (data[1] - data[0]) / seasonLength;
    
    for (let i = 0; i < seasonLength; i++) {
      seasonal[i] = seasonalInit[i];
    }
    
    // Application de l'algorithme
    for (let i = 1; i < n; i++) {
      const prevLevel = level[i-1];
      const prevTrend = trend[i-1];
      const prevSeasonal = seasonal[i - seasonLength];
      
      level[i] = alpha * (data[i] / prevSeasonal) + (1 - alpha) * (prevLevel + prevTrend);
      trend[i] = beta * (level[i] - prevLevel) + (1 - beta) * prevTrend;
      seasonal[i] = gamma * (data[i] / level[i]) + (1 - gamma) * prevSeasonal;
    }
    
    // Prédictions futures
    const forecast: number[] = [];
    for (let i = 0; i < forecastPeriods; i++) {
      const h = i + 1;
      const pred = (level[n-1] + h * trend[n-1]) * seasonal[n - seasonLength + (h % seasonLength)];
      forecast.push(Math.max(0, Math.min(100, Math.round(pred))));
    }
    
    return { forecast, level, trend, seasonal };
  }

  /**
   * Prédit la popularité d'un événement
   */
  predictEventPopularity(eventId: number, months: number = 3): ForecastResult {
    const event = this.eventService.getEvents().subscribe(events => {
      const found = events.find(e => e.id === eventId);
      if (!found) return null;
      return found;
    });
    
    // Simuler des données historiques
    const historicalData = this.generateHistoricalData({ placesDisponibles: 20, capaciteMax: 100 }, 'event', 12);
    
    const result = this.holtWinters(historicalData, 12, months);
    const lastValue = historicalData[historicalData.length - 1];
    const trend = result.forecast[result.forecast.length - 1] - lastValue;
    
    return {
      historical: historicalData.map((v, i) => ({
        date: new Date(2024, i, 1),
        value: v,
        isPrediction: false
      })),
      forecast: result.forecast.map((v, i) => ({
        date: new Date(2024, 12 + i, 1),
        value: v,
        isPrediction: true,
        confidenceLower: Math.max(0, v - 15),
        confidenceUpper: Math.min(100, v + 15)
      })),
      trend: trend > 5 ? '📈 HAUSSE' : trend < -5 ? '📉 BAISSE' : '➡️ STABLE',
      growthRate: Math.round(Math.abs(trend / lastValue * 100)),
      nextMonthPrediction: result.forecast[0]
    };
  }

  /**
   * Prédit la popularité d'une formation
   */
  predictFormationPopularity(formationId: number, months: number = 3): ForecastResult {
    const historicalData = this.generateHistoricalData({ prix: 100 }, 'formation', 12);
    const result = this.holtWinters(historicalData, 12, months);
    const lastValue = historicalData[historicalData.length - 1];
    const trend = result.forecast[result.forecast.length - 1] - lastValue;
    
    return {
      historical: historicalData.map((v, i) => ({
        date: new Date(2024, i, 1),
        value: v,
        isPrediction: false
      })),
      forecast: result.forecast.map((v, i) => ({
        date: new Date(2024, 12 + i, 1),
        value: v,
        isPrediction: true,
        confidenceLower: Math.max(0, v - 15),
        confidenceUpper: Math.min(100, v + 15)
      })),
      trend: trend > 5 ? '📈 HAUSSE' : trend < -5 ? '📉 BAISSE' : '➡️ STABLE',
      growthRate: Math.round(Math.abs(trend / lastValue * 100)),
      nextMonthPrediction: result.forecast[0]
    };
  }

  /**
   * Obtenir les top formations/événements les plus populaires
   */
  getTopPopularItems(limit: number = 6): { events: any[]; formations: any[] } {
    // Cette méthode sera implémentée avec les données réelles
    return { events: [], formations: [] };
  }
}