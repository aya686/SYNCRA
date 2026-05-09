// src/app/modules/admin/services/ai-event-generator.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface GeneratedEvent {
  titre: string;
  description: string;
  type: string;
  prix: number;
  capacite: number;
  lieu: string;
  dateDebut: Date;
  dateFin: Date;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  predictedPopularity: number;
  confidence: number;
  reasoning: string[];
}

export interface CategoryStats {
  type: string;
  prixMoyen: number;
  prixMin: number;
  prixMax: number;
  capaciteMoyenne: number;
  populariteMoyenne: number;
  motsClesTitres: string[];
  motsClesDescriptions: string[];
  lieuxPopulaires: string[];
  meilleureDuree: number;
  aCertificat: boolean;
}
interface Coordinates {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class AiEventGeneratorService {
  private apiUrl = 'http://localhost:8089/event_db/api/events';

  constructor(private http: HttpClient) {}

  /**
   * Analyse la base de données pour une catégorie donnée
   */
  async analyzeCategory(category: string): Promise<CategoryStats> {
    // Récupérer tous les événements de cette catégorie
    const events = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
    const filteredEvents = events.filter(e => e.type?.toLowerCase() === category.toLowerCase());
    
    if (filteredEvents.length === 0) {
      // Données par défaut si aucun événement
      return this.getDefaultStats(category);
    }
    
    // Calculer les statistiques
    const prix = filteredEvents.map(e => e.prix || 0);
    const capacites = filteredEvents.map(e => e.capacite || 0);
    
    // Extraire les mots-clés des titres
    const motsTitres = this.extractKeywords(filteredEvents.map(e => e.titre || ''));
    const motsDescriptions = this.extractKeywords(filteredEvents.map(e => e.description || ''));
    
    // Lieux populaires
    const lieux = filteredEvents.map(e => e.lieu).filter(l => l);
    const lieuxPopulaires = this.getMostFrequent(lieux, 3);
    
    // Durée moyenne
    const durees = filteredEvents
      .filter(e => e.dateHeure && e.dateFin)
      .map(e => {
        const debut = new Date(e.dateHeure);
        const fin = new Date(e.dateFin);
        return Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24));
      });
    
    return {
      type: category,
      prixMoyen: this.average(prix),
      prixMin: Math.min(...prix),
      prixMax: Math.max(...prix),
      capaciteMoyenne: this.average(capacites),
      populariteMoyenne: 0.65, // Sera calculé avec les inscriptions
      motsClesTitres: motsTitres.slice(0, 8),
      motsClesDescriptions: motsDescriptions.slice(0, 10),
      lieuxPopulaires: lieuxPopulaires,
      meilleureDuree: durees.length > 0 ? Math.round(this.average(durees)) : 1,
      aCertificat: filteredEvents.some(e => e.certificat)
    };
  }

  /**
   * Génère un événement complet basé sur les statistiques
   */
  async generateEvent(category: string): Promise<GeneratedEvent> {
    const stats = await this.analyzeCategory(category);
    
    // Générer le titre
    const titre = this.generateTitle(category, stats);
    
    // Générer la description
    const description = this.generateDescription(category, stats, titre);
    
    // Déterminer le prix (basé sur les événements populaires)
    const prix = this.determinePrice(stats);
    
    // Déterminer la capacité
    const capacite = this.determineCapacity(stats);
    
    // Choisir un lieu
    const lieu = this.determineLocation(stats);
    
    // Dates (dans 1-3 mois)
    const dateDebut = this.generateFutureDate(30, 90);
    const dateFin = new Date(dateDebut);
    // ✅ Ajouter les jours tout en conservant l'heure
  dateFin.setDate(dateFin.getDate() + stats.meilleureDuree);
  
  // ✅ Optionnel: la date de fin peut avoir une heure différente (par ex +3h)
  dateFin.setHours(dateFin.getHours() + 3);
    dateFin.setDate(dateFin.getDate() + stats.meilleureDuree);
    
    // Prédire la popularité
    const predictedPopularity = this.predictPopularity(stats, prix, capacite);
    
    // Générer les raisons
    const reasoning = this.generateReasoning(stats, prix, capacite, lieu);

    const coords = await this.getCoordinatesFromExistingEvent(lieu);

    
    return {
      titre,
      description,
      type: category,
      prix,
      capacite,
      lieu,
      dateDebut,
      dateFin,
      predictedPopularity,
      confidence: Math.min(95, Math.max(60, stats.motsClesTitres.length * 5 + 50)),
      latitude: coords.latitude || undefined,
      longitude: coords.longitude || undefined,
      reasoning
    };
  }

  /**
   * Sauvegarde l'événement généré dans la base
   */
// ai-event-generator.service.ts - Modifiez la méthode saveGeneratedEvent

// ai-event-generator.service.ts - Version simplifiée

