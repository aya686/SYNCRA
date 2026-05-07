import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PricingService, 
         PricingConfigurationResponse, 
         PriceCalculationResponse, 
         ElasticityCalculationResponse,
         PriceSimulationResponse,
         PricingAnalyticsDTO } from './services/pricing.service';

@Component({
  selector: 'app-pricing-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pricing-dashboard.component.html',
  styleUrls: ['./pricing-dashboard.component.css']
})
export class PricingDashboardComponent implements OnInit {
  // États
  loading = false;
  loadingConfig = false; // Loading spécifique pour création config
  error: string | null = null;
  success: string | null = null;

  // Données
  configurations: PricingConfigurationResponse[] = [];
  selectedConfig: PricingConfigurationResponse | null = null;
  analytics: PricingAnalyticsDTO | null = null;

  // Formulaire configuration - valeurs vides par défaut
  newConfig = {
    produitId: null as number | null,
    prixBase: null as number | null,
    prixMin: null as number | null,
    prixMax: null as number | null,
    strategie: 'DYNAMIQUE',
    coefficientDemande: 1.0,
    coefficientConcurrence: 1.0,
    coefficientSaisonnalite: 1.0
  };

  // Formulaire calcul prix
  priceCalcRequest = {
    produitId: 1,
    stockDisponible: 15,
    vuesDerniereHeure: 50,
    ventesDerniereHeure: 8,
    prixConcurrent: 105
  };

  // Formulaire simulation
  simulationRequest = {
    produitId: 1,
    nouveauPrix: 95
  };

  // Résultats
  priceCalculationResult: PriceCalculationResponse | null = null;
  elasticityResult: ElasticityCalculationResponse | null = null;
  simulationResult: PriceSimulationResponse | null = null;

  // Stratégies disponibles
  strategies = [
    { value: 'STATIQUE', label: 'Statique', desc: 'Prix fixe sans ajustement' },
    { value: 'DYNAMIQUE', label: 'Dynamique', desc: 'Ajustements automatiques algorithmiques' },
    { value: 'PENETRATION', label: 'Pénétration', desc: 'Prix bas pour gain de marché' },
    { value: 'SKIMMING', label: 'Skimming', desc: 'Prix haut puis descente progressive' },
    { value: 'COMPETITIVE', label: 'Compétitive', desc: 'Suivi des prix concurrents' },
    { value: 'ELASTICITE_BASEE', label: 'Basée sur élasticité', desc: 'Ajustements selon courbe de demande' }
  ];

  constructor(private pricingService: PricingService) {}

  ngOnInit(): void {
    this.loadConfigurations();
    this.loadAnalytics();
  }

  // ==================== CHARGEMENT DONNÉES ====================

  loadConfigurations(): void {
    this.loading = true;
    this.pricingService.getAllConfigurations().subscribe({
      next: (configs) => {
        this.configurations = configs;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur chargement configurations: ' + err.message;
        this.loading = false;
      }
    });
  }

