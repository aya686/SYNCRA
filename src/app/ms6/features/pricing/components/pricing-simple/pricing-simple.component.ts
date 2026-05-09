import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pricing-simple',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <h2>Pricing Dynamique - iPhone Test</h2>
      
      <!-- Messages -->
      <div class="alert alert-success" *ngIf="success">{{ success }}</div>
      <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

      <!-- ÉTAPE 1: Configuration -->
      <div class="card mb-3">
        <div class="card-header bg-primary text-white">
          <h5>Étape 1: Configuration Produit</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-2"><label>ID Produit</label><input class="form-control" [(ngModel)]="config.produitId" type="number"></div>
            <div class="col-md-2"><label>Prix Base</label><input class="form-control" [(ngModel)]="config.prixBase" type="number"></div>
            <div class="col-md-2"><label>Prix Min</label><input class="form-control" [(ngModel)]="config.prixMin" type="number"></div>
            <div class="col-md-2"><label>Prix Max</label><input class="form-control" [(ngModel)]="config.prixMax" type="number"></div>
            <div class="col-md-2"><label>Coeff. Demande</label><input class="form-control" [(ngModel)]="config.coefficientDemande" type="number" step="0.1"></div>
            <div class="col-md-2"><br><button class="btn btn-primary w-100" (click)="creerConfig()" [disabled]="loadingConfig">
              {{ loadingConfig ? '...' : 'Créer' }}
            </button></div>
          </div>
        </div>
      </div>

      <!-- ÉTAPE 2: Élasticité -->
      <div class="card mb-3" *ngIf="configCreee">
        <div class="card-header bg-info text-white">
          <h5>Étape 2: Calculer Élasticité</h5>
        </div>
        <div class="card-body">
          <button class="btn btn-info" (click)="calculerElasticite()" [disabled]="loadingElasticite">
            {{ loadingElasticite ? 'Calcul...' : 'Calculer Élasticité' }}
          </button>
          
          <div class="mt-3" *ngIf="elasticiteResult">
            <div class="row">
              <div class="col-md-4"><div class="alert alert-warning"><strong>Élasticité:</strong> {{ elasticiteResult.elasticiteCalculee | number:'1.2' }}</div></div>
              <div class="col-md-4"><div class="alert alert-success"><strong>R²:</strong> {{ elasticiteResult.coefficientDetermination | number:'1.2' }}</div></div>
              <div class="col-md-4"><div class="alert alert-primary"><strong>Points:</strong> {{ elasticiteResult.pointsDonnees?.length }}</div></div>
            </div>
            <div class="alert alert-secondary">{{ elasticiteResult.interpretation }}</div>
          </div>
        </div>
      </div>

      <!-- ÉTAPE 3: Prix Optimal -->
      <div class="card mb-3" *ngIf="elasticiteResult">
        <div class="card-header bg-success text-white">
          <h5>Étape 3: Calculer Prix Optimal</h5>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-3"><label>Stock</label><input class="form-control" [(ngModel)]="calcRequest.stockDisponible" type="number"></div>
            <div class="col-md-3"><label>Vues/heure</label><input class="form-control" [(ngModel)]="calcRequest.vuesDerniereHeure" type="number"></div>
            <div class="col-md-3"><label>Ventes/heure</label><input class="form-control" [(ngModel)]="calcRequest.ventesDerniereHeure" type="number"></div>
            <div class="col-md-3"><label>Prix Concurrent</label><input class="form-control" [(ngModel)]="calcRequest.prixConcurrent" type="number"></div>
          </div>
          <button class="btn btn-success" (click)="calculerPrix()" [disabled]="loadingPrix">
            {{ loadingPrix ? 'Calcul...' : 'Calculer Prix Optimal' }}
          </button>

          <div class="mt-3" *ngIf="prixResult">
            <div class="row">
              <div class="col-md-3"><div class="alert alert-secondary">Actuel: <strong>{{ prixResult.prixActuel }} DT</strong></div></div>
              <div class="col-md-3"><div class="alert alert-success">Optimal: <strong>{{ prixResult.prixCalcule | number:'1.0' }} DT</strong></div></div>
              <div class="col-md-3"><div class="alert alert-info">Variation: <strong>{{ prixResult.variationPercent | number:'1.1' }}%</strong></div></div>
              <div class="col-md-3"><div class="alert alert-warning">Gain: <strong>{{ prixResult.gainRevenuPotentiel | number:'1.0' }} DT</strong></div></div>
            </div>
            <button class="btn btn-outline-success" (click)="appliquerPrix()" *ngIf="!prixApplique">Appliquer ce prix</button>
            <div class="alert alert-success mt-2" *ngIf="prixApplique">✅ Prix appliqué avec succès!</div>
          </div>
        </div>
      </div>

      <!-- ÉTAPE 4: Simulation -->
      <div class="card mb-3" *ngIf="prixResult">
        <div class="card-header bg-warning">
          <h5>Étape 4: Simuler un Prix</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <label>Prix à tester (DT)</label>
              <input class="form-control" [(ngModel)]="simRequest.nouveauPrix" type="number">
            </div>
            <div class="col-md-6"><br>
              <button class="btn btn-warning" (click)="simuler()" [disabled]="loadingSim">
                {{ loadingSim ? 'Simul...' : 'Lancer Simulation' }}
              </button>
            </div>
          </div>

          <div class="mt-3" *ngIf="simResult">
            <table class="table table-bordered">
              <thead><tr><th></th><th>Prix</th><th>Ventes estimées</th><th>Revenu</th></tr></thead>
              <tbody>
                <tr><td>Actuel</td><td>{{ simResult.prixActuel }} DT</td><td>{{ simResult.quantiteEstimeeAncienPrix }}</td><td>{{ simResult.revenuAncienPrix | number:'1.0' }} DT</td></tr>
                <tr><td>Simulé</td><td>{{ simResult.prixSimule }} DT</td><td>{{ simResult.quantiteEstimeeNouveauPrix }}</td><td>{{ simResult.revenuNouveauPrix | number:'1.0' }} DT</td></tr>
                <tr class="table-success"><td><strong>Impact</strong></td><td colspan="3">
                  <strong>{{ simResult.margeEstimee > 0 ? '+' : '' }}{{ simResult.margeEstimee | number:'1.0' }} DT</strong>
                  <span class="badge" [class.bg-success]="simResult.margeEstimee > 0" [class.bg-danger]="simResult.margeEstimee < 0">
                    {{ simResult.margeEstimee > 0 ? '✅ Recommandé' : '❌ Déconseillé' }}
                  </span>
                </td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .card { margin-bottom: 20px; }
    .alert { margin-bottom: 10px; }
    h2 { margin-bottom: 20px; }
    label { font-weight: bold; font-size: 0.9em; }
    input { margin-bottom: 5px; }
  `]
})
export class PricingSimpleComponent implements OnInit {
  // URL API
  private apiUrl = 'http://localhost:8086/ms6/api/pricing';

  // États
  loadingConfig = false;
  loadingElasticite = false;
  loadingPrix = false;
  loadingSim = false;
  configCreee = false;
  prixApplique = false;
  error: string | null = null;
  success: string | null = null;

  // Données formulaires (valeurs par défaut)
  config = {
    produitId: 21,
    prixBase: 4500,
    prixMin: 3500,
    prixMax: 6000,
    strategie: 'DYNAMIQUE',
    coefficientDemande: 1.2,
    coefficientConcurrence: 1.0,
    coefficientSaisonnalite: 1.0
  };

  calcRequest = {
    produitId: 21,
    stockDisponible: 25,
    vuesDerniereHeure: 150,
    ventesDerniereHeure: 3,
    prixConcurrent: 4600
  };

  simRequest = {
    produitId: 21,
    nouveauPrix: 3800
  };

  // Résultats
  elasticiteResult: any = null;
  prixResult: any = null;
  simResult: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Vérifier si config existe déjà
    this.http.get<any[]>(`${this.apiUrl}/configs`).subscribe({
      next: (configs) => {
        const existing = configs.find(c => c.produitId === 21);
        if (existing) {
          this.configCreee = true;
          this.success = 'Configuration existante chargée';
        }
      },
      error: () => {}
    });
  }

  creerConfig(): void {
    this.loadingConfig = true;
    this.error = null;
    this.success = null;

    this.http.post(`${this.apiUrl}/config`, this.config).subscribe({
      next: (result) => {
        this.configCreee = true;
        this.success = `Configuration créée pour iPhone 15 Pro`;
        this.loadingConfig = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur création config';
        this.loadingConfig = false;
      }
    });
  }

  calculerElasticite(): void {
    this.loadingElasticite = true;
    this.error = null;
    console.log('Démarrage calcul élasticité pour produit:', this.config.produitId);

    this.http.post(`${this.apiUrl}/elasticity/${this.config.produitId}?periodeJours=60`, {}).subscribe({
      next: (result: any) => {
        console.log('Résultat élasticité reçu:', result);
        this.elasticiteResult = result;
        this.loadingElasticite = false;
        console.log('Élasticité affichée:', this.elasticiteResult);
      },
      error: (err) => {
        console.error('Erreur élasticité:', err);
        this.error = err.error?.message || err.message || 'Erreur calcul élasticité';
        this.loadingElasticite = false;
      },
      complete: () => {
        console.log('Requête élasticité terminée');
      }
    });
  }

  calculerPrix(): void {
    this.loadingPrix = true;
    this.error = null;
    this.prixApplique = false;

    const request = { ...this.calcRequest, produitId: this.config.produitId };

    this.http.post(`${this.apiUrl}/calculate/${this.config.produitId}`, request).subscribe({
      next: (result: any) => {
        this.prixResult = result;
        this.loadingPrix = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur calcul prix';
        this.loadingPrix = false;
      }
    });
  }

  appliquerPrix(): void {
    this.http.post(`${this.apiUrl}/apply/${this.config.produitId}`, {}).subscribe({
      next: () => {
        this.prixApplique = true;
        this.success = 'Prix appliqué avec succès!';
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur application prix';
      }
    });
  }

  simuler(): void {
    this.loadingSim = true;
    this.error = null;

    const request = { ...this.simRequest, produitId: this.config.produitId };

    this.http.post(`${this.apiUrl}/simulate/${this.config.produitId}`, request).subscribe({
      next: (result: any) => {
        this.simResult = result;
        this.loadingSim = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur simulation';
        this.loadingSim = false;
      }
    });
  }
}
