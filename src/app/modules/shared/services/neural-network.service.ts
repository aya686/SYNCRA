// src/app/modules/shared/services/neural-network.service.ts
import { Injectable, NgZone } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { DataCollectorService } from './data-collector.service';
import { PublicEvent } from '../../frontoffice/services/public-event.service';

export interface PredictionResult {
  probability: number;
  confidence: number;
  factors: {
    priceImpact: number;
    typeImpact: number;
    popularityImpact: number;
    timeImpact: number;
  };
}

@Injectable({ providedIn: 'root' })
export class NeuralNetworkService {
  private model: tf.Sequential | null = null;
  private isTrained = false;
  private trainingProgress = 0;
  private inputDim = 12;
  
  constructor(
    private dataCollector: DataCollectorService,
    private ngZone: NgZone
  ) {
    this.initModel();
  }
  
  private initModel(): void {
    this.model = tf.sequential();
    
    this.model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [this.inputDim],
      kernelInitializer: 'heNormal'
    }));
    
    this.model.add(tf.layers.dropout({ rate: 0.3 }));
    
    this.model.add(tf.layers.dense({
      units: 32,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }));
    
    this.model.add(tf.layers.dropout({ rate: 0.2 }));
    
    this.model.add(tf.layers.dense({
      units: 16,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }));
    
    this.model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));
    
    // ✅ Compiler le modèle immédiatement
    this.compileModel();
    
    console.log('🧠 Réseau de neurones initialisé');
    if (this.model) {
      this.model.summary();
    }
  }
  
  private compileModel(): void {
    if (!this.model) return;
    
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
  }
  
  async trainModel(epochs: number = 50, batchSize: number = 32): Promise<{ history: any; accuracy: number }> {
    const { features, labels } = this.dataCollector.prepareFeaturesAndLabels();
    
    if (features.length < 10) {
      console.warn('⚠️ Pas assez de données pour entraîner (minimum 10)');
      return { history: null, accuracy: 0 };
    }
    
    console.log(`📊 Entraînement sur ${features.length} exemples`);
    
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);
    
    // ✅ Vérifier que le modèle est compilé
    if (!this.model) {
      this.initModel();
    }
    
    const history = await this.model!.fit(xs, ys, {
      epochs,
      batchSize,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          this.trainingProgress = ((epoch + 1) / epochs) * 100;
          const loss = logs?.['loss']?.toFixed(4) || '?';
          const acc = ((logs?.['acc'] || 0) * 100).toFixed(1);
          console.log(`Epoch ${epoch + 1}/${epochs} - loss: ${loss} - acc: ${acc}%`);
        }
      }
    });
    
    xs.dispose();
    ys.dispose();
    
    const historyAcc = history.history['acc'];
    const finalAccuracy = historyAcc[historyAcc.length - 1] as number;
    this.isTrained = true;
    
    console.log(`✅ Modèle entraîné! Précision: ${(finalAccuracy * 100).toFixed(1)}%`);
    
    return {
      history: history.history,
      accuracy: finalAccuracy
    };
  }
  
  async predictProbability(agent: any, event: any): Promise<PredictionResult> {
    if (!this.model || !this.isTrained) {
      return this.fallbackPrediction(agent, event);
    }
    
    const features = [
      this.encodeUserType(agent.type),
      agent.budget / 1000,
      agent.comportement.priceSensitivity,
      agent.comportement.spontaneity,
      agent.comportement.loyalty,
      event.prix / 500,
      this.encodeEventType(event.type),
      1 - (event.placesDisponibles / event.capaciteMax),
      2 / 24,
      this.encodeEventCategory(event.type),
      new Date().getDay() / 7,
      new Date().getHours() / 24
    ];
    
    const inputTensor = tf.tensor2d([features]);
    const outputTensor = this.model.predict(inputTensor) as tf.Tensor;
    const probability = (await outputTensor.data())[0];
    
    inputTensor.dispose();
    outputTensor.dispose();
    
    const factors = this.explainPrediction(agent, event, probability);
    
    return {
      probability: Math.min(0.95, Math.max(0.05, probability)),
      confidence: this.calculateConfidence(probability),
      factors
    };
  }
  
  async predictBatch(agent: any, events: any[]): Promise<number[]> {
    if (!this.model || !this.isTrained || events.length === 0) {
      return events.map(e => this.calculateSimpleProbability(agent, e));
    }
    
    const featuresMatrix = events.map(event => [
      this.encodeUserType(agent.type),
      agent.budget / 1000,
      agent.comportement.priceSensitivity,
      agent.comportement.spontaneity,
      agent.comportement.loyalty,
      event.prix / 500,
      this.encodeEventType(event.type),
      1 - (event.placesDisponibles / event.capaciteMax),
      2 / 24,
      this.encodeEventCategory(event.type),
      new Date().getDay() / 7,
      new Date().getHours() / 24
    ]);
    
    const inputTensor = tf.tensor2d(featuresMatrix);
    const outputTensor = this.model.predict(inputTensor) as tf.Tensor;
    const probabilities = await outputTensor.data();
    
    inputTensor.dispose();
    outputTensor.dispose();
    
    return Array.from(probabilities).map((p: unknown) => Math.min(0.95, Math.max(0.05, p as number)));

  }
  
  async saveModel(): Promise<void> {
    if (!this.model) return;
    
    try {
      // ✅ Sauvegarde complète (architecture + poids)
      await this.model.save('indexeddb://simulation-model');
      console.log('💾 Modèle sauvegardé');
    } catch (e) {
      console.error('Erreur sauvegarde modèle:', e);
    }
  }
  
  async loadModel(): Promise<boolean> {
    try {
      // ✅ Charger le modèle avec son architecture
      const loadedModel = await tf.loadLayersModel('indexeddb://simulation-model');
      this.model = loadedModel as tf.Sequential;
      
      // ✅ RECOMPILER le modèle après chargement ! (c'est crucial)
      this.compileModel();
      
      this.isTrained = true;
      console.log('📀 Modèle chargé depuis IndexedDB et recompilé');
      return true;
    } catch (e) {
      console.log('Aucun modèle sauvegardé trouvé');
      return false;
    }
  }
  
  getTrainingStatus(): { isTrained: boolean; progress: number; dataCount: number } {
    return {
      isTrained: this.isTrained,
      progress: this.trainingProgress,
      dataCount: this.dataCollector.getTrainingCount()
    };
  }
  
  // ========== MÉTHODES PRIVÉES ==========
  
  private encodeUserType(type: string): number {
    const map: Record<string, number> = { etudiant: 0, professionnel: 0.33, curieux: 0.66, expert: 1 };
    return map[type] || 0.5;
  }
  
  private encodeEventType(type: string): number {
    const types = ['Conference', 'Atelier', 'Webinaire', 'Formation', 'Meetup', 'Workshop'];
    const index = types.indexOf(type);
    return index >= 0 ? index / types.length : 0.5;
  }
  
  private encodeEventCategory(type: string): number {
    const map: Record<string, number> = {
      'Conference': 0, 'Atelier': 0.2, 'Webinaire': 0.4,
      'Formation': 0.6, 'Meetup': 0.8, 'Workshop': 1
    };
    return map[type] || 0.5;
  }
  
  private explainPrediction(agent: any, event: any, baseProbability: number): PredictionResult['factors'] {
    const priceImpact = agent.comportement.priceSensitivity * (1 - event.prix / Math.max(1, agent.budget));
    const typeMatch = agent.preferences.includes(this.getAgentPreference(agent.type)) ? 0.8 : 0.3;
    const popularityImpact = 1 - (event.placesDisponibles / event.capaciteMax);
    const timeImpact = new Date().getHours() >= 18 ? 0.7 : 0.4;
    
    return {
      priceImpact: Math.min(1, Math.max(0, priceImpact)),
      typeImpact: typeMatch,
      popularityImpact,
      timeImpact
    };
  }
  
  private calculateConfidence(probability: number): number {
    if (probability > 0.8 || probability < 0.2) return 0.9;
    if (probability > 0.6 || probability < 0.4) return 0.7;
    return 0.5;
  }
  
  private fallbackPrediction(agent: any, event: any): PredictionResult {
    const probability = this.calculateSimpleProbability(agent, event);
    return {
      probability,
      confidence: 0.5,
      factors: {
        priceImpact: 0.5,
        typeImpact: 0.5,
        popularityImpact: 0.5,
        timeImpact: 0.5
      }
    };
  }
  
  private calculateSimpleProbability(agent: any, event: any): number {
    const prefMatch = agent.preferences.includes(this.getAgentPreference(agent.type)) ? 1 : 0.3;
    const priceFactor = 1 - (agent.comportement.priceSensitivity * (event.prix / Math.max(1, agent.budget)));
    const popularityFactor = 1 - (event.placesDisponibles / event.capaciteMax);
    
    return prefMatch * 0.4 + priceFactor * 0.3 + popularityFactor * 0.3;
  }
  
  private getAgentPreference(type: string): string {
    const map: Record<string, string> = {
      etudiant: 'tech',
      professionnel: 'business',
      curieux: 'art',
      expert: 'science'
    };
    return map[type] || 'business';
  }

  // neural-network.service.ts

private calculatePopularity(event: PublicEvent): number {
  // ✅ PRIORITÉ à la popularité réelle (depuis la base de données)
  if (event.populariteReelle !== undefined && event.populariteReelle > 0) {
    return event.populariteReelle;
  }
  
  // ✅ Fallback : basé sur les places disponibles
  const ratio = 1 - (event.placesDisponibles / event.capaciteMax);
  if (ratio > 0) {
    return ratio;
  }
  
  // ✅ Fallback final : basé sur des indicateurs
  let fallback = 0.2;
  if (event.prix === 0) fallback += 0.2;
  if (event.type === 'Webinaire') fallback += 0.15;
  if (event.type === 'Workshop') fallback += 0.1;
  
  return Math.min(0.8, fallback);
}
}