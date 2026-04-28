// src/app/modules/frontoffice/services/similarity-engine.service.ts
import { Injectable } from '@angular/core';
import { PublicEventService, PublicEvent } from './public-event.service';
import { PublicFormationService, PublicFormation } from './public-formation.service';

export interface SimilarItem {
  id: number;
  titre: string;
  similarity: number;
  type: 'event' | 'formation';
  imageUrl?: string;
  prix: number;
  lieu?: string;
  niveau?: string;
}

@Injectable({ providedIn: 'root' })
export class SimilarityEngineService {
  private allEvents: PublicEvent[] = [];
  private allFormations: PublicFormation[] = [];

  constructor(
    private eventService: PublicEventService,
    private formationService: PublicFormationService
  ) {
    this.loadData();
  }

  private loadData() {
    this.eventService.getEvents().subscribe(events => this.allEvents = events);
    this.formationService.getFormations().subscribe(formations => this.allFormations = formations);
  }

  /**
   * Crée un vecteur de caractéristiques pour un événement
   */
  private createEventFeatureVector(event: PublicEvent): number[] {
    // Vecteur: [type_encode, prix_normalisé, capacite_normalisée, popularité]
    const typeMap: Record<string, number> = { 'Conference': 1, 'Atelier': 2, 'Webinaire': 3, 'Formation': 4 };
    return [
      typeMap[event.type] || 0,
      Math.min(event.prix / 1000, 1),
      Math.min(event.capaciteMax / 500, 1),
      event.placesDisponibles / event.capaciteMax
    ];
  }

  /**
   * Calcule la similarité cosinus entre deux vecteurs
   * Formule: cos(θ) = (A·B) / (||A|| × ||B||)
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Trouve les K événements les plus similaires (Algorithme KNN)
   */
  findSimilarEvents(eventId: number, k: number = 4): SimilarItem[] {
    const targetEvent = this.allEvents.find(e => e.id === eventId);
    if (!targetEvent) return [];

    const targetVector = this.createEventFeatureVector(targetEvent);
    
    const similarities = this.allEvents
      .filter(e => e.id !== eventId)
      .map(event => ({
        id: event.id,
        titre: event.titre,
        similarity: this.cosineSimilarity(targetVector, this.createEventFeatureVector(event)),
        type: 'event' as const,
        imageUrl: event.imageUrl,
        prix: event.prix,
        lieu: event.lieu
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);

    return similarities;
  }

  /**
   * Trouve les K formations les plus similaires
   */
  findSimilarFormations(formationId: number, k: number = 4): SimilarItem[] {
    const targetFormation = this.allFormations.find(f => f.id === formationId);
    if (!targetFormation) return [];

    // Vecteur: [niveau_encode, prix_normalisé, duree_normalisée, certificate]
    const niveauMap: Record<string, number> = { 'debutant': 1, 'intermediaire': 2, 'avance': 3 };
    
    const targetVector = [
      niveauMap[targetFormation.niveau?.toLowerCase()] || 1,
      Math.min(targetFormation.prix / 2000, 1),
      Math.min(targetFormation.dureeTotale / 100, 1),
      targetFormation.certificate ? 1 : 0
    ];

    const similarities = this.allFormations
      .filter(f => f.id !== formationId)
      .map(formation => ({
        id: formation.id,
        titre: formation.titre,
        similarity: this.cosineSimilarity(targetVector, [
          niveauMap[formation.niveau?.toLowerCase()] || 1,
          Math.min(formation.prix / 2000, 1),
          Math.min(formation.dureeTotale / 100, 1),
          formation.certificate ? 1 : 0
        ]),
        type: 'formation' as const,
        prix: formation.prix,
        niveau: formation.niveau
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);

    return similarities;
  }

  /**
   * Recommandation croisée: événements similaires à une formation
   */
  findEventsSimilarToFormation(formationId: number, k: number = 4): SimilarItem[] {
    const formation = this.allFormations.find(f => f.id === formationId);
    if (!formation) return [];

    const formationVector = [
      Math.min(formation.prix / 2000, 1),
      formation.certificate ? 1 : 0,
      Math.min(formation.dureeTotale / 100, 1)
    ];

    return this.allEvents
      .map(event => ({
        id: event.id,
        titre: event.titre,
        similarity: this.cosineSimilarity(formationVector, [
          Math.min(event.prix / 2000, 1),
          event.type === 'Formation' ? 1 : 0,
          Math.min((event.capaciteMax || 50) / 200, 1)
        ]),
        type: 'event' as const,
        imageUrl: event.imageUrl,
        prix: event.prix,
        lieu: event.lieu
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }
}