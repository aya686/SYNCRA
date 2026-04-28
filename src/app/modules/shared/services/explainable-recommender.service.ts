// services/explainable-recommender.service.ts
import { Injectable } from '@angular/core';
import { PublicEventService, PublicEvent } from '../../../modules/frontoffice/services/public-event.service';
export interface Explanation {
  eventId: number;
  eventTitle: string;
  score: number;
  reasons: {
    factor: string;
    contribution: number;
    explanation: string;
    icon: string;
  }[];
  summary: string;
  confidence: number;
}

@Injectable({ providedIn: 'root' })
export class ExplainableRecommenderService {
  constructor(private eventService: PublicEventService) {}

  /**
   * Recommande un événement avec explications détaillées
   */
  async explainRecommendation(userContext: any, eventId: number): Promise<Explanation> {
    const events = await this.eventService.getEvents().toPromise();
    const event = events?.find(e => e.id === eventId);
    
    if (!event) throw new Error('Événement non trouvé');
    
    const factors = await this.analyzeFactors(event, userContext);
    const totalScore = factors.reduce((sum, f) => sum + f.contribution, 0);
    
    return {
      eventId: event.id,
      eventTitle: event.titre,
      score: Math.round(totalScore * 100),
      reasons: factors,
      summary: this.generateSummary(factors, event),
      confidence: this.calculateConfidence(factors)
    };
  }

  private async analyzeFactors(event: PublicEvent, userContext: any): Promise<Explanation['reasons']> {
    const factors = [];
    
    // 1. Facteur prix
    let priceContribution = 0;
    let priceExplanation = '';
    if (event.prix === 0) {
      priceContribution = 0.35;
      priceExplanation = 'Cet événement est GRATUIT, ce qui le rend très accessible';
    } else if (event.prix < 50) {
      priceContribution = 0.25;
      priceExplanation = `Prix abordable (${event.prix}€) comparé à la moyenne`;
    } else if (event.prix < 150) {
      priceContribution = 0.15;
      priceExplanation = `Prix dans la moyenne du marché (${event.prix}€)`;
    } else {
      priceContribution = 0.05;
      priceExplanation = `Prix élevé (${event.prix}€), peut limiter l'accessibilité`;
    }
    factors.push({ factor: '💰 Prix', contribution: priceContribution, explanation: priceExplanation, icon: '💰' });
    
    // 2. Facteur popularité
    const popularity = 1 - (event.placesDisponibles / event.capaciteMax);
    let popContribution = popularity * 0.25;
    let popExplanation = '';
    if (popularity > 0.8) {
      popExplanation = 'Très demandé ! Plus de 80% des places sont déjà réservées';
    } else if (popularity > 0.5) {
      popExplanation = 'Populaire : plus de la moitié des places sont prises';
    } else if (popularity > 0.2) {
      popExplanation = 'Popularité modérée, encore beaucoup de places disponibles';
    } else {
      popExplanation = 'Peu de réservations pour le moment, c\'est le moment de découvrir !';
    }
    factors.push({ factor: '📊 Popularité', contribution: popContribution, explanation: popExplanation, icon: '📊' });
    
    // 3. Facteur date
    const daysUntil = Math.ceil((event.dateDebut.getTime() - Date.now()) / (1000 * 3600 * 24));
    let dateContribution = 0;
    let dateExplanation = '';
    if (daysUntil <= 3) {
      dateContribution = 0.3;
      dateExplanation = `Dans ${daysUntil} jours ! Bientôt, ne manquez pas cette opportunité`;
    } else if (daysUntil <= 7) {
      dateContribution = 0.2;
      dateExplanation = `La semaine prochaine (dans ${daysUntil} jours) - parfait pour s'organiser`;
    } else if (daysUntil <= 30) {
      dateContribution = 0.1;
      dateExplanation = `Dans ${daysUntil} jours, vous avez le temps de planifier`;
    } else {
      dateContribution = 0.05;
      dateExplanation = `Événement dans ${daysUntil} jours, pensez à l'ajouter à vos favoris`;
    }
    factors.push({ factor: '📅 Proximité', contribution: dateContribution, explanation: dateExplanation, icon: '📅' });
    
    // 4. Facteur lieu
    let lieuContribution = 0.1;
    let lieuExplanation = `Lieu: ${event.lieu} - accessible et bien situé`;
    factors.push({ factor: '📍 Accessibilité', contribution: lieuContribution, explanation: lieuExplanation, icon: '📍' });
    
    // 5. Facteur type
    let typeContribution = 0.15;
    let typeExplanation = `Type: ${event.type} - correspond aux tendances actuelles`;
    factors.push({ factor: '🏷️ Catégorie', contribution: typeContribution, explanation: typeExplanation, icon: '🏷️' });
    
    return factors;
  }

  private generateSummary(factors: Explanation['reasons'], event: PublicEvent): string {
    const topFactors = [...factors].sort((a, b) => b.contribution - a.contribution).slice(0, 2);
    
    if (event.prix === 0) {
      return `🎉 ${event.titre} est GRATUIT et très populaire ! ${topFactors[0].explanation.toLowerCase()}`;
    }
    
    return `✨ ${event.titre} est recommandé car ${topFactors[0].explanation.toLowerCase()} et ${topFactors[1]?.explanation.toLowerCase() || 'il correspond à vos critères'}.`;
  }

  private calculateConfidence(factors: Explanation['reasons']): number {
    const total = factors.reduce((sum, f) => sum + f.contribution, 0);
    return Math.min(95, Math.round(total * 100));
  }

  /**
   * Génère une carte de décision visuelle
   */
  generateDecisionTree(event: PublicEvent): any {
    return {
      type: 'root',
      name: event.titre,
      children: [
        {
          type: 'branch',
          name: '💰 Prix',
          value: event.prix,
          decision: event.prix === 0 ? 'TRÈS BON' : event.prix < 50 ? 'BON' : 'MOYEN',
          children: []
        },
        {
          type: 'branch',
          name: '📊 Popularité',
          value: `${((1 - event.placesDisponibles / event.capaciteMax) * 100).toFixed(0)}%`,
          decision: (1 - event.placesDisponibles / event.capaciteMax) > 0.6 ? 'ÉLEVÉE' : 'MODÉRÉE',
          children: []
        },
        {
          type: 'branch',
          name: '📅 Date',
          value: event.dateDebut.toLocaleDateString(),
          decision: 'À VENIR',
          children: []
        }
      ]
    };
  }
}