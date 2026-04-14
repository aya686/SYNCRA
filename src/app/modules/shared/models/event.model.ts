// Interface correspondant à l'API Spring Boot
export interface EventApi {
  evenementId: number;
  titre: string;
  type: string;
  lieu: string;
  dateHeure: Date;
  dateFin?: Date;
  capacite: number;
  prix: number;
  statut: string;
  latitude?: number;  
  longitude?: number; 
}

// Interface pour l'affichage dans le frontend
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
  createdAt: Date;
  updatedAt: Date;
  latitude?: number;  
  longitude?: number;
}

// Type alias pour compatibilité
export type Event = EventDisplay;

// Interface Inscription
export interface Inscription {
  id: number;
  eventId: number;
  participantId: number;
  dateInscription: Date;
  statut: string;
  presence: boolean;
  datePresence?: Date;
}

// Fonction de conversion API -> Frontend
export function convertApiToEventDisplay(apiEvent: EventApi): EventDisplay {
  return {
    id: apiEvent.evenementId,
    titre: apiEvent.titre,
    description: `Événement de type ${apiEvent.type} à ${apiEvent.lieu}`,
    dateDebut: apiEvent.dateHeure,
    dateFin: apiEvent.dateFin || apiEvent.dateHeure,
    lieu: apiEvent.lieu,
    capaciteMax: apiEvent.capacite,
    type: apiEvent.type,
    statut: apiEvent.statut,
    createdAt: new Date(),
    updatedAt: new Date(),
    latitude: apiEvent.latitude,
    longitude: apiEvent.longitude
  };
}