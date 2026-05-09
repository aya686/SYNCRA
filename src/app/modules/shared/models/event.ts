export interface Event {
  id: number;
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  lieu: string;
  capaciteMax: number;
  type: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  createdAt: Date;
  updatedAt: Date;
}

export interface Inscription {
  id: number;
  eventId: number;
  participantId: number;
  dateInscription: Date;
  statut: 'en_attente' | 'confirme' | 'annule';
  presence: boolean;
  datePresence?: Date;
}

export interface Notification {
  id: number;
  titre: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  destinataireId: number;
  lu: boolean;
  dateEnvoi: Date;
}