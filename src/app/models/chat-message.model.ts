export interface ChatMessage {
  id?: number;
  contenu: string;
  expediteurId: number; // ID de l'expéditeur (client ou freelancer)
  destinataireId: number; // ID du destinataire
  expediteurRole: 'CLIENT' | 'FREELANCER';
  contratId?: number; // Optionnel: pour lier le message à un contrat
  dateEnvoi?: string;
  lu?: boolean; // Indique si le message a été lu
}

export enum ExpediteurRole {
  CLIENT = 'CLIENT',
  FREELANCER = 'FREELANCER'
}