async saveGeneratedEvent(event: GeneratedEvent): Promise<any> {
  // Convertir les dates
  let dateDebut = event.dateDebut;
  let dateFin = event.dateFin;
  
  if (typeof dateDebut === 'string') {
    dateDebut = new Date(dateDebut);
  }
  if (typeof dateFin === 'string') {
    dateFin = new Date(dateFin);
  }
  
  // ✅ Récupérer les coordonnées depuis le lieu (si pas déjà présentes)
  let latitude = event.latitude;
  let longitude = event.longitude;
  
  if (!latitude || !longitude) {
    // Chercher un événement existant avec le même lieu
    const events = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
    const existingEvent = events.find(e => 
      e.lieu === event.lieu && 
      e.latitude !== null && 
      e.longitude !== null
    );
    
    if (existingEvent) {
      latitude = existingEvent.latitude;
      longitude = existingEvent.longitude;
      console.log(`📍 Coordonnées récupérées du lieu existant: ${event.lieu}`);
    }
  }
  
  const eventData = {
    titre: event.titre,
    description: event.description,
    type: event.type,
    prix: event.prix,
    capacite: event.capacite,
    lieu: event.lieu,
    dateHeure: dateDebut.toISOString(),
    dateFin: dateFin.toISOString(),
    statut: 'planifie',
    latitude: latitude || null,
    longitude: longitude || null,
    imageUrl: event.imageUrl || null
  };
  
  return await firstValueFrom(this.http.post(this.apiUrl, eventData));
}

  // ========== MÉTHODES PRIVÉES ==========
// ai-event-generator.service.ts - Ajoutez cette méthode

/**
 * Récupère les coordonnées d'un lieu existant dans la base
 */
private async getCoordinatesFromExistingEvent(lieu: string): Promise<{ latitude: number | null; longitude: number | null }> {
  try {
    const events = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
    
    // Chercher un événement avec exactement le même lieu ET qui a des coordonnées
    const existingEvent = events.find(e => 
      e.lieu === lieu && 
      e.latitude !== null && 
      e.longitude !== null
    );
    
    if (existingEvent) {
      console.log(`✅ Coordonnées trouvées pour le lieu "${lieu}":`, existingEvent.latitude, existingEvent.longitude);
      return {
        latitude: existingEvent.latitude,
        longitude: existingEvent.longitude
      };
    }
    
    console.log(`⚠️ Aucune coordonnée trouvée pour le lieu "${lieu}"`);
    return { latitude: null, longitude: null };
    
  } catch (error) {
    console.error('Erreur recherche coordonnées:', error);
    return { latitude: null, longitude: null };
  }
}
  private getDefaultStats(category: string): CategoryStats {
    return {
      type: category,
      prixMoyen: 50,
      prixMin: 0,
      prixMax: 200,
      capaciteMoyenne: 100,
      populariteMoyenne: 0.5,
      motsClesTitres: ['Innovation', 'Masterclass', 'Workshop', 'Summit', 'Conférence'],
      motsClesDescriptions: ['découvrir', 'apprendre', 'experts', 'pratique', 'réseautage'],
      lieuxPopulaires: ['Paris', 'Lyon', 'Tunis'],
      meilleureDuree: 1,
      aCertificat: true
    };
  }

  private extractKeywords(texts: string[]): string[] {
    const stopWords = ['de', 'la', 'le', 'les', 'et', 'un', 'une', 'des', 'pour', 'dans', 'avec', 'par', 'sur'];
    const words = new Map<string, number>();
    
    texts.forEach(text => {
      if (!text) return;
      const mots = text.toLowerCase().split(/\s+/);
      mots.forEach(mot => {
        if (mot.length > 3 && !stopWords.includes(mot)) {
          words.set(mot, (words.get(mot) || 0) + 1);
        }
      });
    });
    
    return Array.from(words.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([mot]) => mot);
  }

  private getMostFrequent<T>(array: T[], n: number): T[] {
    const freq = new Map<T, number>();
    array.forEach(item => freq.set(item, (freq.get(item) || 0) + 1));
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([item]) => item);
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private generateTitle(category: string, stats: CategoryStats): string {
    const words = [...stats.motsClesTitres];
    const suffixes = ['2025', 'Expert', 'Pro', 'Masterclass', 'Summit', 'Bootcamp'];
    
    // Prendre 2-3 mots aléatoires
    const selected = words.slice(0, 2);
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    let title = selected.join(' ');
    if (title.length < 10) {
      title = `${category} ${title}`;
    }
    
    return `${title} ${suffix}`.trim();
  }

  private generateDescription(category: string, stats: CategoryStats, titre: string): string {
    const descriptionsByType: Record<string, string[]> = {
      conference: [
        `Rejoignez-nous pour une journée exceptionnelle dédiée aux dernières innovations.`,
        `Découvrez les tendances qui façonnent l'avenir lors de cette conférence unique.`,
        `Une occasion unique de rencontrer les experts et d'échanger sur les meilleures pratiques.`
      ],
      workshop: [
        `Atelier pratique de ${stats.meilleureDuree} jour(s) pour maîtriser les compétences clés.`,
        `Formation intensive avec des exercices concrets et des cas réels.`,
        `Apprenez par la pratique et repartez avec des compétences directement applicables.`
      ],
      webinaire: [
        `Session en ligne gratuite pour découvrir les fondamentaux.`,
        `Participez depuis chez vous à ce webinaire interactif.`,
        `Une heure pour comprendre les enjeux et poser vos questions.`
      ],
      hackathon: [
        `Défiez-vous pendant ${stats.meilleureDuree} jours de création intense !`,
        `Équipes, challenges et lots à gagner dans ce hackathon unique.`,
        `Innovation, collaboration et dépassement de soi.`
      ],
      formation: [
        `Certification reconnue à l'issue de cette formation complète.`,
        `Programme conçu par des experts du domaine.`,
        `Accompagnement personnalisé et suivi post-formation.`
      ]
    };
    
    const templates = descriptionsByType[category.toLowerCase()] || descriptionsByType['conference'];
    const mainDesc = templates[Math.floor(Math.random() * templates.length)];
    
    const motsCles = stats.motsClesDescriptions.slice(0, 3).join(', ');
    
    return `${mainDesc} Au programme : ${motsCles}. ${titre} vous attend !`;
  }

  private determinePrice(stats: CategoryStats): number {
    // Basé sur le prix moyen des événements populaires
    let price = stats.prixMoyen;
    
    // Ajustement selon le type
    switch(stats.type.toLowerCase()) {
      case 'webinaire': price = Math.min(price, 50); break;
      case 'hackathon': price = Math.min(price, 30); break;
      case 'conference': price = Math.max(price, 50); break;
      case 'workshop': price = price * 1.2; break;
    }
    
    // Arrondir à l'euro ou 5€ près
    if (price > 0 && price < 30) return Math.round(price / 5) * 5;
    if (price === 0) return 0;
    return Math.round(price / 10) * 10;
  }

  private determineCapacity(stats: CategoryStats): number {
    let capacity = stats.capaciteMoyenne;
    
    switch(stats.type.toLowerCase()) {
      case 'webinaire': capacity = capacity * 2; break;
      case 'workshop': capacity = Math.min(capacity, 50); break;
      case 'hackathon': capacity = Math.min(capacity, 100); break;
    }
    
    return Math.round(capacity / 10) * 10;
  }

  private determineLocation(stats: CategoryStats): string {
    if (stats.lieuxPopulaires.length > 0) {
      return stats.lieuxPopulaires[Math.floor(Math.random() * stats.lieuxPopulaires.length)];
    }
    return 'Paris, France';
  }

