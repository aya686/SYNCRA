export interface DocumentMedical {
  id?: number;
  nom: string;
  type: 'ORDONNANCE' | 'RADIO' | 'ANALYSE';
  url: string;
  dossierSanteId?: number;
}