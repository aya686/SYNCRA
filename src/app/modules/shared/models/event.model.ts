// Interface pour l'API backend
export interface EventApi {
    evenementId: number;
  titre: string;
  description?: string;
  dateHeure: string;  // Note: l'API utilise dateHeure, pas dateDebut
  dateFin?: string;
  lieu: string;
  capacite: number;
  type: string;
  statut: string;
  prix?: number;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

// Interface pour l'affichage (frontend)
export interface EventDisplay {
  id: number;
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  lieu: string;
  capaciteMax: number;
  type: string;
  statut: string;
  participantsCount: number;
  prix: number;  // ← REQUIS, pas optionnel
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
  
}

// Interface pour les inscriptions
// Interface pour les inscriptions
// Interface pour les inscriptions
export interface Inscription {
  id: number;
  eventId: number;
  participantId: number;
  nom?: string;      // ← Rendre optionnel
  email?: string;    // ← Rendre optionnel
  presence: boolean;
  statut: string;
  dateInscription: Date;
}

// Version partielle pour le formulaire
export type PartialInscription = Partial<Inscription>;

// Fonction de conversion UNIQUE de l'API vers l'affichage
export function convertApiToEventDisplay(apiEvent: EventApi): EventDisplay {
  return {
    id: apiEvent.evenementId,
    titre: apiEvent.titre,
    description: apiEvent.description || '',
    dateDebut: new Date(apiEvent.dateHeure),
    dateFin: apiEvent.dateFin ? new Date(apiEvent.dateFin) : new Date(new Date(apiEvent.dateHeure).getTime() + 24 * 60 * 60 * 1000),
    lieu: apiEvent.lieu,
    capaciteMax: apiEvent.capacite,
    type: apiEvent.type,
    statut: apiEvent.statut,
    participantsCount: 0,
    prix: apiEvent.prix || 0,  // ← AJOUTÉ: valeur par défaut si prix est undefined
    latitude: apiEvent.latitude,
    longitude: apiEvent.longitude,
    createdAt: new Date(apiEvent.createdAt),
    updatedAt: new Date(apiEvent.updatedAt)
  };
}

// SUPPRIMEZ cette fonction qui cause le problème ou corrigez-la:
export function mapToEventDisplay(data: any): EventDisplay {
  return {
    id: data.id,
    titre: data.titre,
    description: data.description || '',
    dateDebut: new Date(data.dateDebut || data.dateHeure),
    dateFin: new Date(data.dateFin || data.dateDebut || new Date()),
    lieu: data.lieu,
    capaciteMax: data.capaciteMax || data.capacite,
    type: data.type,
    statut: data.statut,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    latitude: data.latitude,
    longitude: data.longitude,
    participantsCount: data.participantsCount || 0,
    prix: data.prix || 0  // ← AJOUTÉ: propriété manquante
  };
}

// Fonction inverse pour envoyer au backend
export function convertEventDisplayToApi(displayEvent: EventDisplay): any {
  return {
    titre: displayEvent.titre,
    description: displayEvent.description,
    dateHeure: displayEvent.dateDebut.toISOString(),
    dateFin: displayEvent.dateFin.toISOString(),
    lieu: displayEvent.lieu,
    capacite: displayEvent.capaciteMax,
    type: displayEvent.type,
    statut: displayEvent.statut,
    prix: displayEvent.prix,
    latitude: displayEvent.latitude,
    longitude: displayEvent.longitude
  };
}

// Type alias pour compatibilité
export type Event = EventDisplay;