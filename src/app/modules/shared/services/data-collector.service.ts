// src/app/modules/shared/services/data-collector.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { PublicEvent } from '../../../modules/frontoffice/services/public-event.service';

export interface TrainingExample {
  id: string;
  timestamp: Date;
  features: {
    userType: 'etudiant' | 'professionnel' | 'curieux' | 'expert';
    userBudget: number;
    userPriceSensitivity: number;
    userSpontaneity: number;
    userLoyalty: number;
    eventPrice: number;
    eventType: string;
    eventPopularity: number;
    eventDuration: number;
    eventCategory: string;
    dayOfWeek: number;
    hourOfDay: number;
    isWeekend: number;
    didChoose: number;
  };
}

@Injectable({ providedIn: 'root' })
export class DataCollectorService {
  private trainingData: TrainingExample[] = [];
  private apiUrl = 'http://localhost:8089/event_db/api/training-data';
  
  constructor(private http: HttpClient) {
    this.loadFromBackend();
  }
  
  /**
   * ✅ Charge les données depuis MySQL (via Spring Boot)
   */
  async loadFromBackend(): Promise<void> {
    try {
      const data = await lastValueFrom(this.http.get<any[]>(this.apiUrl));
      this.trainingData = data.map(item => ({
        id: item.id.toString(),
        timestamp: new Date(item.createdAt),
        features: {
          userType: item.userType,
          userBudget: item.userBudget,
          userPriceSensitivity: item.userPriceSensitivity || 0.5,
          userSpontaneity: item.userSpontaneity || 0.5,
          userLoyalty: item.userLoyalty || 0.5,
          eventPrice: item.eventPrice,
          eventType: item.eventType,
          eventPopularity: item.eventPopularity || 0,
          eventDuration: 2,
          eventCategory: this.getEventCategory(item.eventType),
          dayOfWeek: new Date(item.createdAt).getDay(),
          hourOfDay: new Date(item.createdAt).getHours(),
          isWeekend: new Date(item.createdAt).getDay() >= 6 ? 1 : 0,
          didChoose: item.didChoose ? 1 : 0
        }
      }));
      console.log(`📀 ${this.trainingData.length} données chargées depuis MySQL`);
    } catch (error) {
      console.error('Erreur chargement depuis MySQL:', error);
      // Fallback: données synthétiques
      if (this.trainingData.length === 0) {
        this.generateSyntheticData(200);
      }
    }
  }
  
  /**
   * ✅ Enregistre une interaction dans MySQL
   */
  // data-collector.service.ts - Ajoutez des logs pour déboguer

async recordInteraction(
  user: any,
  event: any,
  didChoose: boolean,
  interactionType: 'click' | 'view' | 'register' | 'favorite'
): Promise<void> {
  console.log('📝 recordInteraction appelé avec:', {
    userType: user.type,
    eventId: event.id,
    eventTitle: event.titre,
    didChoose,
    interactionType
  });
  
  const trainingData = {
    userType: user.type,
    userBudget: user.budget,
    userPriceSensitivity: user.comportement?.priceSensitivity || 0.5,
    userSpontaneity: user.comportement?.spontaneity || 0.5,
    userLoyalty: user.comportement?.loyalty || 0.5,
    eventId: event.id,
    eventPrice: event.prix,
    eventType: event.type,
    eventPopularity: event.populariteReelle || 0,
    didChoose: didChoose,
    interactionType: interactionType
  };
  
  console.log('📤 Envoi au backend:', trainingData);
  
  try {
    const response = await lastValueFrom(this.http.post(this.apiUrl, trainingData));
    console.log('✅ Réponse backend:', response);
  } catch (error) {
    console.error('❌ Erreur backend:', error);
  }
}
  