  loadAnalytics(): void {
    this.pricingService.getAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
      },
      error: (err) => {
        console.error('Erreur analytics:', err);
      }
    });
  }

  // ==================== ACTIONS ====================

  createConfiguration(): void {
    if (!this.newConfig.produitId || !this.newConfig.prixBase) {
      this.error = 'Veuillez remplir ID Produit et Prix Base';
      return;
    }

    this.loadingConfig = true;
    this.error = null;
    this.success = null;

    const request = {
      produitId: this.newConfig.produitId,
      prixBase: this.newConfig.prixBase,
      prixMin: this.newConfig.prixMin || undefined,
      prixMax: this.newConfig.prixMax || undefined,
      strategie: this.newConfig.strategie,
      coefficientDemande: this.newConfig.coefficientDemande,
      coefficientConcurrence: this.newConfig.coefficientConcurrence,
      coefficientSaisonnalite: this.newConfig.coefficientSaisonnalite
    };

    console.log('Envoi requête:', request);

    // Utiliser fetch API plus fiable
    fetch('http://localhost:8086/api/pricing/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(text || `HTTP ${response.status}`);
        });
      }
      return response.json();
    })
    .then(config => {
      console.log('Config créée:', config);
      this.success = `Configuration créée pour "${config.nomProduit}" avec prix base ${config.prixBase} DT`;
      this.configurations.push(config);
      this.resetConfigForm();
      this.loadConfigurations();
      this.loadingConfig = false;
    })
    .catch(err => {
      console.error('Erreur:', err);
      this.error = 'Erreur: ' + (err.message || 'Impossible de contacter le serveur. Vérifiez que Spring Boot est démarré sur le port 8086.');
      this.loadingConfig = false;
    });
  }

  calculateElasticity(produitId: number): void {
    this.loading = true;
    this.error = null;
    this.elasticityResult = null;

    this.pricingService.calculateElasticity(produitId, 30).subscribe({
      next: (result) => {
        this.elasticityResult = result;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur calcul élasticité: ' + err.message;
        this.loading = false;
      }
    });
  }

  calculateOptimalPrice(): void {
    this.loading = true;
    this.error = null;
    this.priceCalculationResult = null;

    this.pricingService.calculateOptimalPrice({
      produitId: this.priceCalcRequest.produitId,
      stockDisponible: this.priceCalcRequest.stockDisponible,
      vuesDerniereHeure: this.priceCalcRequest.vuesDerniereHeure,
      ventesDerniereHeure: this.priceCalcRequest.ventesDerniereHeure,
      prixConcurrent: this.priceCalcRequest.prixConcurrent,
      appliquerAutomatiquement: false
    }).subscribe({
      next: (result) => {
        this.priceCalculationResult = result;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur calcul prix: ' + err.message;
        this.loading = false;
      }
    });
  }

  applyPrice(): void {
    if (!this.priceCalculationResult) return;

    this.loading = true;
    this.pricingService.applyOptimalPrice(this.priceCalculationResult.produitId).subscribe({
      next: (result) => {
        this.success = `Prix appliqué avec succès! Nouveau prix: ${result.prixCalcule} DT`;
        this.priceCalculationResult = result;
        this.loading = false;
        this.loadAnalytics();
      },
      error: (err) => {
        this.error = 'Erreur application prix: ' + err.message;
        this.loading = false;
      }
    });
  }

  simulatePriceChange(): void {
    this.loading = true;
    this.error = null;
    this.simulationResult = null;

    this.pricingService.simulatePriceChange({
      produitId: this.simulationRequest.produitId,
      nouveauPrix: this.simulationRequest.nouveauPrix
    }).subscribe({
      next: (result) => {
        this.simulationResult = result;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur simulation: ' + err.message;
        this.loading = false;
      }
    });
  }

  // ==================== UTILITAIRES ====================

  getElasticityClass(elasticite: number | null): string {
    if (elasticite === null) return 'badge bg-secondary';
    if (elasticite < -1.5) return 'badge bg-danger'; // Très élastique
    if (elasticite < -1.0) return 'badge bg-warning'; // Élastique
    if (elasticite < -0.5) return 'badge bg-info'; // Modéré
    return 'badge bg-success'; // Inélastique
  }

  getElasticityLabel(elasticite: number | null): string {
    if (elasticite === null) return 'Non calculée';
    if (elasticite < -1.5) return 'Très élastique';
    if (elasticite < -1.0) return 'Élastique';
    if (elasticite < -0.5) return 'Modéré';
    return 'Inélastique';
  }

  getVariationClass(variation: number): string {
    if (variation > 10) return 'text-success fw-bold';
    if (variation > 0) return 'text-success';
    if (variation > -10) return 'text-danger';
    return 'text-danger fw-bold';
  }

  getStrategieBadgeClass(strategie: string): string {
    const classes: {[key: string]: string} = {
      'STATIQUE': 'badge bg-secondary',
      'DYNAMIQUE': 'badge bg-primary',
      'PENETRATION': 'badge bg-success',
      'SKIMMING': 'badge bg-warning',
      'COMPETITIVE': 'badge bg-info',
      'ELASTICITE_BASEE': 'badge bg-dark'
    };
    return classes[strategie] || 'badge bg-secondary';
  }

  selectProduct(config: PricingConfigurationResponse): void {
    this.selectedConfig = config;
    this.newConfig.produitId = config.produitId;
    this.priceCalcRequest.produitId = config.produitId;
    this.simulationRequest.produitId = config.produitId;
    
    // Charger l'élasticité automatiquement
    this.calculateElasticity(config.produitId);
  }

  resetConfigForm(): void {
    this.newConfig = {
      produitId: null as number | null,
      prixBase: null as number | null,
      prixMin: null as number | null,
      prixMax: null as number | null,
      strategie: 'DYNAMIQUE',
      coefficientDemande: 1.0,
      coefficientConcurrence: 1.0,
      coefficientSaisonnalite: 1.0
    };
  }
}
