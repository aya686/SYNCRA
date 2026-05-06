export enum TypeAlerte {
  SURCHARGE  = 'SURCHARGE',
  DEADLINE   = 'DEADLINE',
  BLOCAGE    = 'BLOCAGE',
  STAGNATION = 'STAGNATION',
  RETARD     = 'RETARD',
  BUDGET     = 'BUDGET',
  BURNOUT    = 'BURNOUT'
}

export interface Alerte {
  id?: number;
  utilisateurId?: number;
  projetId?: number;
  type?: TypeAlerte;
  message?: string;
  date?: string;
  traitee?: boolean;
}

export interface AnalyseIA {
  messagePersonnalise?: string;
  scoreRisque?: number;
  actionsConcretes?: string[];
  bloquante?: boolean;
  typeAlerte?: string;
}