// Interface correspondant à l'API Spring Boot
export interface FormationApi {
  formationId: number;
  titre: string;
  niveau: string;
  dureeHeures: number;
  certificate: boolean;
  prix: number;
  statut: string;
}

// Interface pour l'affichage dans le frontend
export interface FormationDisplay {
  id: number;
  titre: string;
  description: string;
  dureeTotale: number;
  niveau: string;
  prix: number;
  certificate: boolean;
  createdAt: Date;
}

// Type alias pour compatibilité
export type Formation = FormationDisplay;

// Interface Session
export interface Session {
  id: number;
  formationId: number;
  dateDebut: Date;
  dateFin: Date;
  lieu: string;
  formateur: string;
  capaciteMax: number;
  statut: string;
}

// Interface Participation
export interface Participation {
  id: number;
  sessionId: number;
  participantId: number;
  dateInscription: Date;
  statut: string;
  progression: number;
  dateCompletion?: Date;
}

// Interface Competence
export interface Competence {
  id: number;
  nom: string;
  description: string;
  formationId: number;
}

// Fonction de conversion API -> Frontend (CORRECTE)
export function convertApiToFormationDisplay(apiFormation: FormationApi): FormationDisplay {
  return {
    id: apiFormation.formationId,
    titre: apiFormation.titre,
    description: `Formation de niveau ${apiFormation.niveau}`,
    dureeTotale: apiFormation.dureeHeures,
    niveau: apiFormation.niveau,
    prix: apiFormation.prix,
    certificate: apiFormation.certificate,
    createdAt: new Date()
  };
}

// Fonction alternative (pour compatibilité)
export function convertApiToFormation(apiFormation: FormationApi): FormationDisplay {
  return convertApiToFormationDisplay(apiFormation);
}