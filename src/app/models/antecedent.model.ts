export interface Antecedent {
  id?: number;
  type: 'ANXIETE' | 'DEPRESSION' | 'STRESS' | 'TROUBLE_SOMMEIL' | 'BURN_OUT';
  description: string;
  dossierSanteId?: number;
}