// ai-event-generator.service.ts - Modifiez generateFutureDate()

private generateFutureDate(minDays: number, maxDays: number): Date {
  const date = new Date();
  const days = minDays + Math.random() * (maxDays - minDays);
  date.setDate(date.getDate() + days);
  
  // ✅ Générer une heure aléatoire entre 9h et 18h
  const hours = 9 + Math.floor(Math.random() * 9); // 9 à 17
  const minutes = Math.random() < 0.5 ? 0 : 30; // 00 ou 30
  
  date.setHours(hours, minutes, 0, 0);
  return date;
}

  private predictPopularity(stats: CategoryStats, price: number, capacity: number): number {
    let popularity = 0.5;
    
    // Les événements gratuits sont plus populaires
    if (price === 0) popularity += 0.25;
    else if (price < 50) popularity += 0.15;
    else if (price < 100) popularity += 0.05;
    else popularity -= 0.1;
    
    // Les capacités moyennes sont idéales
    if (capacity >= 50 && capacity <= 150) popularity += 0.1;
    else if (capacity > 300) popularity -= 0.1;
    
    // Bonus selon type
    switch(stats.type.toLowerCase()) {
      case 'webinaire': popularity += 0.15; break;
      case 'workshop': popularity += 0.1; break;
      case 'hackathon': popularity += 0.05; break;
    }
    
    return Math.min(0.95, Math.max(0.3, popularity)) * 100;
  }

  private generateReasoning(stats: CategoryStats, price: number, capacity: number, lieu: string): string[] {
    const reasons: string[] = [];
    
    if (price === 0) {
      reasons.push("🎁 Prix gratuit : attire plus de participants (basé sur 70% des événements gratuits)");
    } else if (price < 50) {
      reasons.push(`💰 Prix abordable (${price}€) : dans la fourchette basse des événements similaires`);
    } else {
      reasons.push(`💎 Prix premium (${price}€) : positionnement qualité basé sur la moyenne`);
    }
    
    reasons.push(`📊 Capacité de ${capacity} places : optimisée selon la moyenne des ${stats.type}`);
    
    if (stats.lieuxPopulaires.includes(lieu)) {
      reasons.push(`📍 Lieu "${lieu}" : top destination pour ce type d'événement`);
    }
    
    if (stats.aCertificat) {
      reasons.push(`🎓 Certificat inclus : forte demande des participants`);
    }
    
    reasons.push(`📈 Popularité prédite : ${Math.round(this.predictPopularity(stats, price, capacity))}%`);
    
    return reasons;
  }
}