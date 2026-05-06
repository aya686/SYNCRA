export interface Consultation {
  id?: number;
  date: string;
  heure: string;
  motif: string;
  dossierSanteId?: number;
  medecinId?: number;
}