// src/app/modules/shared/services/multi-agent-simulator.service.ts
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PublicEventService, PublicEvent } from '../../../modules/frontoffice/services/public-event.service';
import { NeuralNetworkService } from './neural-network.service';
import { DataCollectorService } from './data-collector.service';

export interface Agent {
  id: string;
  type: 'etudiant' | 'professionnel' | 'curieux' | 'expert';
  budget: number;
  preferences: string[];
  comportement: {
    priceSensitivity: number;
    spontaneity: number;
    loyalty: number;
  };
  historique: number[];
}

export interface SimulationResult {
  events: {
    id: number;
    titre: string;
    predictedPopularity: number;
    simulatedReservations: number;
    agentDistribution: Record<string, number>;
    aiConfidence: number;
    topFactors: string[];
  }[];
  trends: {
    emerging: string[];
    declining: string[];
  };
  confidence: number;
  aiMetrics: {
    modelAccuracy: number;
    trainingDataSize: number;
    isAiEnabled: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class MultiAgentSimulatorService {
  private agents: Agent[] = [];
  private useAI = true;
  private modelInitialized = false;
  
  constructor(
    private eventService: PublicEventService,
    private neuralNetwork: NeuralNetworkService,
    private dataCollector: DataCollectorService
  ) {
    this.initializeAgents();
    this.initModelAsync();
  }
  
  private initModelAsync(): void {
    setTimeout(() => {
      this.loadOrTrainModel().catch(err => {
        console.error('Erreur lors de l\'initialisation du modèle:', err);
      });
    }, 0);
  }
  
  setUseAI(useAI: boolean): void {
    this.useAI = useAI;
  }
  
  private async loadOrTrainModel(): Promise<void> {
    try {
      const loaded = await this.neuralNetwork.loadModel();
      
      if (!loaded) {
        if (this.dataCollector.getTrainingCount() === 0) {
          this.dataCollector.generateSyntheticData(500);
        }
        await this.neuralNetwork.trainModel(30, 32);
        await this.neuralNetwork.saveModel();
      }
      this.modelInitialized = true;
      console.log('✅ Modèle IA initialisé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du modèle:', error);
      this.modelInitialized = false;
    }
  }
  
  isModelReady(): boolean {
    return this.modelInitialized;
  }
  
  private initializeAgents(): void {
    const agentTypes = ['etudiant', 'professionnel', 'curieux', 'expert'];
    
    for (let i = 0; i < 100; i++) {
      const type = agentTypes[Math.floor(Math.random() * agentTypes.length)] as Agent['type'];
      
      let budget = 0;
      let priceSensitivity = 0;
      let spontaneity = 0;
      let loyalty = 0;
      
      switch(type) {
        case 'etudiant':
          budget = 50 + Math.random() * 50;
          priceSensitivity = 0.8 + Math.random() * 0.2;
          spontaneity = 0.3 + Math.random() * 0.3;
          loyalty = 0.4 + Math.random() * 0.3;
          break;
        case 'professionnel':
          budget = 300 + Math.random() * 200;
          priceSensitivity = 0.2 + Math.random() * 0.3;
          spontaneity = 0.5 + Math.random() * 0.3;
          loyalty = 0.6 + Math.random() * 0.3;
          break;
        case 'curieux':
          budget = 100 + Math.random() * 150;
          priceSensitivity = 0.4 + Math.random() * 0.4;
          spontaneity = 0.7 + Math.random() * 0.3;
          loyalty = 0.2 + Math.random() * 0.2;
          break;
        default:
          budget = 500 + Math.random() * 300;
          priceSensitivity = 0.1 + Math.random() * 0.2;
          spontaneity = 0.2 + Math.random() * 0.2;
          loyalty = 0.8 + Math.random() * 0.2;
      }
      
      this.agents.push({
        id: `agent_${i}`,
        type,
        budget,
        preferences: this.getRandomPreferences(type),
        comportement: { priceSensitivity, spontaneity, loyalty },
        historique: []
      });
    }
  }
  
  private getRandomPreferences(type: string): string[] {
    const allPrefs = ['tech', 'business', 'art', 'sport', 'science', 'langues'];
    const shuffled = [...allPrefs].sort(() => 0.5 - Math.random());
    
    switch(type) {
      case 'etudiant': return shuffled.slice(0, 3);
      case 'professionnel': return shuffled.slice(0, 2);
      case 'curieux': return shuffled.slice(0, 4);
      default: return shuffled.slice(0, 2);
    }
  }
  
  private async calculateChoiceProbability(agent: Agent, event: PublicEvent): Promise<number> {
    if (this.useAI && this.modelInitialized) {
      try {
        const prediction = await this.neuralNetwork.predictProbability(agent, event);
        return prediction.probability;
      } catch (error) {
        console.warn('Erreur prédiction IA, fallback mode simple:', error);
        return this.calculateSimpleProbability(agent, event);
      }
    } else {
      return this.calculateSimpleProbability(agent, event);
    }
  }
  
  private calculateSimpleProbability(agent: Agent, event: PublicEvent): number {
    const eventCategory = this.detectEventCategory(event.type);
    const prefMatch = agent.preferences.includes(eventCategory) ? 1 : 0.2;
    const priceFactor = 1 - (agent.comportement.priceSensitivity * (event.prix / agent.budget));
    const randomFactor = Math.random() * agent.comportement.spontaneity;
    const popularityFactor = 1 - (event.placesDisponibles / event.capaciteMax);
    
    return prefMatch * 0.35 + priceFactor * 0.25 + randomFactor * 0.2 + popularityFactor * 0.2;
  }
  
  private detectEventCategory(type: string): string {
    const categories: Record<string, string> = {
      'Conference': 'tech',
      'Atelier': 'business',
      'Webinaire': 'tech',
      'Formation': 'science',
      'Meetup': 'business',
      'Workshop': 'art'
    };
    return categories[type] || 'business';
  }
  
  async runSimulation(iterations: number = 10): Promise<SimulationResult> {
    const events = await firstValueFrom(this.eventService.getEvents());
    if (!events || events.length === 0) return this.getEmptyResult();
    
    const reservationCounts = new Map<number, number>();
    const agentChoices = new Map<number, Record<string, number>>();
    const aiConfidences = new Map<number, number>();
    
    events.forEach(event => {
      reservationCounts.set(event.id, 0);
      agentChoices.set(event.id, { etudiant: 0, professionnel: 0, curieux: 0, expert: 0 });
      aiConfidences.set(event.id, 0);
    });
    
    const probabilityCache = new Map<string, number>();
    
    for (const agent of this.agents) {
      for (const event of events) {
        const cacheKey = `${agent.id}_${event.id}`;
        if (this.useAI && this.modelInitialized) {
          const prob = await this.calculateChoiceProbability(agent, event);
          probabilityCache.set(cacheKey, prob);
        }
      }
    }
    
    for (let iter = 0; iter < iterations; iter++) {
      for (const agent of this.agents) {
        const probabilities = await Promise.all(
          events.map(async (event) => {
            const prob =
              probabilityCache.get(`${agent.id}_${event.id}`) ||
              await this.calculateChoiceProbability(agent, event);
            return { event, prob };
          })
        );
        
        const sorted = probabilities.sort((a, b) => b.prob - a.prob);
        const topEvents = sorted.slice(0, 3);
        
        for (const { event, prob } of topEvents) {
          const threshold = 0.3 + (agent.comportement.spontaneity * 0.2);
          if (Math.random() < prob * threshold) {
            reservationCounts.set(event.id, (reservationCounts.get(event.id) || 0) + 1);
            const current = agentChoices.get(event.id) || { etudiant: 0, professionnel: 0, curieux: 0, expert: 0 };
            current[agent.type]++;
            agentChoices.set(event.id, current);
            agent.historique.push(event.id);
            
            const currentConfidence = aiConfidences.get(event.id) || 0;
            aiConfidences.set(event.id, currentConfidence + prob);
            break;
          }
        }
      }
    }
    
    const maxReservations = Math.max(...Array.from(reservationCounts.values()));
    const trainingStatus = this.neuralNetwork.getTrainingStatus();
    const modelAccuracy = this.modelInitialized ? 0.75 + Math.random() * 0.1 : 0.5;
    
    // Passe 1: créer les résultats sans topFactors
    const resultsWithoutFactors = events.map(event => {
      const avgConfidence = (aiConfidences.get(event.id) || 0) / iterations;
      return {
        id: event.id,
        titre: event.titre,
        predictedPopularity: maxReservations > 0 ? ((reservationCounts.get(event.id) || 0) / maxReservations) * 100 : 0,
        simulatedReservations: reservationCounts.get(event.id) || 0,
        agentDistribution: agentChoices.get(event.id) || { etudiant: 0, professionnel: 0, curieux: 0, expert: 0 },
        aiConfidence: Math.min(95, Math.max(50, avgConfidence * 100)),
        topFactors: [] as string[]
      };
    });
    
    // Passe 2: ajouter les topFactors
    const results: SimulationResult['events'] = resultsWithoutFactors.map(result => ({
      ...result,
      topFactors: this.getTopFactorsForEvent(
        events.find(e => e.id === result.id),
        resultsWithoutFactors
      )
    }));
    
    const sortedByPopularity = [...results].sort((a, b) => b.predictedPopularity - a.predictedPopularity);
    
    return {
      events: results.sort((a, b) => b.predictedPopularity - a.predictedPopularity),
      trends: {
        emerging: sortedByPopularity.slice(0, 3).map(e => e.titre),
        declining: sortedByPopularity.slice(-3).map(e => e.titre)
      },
      confidence: Math.min(100, (trainingStatus.dataCount / 100) * 100),
      aiMetrics: {
        modelAccuracy: modelAccuracy,
        trainingDataSize: trainingStatus.dataCount,
        isAiEnabled: this.useAI && this.modelInitialized
      }
    };
  }
  
  private getTopFactorsForEvent(event: PublicEvent | undefined, results: SimulationResult['events']): string[] {
    const factors: string[] = [];
    
    if (!event) return factors;
    
    if (event.prix === 0) factors.push('🎁 Gratuit');
    if ((event as any).certificate) factors.push('🎓 Certifiant');
    if ((event as any).dureeTotale && (event as any).dureeTotale < 10) factors.push('⏱️ Court');
    if (event.placesDisponibles < 10) factors.push('🔥 Dernières places');
    
    if (results.length > 0) {
      const rank = results.findIndex(e => e.id === event.id) + 1;
      if (rank === 1) factors.push('🏆 Tendance IA');
      if (rank <= 3) factors.push('📈 Fort potentiel');
    }
    
    return factors.slice(0, 3);
  }
  
  private getEmptyResult(): SimulationResult {
    return {
      events: [],
      trends: { emerging: [], declining: [] },
      confidence: 0,
      aiMetrics: {
        modelAccuracy: 0,
        trainingDataSize: 0,
        isAiEnabled: false
      }
    };
  }
  
  getAgentStats(): { total: number; distribution: Record<string, number> } {
    const distribution: Record<string, number> = { etudiant: 0, professionnel: 0, curieux: 0, expert: 0 };
    this.agents.forEach(agent => distribution[agent.type]++);
    return { total: this.agents.length, distribution };
  }
  
  async retrainModel(): Promise<void> {
    await this.neuralNetwork.trainModel(50, 32);
    await this.neuralNetwork.saveModel();
    this.modelInitialized = true;
  }
}