  private addToLocalCache(user: any, event: PublicEvent, didChoose: boolean, interactionType: string): void {
    const example: TrainingExample = {
      id: `${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      features: {
        userType: user.type,
        userBudget: user.budget,
        userPriceSensitivity: user.comportement?.priceSensitivity || 0.5,
        userSpontaneity: user.comportement?.spontaneity || 0.5,
        userLoyalty: user.comportement?.loyalty || 0.5,
        eventPrice: event.prix,
        eventType: event.type,
        eventPopularity: event.populariteReelle || 0,
        eventDuration: 2,
        eventCategory: this.getEventCategory(event.type),
        dayOfWeek: new Date().getDay(),
        hourOfDay: new Date().getHours(),
        isWeekend: new Date().getDay() >= 6 ? 1 : 0,
        didChoose: didChoose ? 1 : 0
      }
    };
    this.trainingData.push(example);
  }
  
  getTrainingData(): TrainingExample[] {
    return this.trainingData;
  }
  
  prepareFeaturesAndLabels(): { features: number[][]; labels: number[][] } {
    const features: number[][] = [];
    const labels: number[][] = [];
    
    for (const example of this.trainingData) {
      const featureVector = [
        this.encodeUserType(example.features.userType),
        example.features.userBudget / 1000,
        example.features.userPriceSensitivity,
        example.features.userSpontaneity,
        example.features.userLoyalty,
        example.features.eventPrice / 500,
        this.encodeEventType(example.features.eventType),
        example.features.eventPopularity,
        example.features.eventDuration / 24,
        this.encodeEventCategory(example.features.eventCategory),
        example.features.dayOfWeek / 7,
        example.features.hourOfDay / 24
      ];
      
      features.push(featureVector);
      labels.push([example.features.didChoose]);
    }
    
    return { features, labels };
  }
  
  getTrainingCount(): number {
    return this.trainingData.length;
  }
  
  async getStats(): Promise<{ total: number; positive: number; negative: number; byUserType: any }> {
    try {
      const stats = await lastValueFrom(this.http.get<any>(`${this.apiUrl}/stats`));
      return {
        total: stats.total,
        positive: stats.positiveChoices,
        negative: stats.negativeChoices,
        byUserType: { etudiant: 0, professionnel: 0, curieux: 0, expert: 0 }
      };
    } catch (error) {
      const positive = this.trainingData.filter(d => d.features.didChoose === 1).length;
      return {
        total: this.trainingData.length,
        positive,
        negative: this.trainingData.length - positive,
        byUserType: { etudiant: 0, professionnel: 0, curieux: 0, expert: 0 }
      };
    }
  }
  
  generateSyntheticData(count: number = 200): void {
    const userTypes = ['etudiant', 'professionnel', 'curieux', 'expert'] as const;
    const eventTypes = ['Conference', 'Atelier', 'Webinaire', 'Formation', 'Meetup', 'Workshop'];
    
    for (let i = 0; i < count; i++) {
      const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      let didChoose = false;
      if (userType === 'etudiant') didChoose = Math.random() < 0.6;
      else if (userType === 'professionnel') didChoose = Math.random() < 0.7 && eventType === 'Conference';
      else if (userType === 'curieux') didChoose = Math.random() < 0.8;
      else didChoose = Math.random() < 0.9 && eventType === 'Workshop';
      
      this.trainingData.push({
        id: `synthetic_${i}`,
        timestamp: new Date(),
        features: {
          userType,
          userBudget: userType === 'etudiant' ? 50 + Math.random() * 50 : 300 + Math.random() * 200,
          userPriceSensitivity: userType === 'etudiant' ? 0.8 : 0.3,
          userSpontaneity: userType === 'curieux' ? 0.8 : 0.4,
          userLoyalty: userType === 'expert' ? 0.8 : 0.4,
          eventPrice: Math.random() * 200,
          eventType,
          eventPopularity: Math.random(),
          eventDuration: 2,
          eventCategory: this.getEventCategory(eventType),
          dayOfWeek: Math.floor(Math.random() * 7),
          hourOfDay: 9 + Math.floor(Math.random() * 12),
          isWeekend: Math.random() > 0.7 ? 1 : 0,
          didChoose: didChoose ? 1 : 0
        }
      });
    }
    console.log(`🎲 ${count} données synthétiques générées (fallback)`);
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
  
  private encodeEventCategory(category: string): number {
    const categories = ['tech', 'business', 'art', 'sport', 'science', 'langues'];
    const index = categories.indexOf(category);
    return index >= 0 ? index / categories.length : 0.5;
  }
  
  private getEventCategory(type: string): string {
    const map: Record<string, string> = {
      'Conference': 'tech',
      'Atelier': 'business',
      'Webinaire': 'tech',
      'Formation': 'science',
      'Meetup': 'business',
      'Workshop': 'art'
    };
    return map[type] || 'business';
  }
}