export interface Boutique {
  boutiqueId: number;
  nom: string;
  description?: string;
  statut: string;
  theme?: string;
  logo?: string;
  dateCreation?: string;
}

export interface BoutiqueRequest {
  nom: string;
  description?: string;
  theme?: string;
  logo?: string;
}

export interface Configuration {
  configId: number;
  livraison?: string;
  paiementAccepte?: string;
  politique?: string;
  langue?: string;
}

export interface ConfigurationRequest {
  livraison?: string;
  paiementAccepte?: string;
  politique?: string;
  langue?: string;
}

export interface StatsBoutique {
  statsId: number;
  totalVentes: number;
  totalCommandes: number;
  noteMoyenne: number;
  dateCalcul?: string;
}
