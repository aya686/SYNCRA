import { Critere } from './critere.model';
import { AppelOffre } from './appel-offre.model';

export interface Offre {
  id?: number;
  titre: string;
  description: string;
  budgetMin: number;
  budgetMax?: number;
  deadline: string;
  datePublication?: string;
  statut?: StatutOffre;
  nombrePostes?: number;
  publieurId: number;
  projetId?: number;
  categorieId?: number;
  categorie?: { id: number; nom?: string };
  categorieNom?: string;
  criteres?: Critere[];
  appelOffre?: AppelOffre;
  nombreCandidatures?: number;
  estSuspecte?: boolean;
}

export enum StatutOffre {
  BROUILLON = 'BROUILLON',
  ACTIVE = 'ACTIVE',
  CLOTUREE = 'CLOTUREE',
  ARCHIVEE = 'ARCHIVEE',
  SUSPENDUE = 'SUSPENDUE'
}

export interface OffreFilter {
  search?: string;
  categorieId?: number;
  statut?: StatutOffre;
  budgetMin?: number;
  budgetMax?: number;
  publieurId?: number;
  activeOnly?: boolean;
}
