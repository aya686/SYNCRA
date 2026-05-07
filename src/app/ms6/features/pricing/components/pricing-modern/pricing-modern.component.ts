import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pricing-modern',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pricing-container">
      <!-- Header -->
      <div class="header-section">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="main-title">
              <i class="bi bi-gem"></i> Pricing Dynamique IA
            </h1>
            <p class="subtitle">Optimisation algorithmique des prix en temps réel</p>
          </div>
          <div class="status-badge" [class.online]="backendOnline" [class.offline]="!backendOnline">
            <span class="dot"></span>
            {{ backendOnline ? 'Backend Online' : 'Backend Offline' }}
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="alert-container">
        <div class="alert alert-success alert-dismissible fade show custom-alert" *ngIf="success">
          <i class="bi bi-check-circle-fill"></i>
          <span>{{ success }}</span>
          <button type="button" class="btn-close" (click)="success = null"></button>
        </div>
        <div class="alert alert-danger alert-dismissible fade show custom-alert" *ngIf="error">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>{{ error }}</span>
          <button type="button" class="btn-close" (click)="error = null"></button>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="progress-steps">
        <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
          <div class="step-number">1</div>
          <div class="step-label">Configuration</div>
        </div>
        <div class="step-connector" [class.active]="currentStep >= 2"></div>
        <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
          <div class="step-number">2</div>
          <div class="step-label">Élasticité</div>
        </div>
        <div class="step-connector" [class.active]="currentStep >= 3"></div>
        <div class="step" [class.active]="currentStep >= 3" [class.completed]="currentStep > 3">
          <div class="step-number">3</div>
          <div class="step-label">Prix Optimal</div>
        </div>
        <div class="step-connector" [class.active]="currentStep >= 4"></div>
        <div class="step" [class.active]="currentStep >= 4">
          <div class="step-number">4</div>
          <div class="step-label">Simulation</div>
        </div>
      </div>

      <div class="row">
        <!-- Left Panel - Configuration -->
        <div class="col-lg-4">
          <div class="card config-card" [class.active-step]="currentStep === 1">
            <div class="card-header-gradient">
              <h5><i class="bi bi-gear"></i> Configuration Produit</h5>
            </div>
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">
                  <i class="bi bi-upc-scan"></i> ID Produit
                </label>
                <input type="number" class="form-control modern-input" [(ngModel)]="config.produitId" placeholder="Ex: 21">
              </div>
              
              <div class="row">
                <div class="col-4">
                  <div class="form-group">
                    <label class="form-label">Prix Base</label>
                    <div class="input-group">
                      <input type="number" class="form-control modern-input" [(ngModel)]="config.prixBase" placeholder="4500">
                      <span class="input-group-text">DT</span>
                    </div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="form-group">
                    <label class="form-label">Min</label>
                    <input type="number" class="form-control modern-input" [(ngModel)]="config.prixMin" placeholder="3500">
                  </div>
                </div>
                <div class="col-4">
                  <div class="form-group">
                    <label class="form-label">Max</label>
                    <input type="number" class="form-control modern-input" [(ngModel)]="config.prixMax" placeholder="6000">
                  </div>
                </div>
              </div>

              <div class="coefficients-section">
                <label class="section-label">
                  <i class="bi bi-sliders"></i> Coefficients d'Optimisation
                </label>
                <div class="row">
                  <div class="col-4">
                    <div class="coeff-input">
                      <label>Demande</label>
                      <input type="number" step="0.1" class="form-control" [(ngModel)]="config.coefficientDemande">
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="coeff-input">
                      <label>Concurrence</label>
                      <input type="number" step="0.1" class="form-control" [(ngModel)]="config.coefficientConcurrence">
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="coeff-input">
                      <label>Saison</label>
                      <input type="number" step="0.1" class="form-control" [(ngModel)]="config.coefficientSaisonnalite">
                    </div>
                  </div>
                </div>
              </div>

              <button class="btn btn-primary btn-modern w-100" (click)="creerConfig()" [disabled]="loadingConfig">
                <span *ngIf="loadingConfig" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-plus-circle" *ngIf="!loadingConfig"></i>
                {{ loadingConfig ? 'Création...' : 'Créer Configuration' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Middle Panel - Elasticity & Price -->
        <div class="col-lg-4">
          <!-- Elasticity Card -->
          <div class="card elasticity-card" [class.active-step]="currentStep === 2" [class.disabled]="currentStep < 2">
            <div class="card-header-gradient info">
              <h5><i class="bi bi-graph-up"></i> Calcul d'Élasticité</h5>
            </div>
            <div class="card-body">
              <div class="elasticity-preview" *ngIf="!elasticiteResult">
                <div class="placeholder-icon"><i class="bi bi-bar-chart"></i></div>
                <p>Cliquez sur le bouton pour calculer l'élasticité-prix</p>
                <small>Basé sur les 60 derniers jours d'historique</small>
              </div>

              <div class="elasticity-results" *ngIf="elasticiteResult">
                <div class="metric-card primary">
                  <div class="metric-value">{{ elasticiteResult.elasticiteCalculee | number:'1.2' }}</div>
                  <div class="metric-label">Élasticité β</div>
                  <div class="metric-badge" [class.high]="elasticiteResult.elasticiteCalculee < -2.5" [class.medium]="elasticiteResult.elasticiteCalculee >= -2.5 && elasticiteResult.elasticiteCalculee < -1" [class.low]="elasticiteResult.elasticiteCalculee >= -1">
                    {{ getElasticityLabel(elasticiteResult.elasticiteCalculee) }}
                  </div>
                </div>

                <div class="row metrics-row">
                  <div class="col-6">
                    <div class="metric-card secondary">
                      <div class="metric-value">{{ elasticiteResult.coefficientDetermination | number:'1.2' }}</div>
                      <div class="metric-label">R² Qualité</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="metric-card secondary">
                      <div class="metric-value">{{ elasticiteResult.pointsDonnees?.length || 0 }}</div>
                      <div class="metric-label">Points données</div>
                    </div>
                  </div>
                </div>

                <div class="interpretation-box">
                  <i class="bi bi-info-circle"></i>
                  <p>{{ elasticiteResult.interpretation }}</p>
                </div>
              </div>

              <button class="btn btn-info btn-modern w-100 mt-3" (click)="calculerElasticite()" [disabled]="loadingElasticite || currentStep < 2">
                <span *ngIf="loadingElasticite" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-calculator" *ngIf="!loadingElasticite"></i>
                {{ loadingElasticite ? 'Calcul...' : (elasticiteResult ? 'Recalculer' : 'Calculer Élasticité') }}
              </button>
            </div>
          </div>

          <!-- Optimal Price Card -->
          <div class="card price-card mt-3" [class.active-step]="currentStep === 3" [class.disabled]="currentStep < 3">
            <div class="card-header-gradient success">
              <h5><i class="bi bi-magic"></i> Prix Optimal</h5>
            </div>
            <div class="card-body">
              <div class="calc-inputs" *ngIf="!prixResult">
                <div class="row">
                  <div class="col-6">
                    <div class="form-group">
                      <label>Stock</label>
                      <input type="number" class="form-control" [(ngModel)]="calcRequest.stockDisponible" placeholder="25">
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="form-group">
                      <label>Vues/h</label>
                      <input type="number" class="form-control" [(ngModel)]="calcRequest.vuesDerniereHeure" placeholder="150">
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-6">
                    <div class="form-group">
                      <label>Ventes/h</label>
                      <input type="number" class="form-control" [(ngModel)]="calcRequest.ventesDerniereHeure" placeholder="3">
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="form-group">
                      <label>Prix Conc.</label>
                      <div class="input-group">
                        <input type="number" class="form-control" [(ngModel)]="calcRequest.prixConcurrent" placeholder="4600">
                        <span class="input-group-text">DT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="price-results" *ngIf="prixResult">
                <div class="price-comparison">
                  <div class="price-item old">
                    <span class="price-label">Actuel</span>
                    <span class="price-value">{{ prixResult.prixActuel | number:'1.0' }} DT</span>
                  </div>
                  <div class="arrow">→</div>
                  <div class="price-item new">
                    <span class="price-label">Optimal</span>
                    <span class="price-value">{{ prixResult.prixCalcule | number:'1.0' }} DT</span>
                  </div>
                </div>

                <div class="variation-indicator" [class.positive]="prixResult.variationPercent > 0" [class.negative]="prixResult.variationPercent < 0">
                  <i class="bi" [class.bi-arrow-up-circle]="prixResult.variationPercent > 0" [class.bi-arrow-down-circle]="prixResult.variationPercent < 0"></i>
                  {{ prixResult.variationPercent > 0 ? '+' : '' }}{{ prixResult.variationPercent | number:'1.1' }}%
                </div>

                <div class="revenue-impact">
                  <div class="impact-item">
                    <span class="impact-label">Revenu Actuel</span>
                    <span class="impact-value">{{ prixResult.revenuEstimeAncienPrix | number:'1.0' }} DT</span>
                  </div>
                  <div class="impact-item">
                    <span class="impact-label">Revenu Optimal</span>
                    <span class="impact-value">{{ prixResult.revenuEstimeNouveauPrix | number:'1.0' }} DT</span>
                  </div>
                  <div class="impact-item gain">
                    <span class="impact-label">Gain Potentiel</span>
                    <span class="impact-value">+{{ prixResult.gainRevenuPotentiel | number:'1.0' }} DT</span>
                  </div>
                </div>

                <button class="btn btn-outline-success btn-apply w-100 mt-2" (click)="appliquerPrix()" *ngIf="!prixApplique">
                  <i class="bi bi-check2-all"></i> Appliquer ce Prix
                </button>
                <div class="applied-badge" *ngIf="prixApplique">
                  <i class="bi bi-check-circle-fill"></i> Prix Appliqué avec Succès
                </div>
              </div>

              <button class="btn btn-success btn-modern w-100 mt-3" (click)="calculerPrix()" [disabled]="loadingPrix || currentStep < 3">
                <span *ngIf="loadingPrix" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-currency-dollar" *ngIf="!loadingPrix"></i>
                {{ loadingPrix ? 'Calcul...' : (prixResult ? 'Recalculer' : 'Calculer Prix Optimal') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Right Panel - Simulation -->
        <div class="col-lg-4">
          <div class="card simulation-card" [class.active-step]="currentStep === 4" [class.disabled]="currentStep < 4">
            <div class="card-header-gradient warning">
              <h5><i class="bi bi-cash-coin"></i> Simulation de Scénarios</h5>
            </div>
            <div class="card-body">
              <div class="sim-input-section">
                <label class="sim-label">Prix à Tester</label>
                <div class="input-group sim-input-group">
                  <input type="number" class="form-control sim-input" [(ngModel)]="simRequest.nouveauPrix" placeholder="3800">
                  <span class="input-group-text">DT</span>
                </div>
                <div class="quick-prices">
                  <button class="btn btn-sm btn-outline-secondary" (click)="simRequest.nouveauPrix = 3800">3800</button>
                  <button class="btn btn-sm btn-outline-secondary" (click)="simRequest.nouveauPrix = 4000">4000</button>
                  <button class="btn btn-sm btn-outline-secondary" (click)="simRequest.nouveauPrix = 4200">4200</button>
                </div>
              </div>

              <button class="btn btn-warning btn-modern w-100 mb-3" (click)="simuler()" [disabled]="loadingSim || currentStep < 4">
                <span *ngIf="loadingSim" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-play-circle" *ngIf="!loadingSim"></i>
                {{ loadingSim ? 'Simulation...' : 'Lancer Simulation' }}
              </button>

              <div class="simulation-results" *ngIf="simResult">
                <div class="scenario-table">
                  <div class="table-header">
                    <span>Scénario</span>
                    <span>Prix</span>
                    <span>Ventes</span>
                    <span>Revenu</span>
                  </div>
                  <div class="table-row current">
                    <span><i class="bi bi-circle"></i> Actuel</span>
                    <span>{{ simResult.prixActuel | number:'1.0' }} DT</span>
                    <span>{{ simResult.quantiteEstimeeAncienPrix }}</span>
                    <span>{{ simResult.revenuAncienPrix | number:'1.0' }} DT</span>
                  </div>
                  <div class="table-row simulated">
                    <span><i class="bi bi-triangle"></i> Simulé</span>
                    <span>{{ simResult.prixSimule | number:'1.0' }} DT</span>
                    <span>{{ simResult.quantiteEstimeeNouveauPrix }}</span>
                    <span>{{ simResult.revenuNouveauPrix | number:'1.0' }} DT</span>
                  </div>
                </div>

                <div class="impact-card" [class.positive]="simResult.margeEstimee > 0" [class.negative]="simResult.margeEstimee < 0">
                  <div class="impact-header">
                    <i class="bi" [class.bi-graph-up-arrow]="simResult.margeEstimee > 0" [class.bi-graph-down-arrow]="simResult.margeEstimee < 0"></i>
                    <span>Impact Estimé</span>
                  </div>
                  <div class="impact-value-large">
                    {{ simResult.margeEstimee > 0 ? '+' : '' }}{{ simResult.margeEstimee | number:'1.0' }} DT
                  </div>
                  <div class="impact-percentage">
                    {{ (simResult.margeEstimee / simResult.revenuAncienPrix * 100) | number:'1.1' }}% vs actuel
                  </div>
                  <div class="recommendation-badge" [class.recommended]="simResult.margeEstimee > 0" [class.not-recommended]="simResult.margeEstimee < 0">
                    <i class="bi" [class.bi-check-circle]="simResult.margeEstimee > 0" [class.bi-x-circle]="simResult.margeEstimee < 0"></i>
                    {{ simResult.margeEstimee > 0 ? 'Recommandé' : 'Déconseillé' }}
                  </div>
                </div>
              </div>

              <div class="empty-state" *ngIf="!simResult">
                <div class="empty-icon"><i class="bi bi-bullseye"></i></div>
                <p>Entrez un prix et lancez la simulation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Global Container - Design Simple */
    .pricing-container {
      background: #f5f5f5;
      min-height: 100vh;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    /* Header Section */
    .header-section {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid #e0e0e0;
    }

    .main-title {
      font-size: 1.6rem;
      font-weight: 600;
      color: #2c5282;
      margin: 0;
    }

    .main-title i {
      color: #4a90d9;
    }

    .subtitle {
      color: #666;
      margin-top: 4px;
      margin-bottom: 0;
      font-size: 0.9rem;
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: 500;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 6px;
      border: 1px solid #ddd;
    }

    .status-badge.online {
      background: #f0f0f0;
      color: #333;
    }

    .status-badge.offline {
      background: #f0f0f0;
      color: #666;
    }

    .status-badge .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    /* Alerts */
    .alert-container {
      margin-bottom: 20px;
    }

    .custom-alert {
      border-radius: 4px;
      border: 1px solid #ddd;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .custom-alert.alert-success {
      background: #f5f5f5;
      color: #333;
      border-color: #ccc;
    }

    .custom-alert.alert-danger {
      background: #f5f5f5;
      color: #333;
      border-color: #ccc;
    }

    /* Progress Steps */
    .progress-steps {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 20px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f0f0f0;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
      border: 1px solid #ddd;
    }

    .step.active .step-number {
      background: #4a90d9;
      color: white;
      border-color: #4a90d9;
    }

    .step.completed .step-number {
      background: #6b9dc7;
      color: white;
      border-color: #6b9dc7;
    }

    .step-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #999;
      margin-top: 4px;
    }

    .step.active .step-label {
      color: #4a90d9;
      font-weight: 600;
    }

    .step-connector {
      width: 40px;
      height: 2px;
      background: #e0e0e0;
      margin: 0 10px;
    }

    .step-connector.active {
      background: #4a90d9;
    }

    /* Cards - Design Simple */
    .card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      margin-bottom: 16px;
    }

    .card.active-step {
      border-color: #4a90d9;
      box-shadow: 0 2px 8px rgba(74, 144, 217, 0.15);
    }

    .card.disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .card-header-gradient {
      background: linear-gradient(135deg, #f0f7fc 0%, #e8f4f8 100%);
      color: #2c5282;
      padding: 12px 16px;
      font-weight: 600;
      border-bottom: 1px solid #bee3f8;
    }

    .card-header-gradient.info {
      background: linear-gradient(135deg, #f0f7fc 0%, #e8f4f8 100%);
    }

    .card-header-gradient.success {
      background: linear-gradient(135deg, #f0f7fc 0%, #e8f4f8 100%);
    }

    .card-header-gradient.warning {
      background: linear-gradient(135deg, #f0f7fc 0%, #e8f4f8 100%);
    }

    .card-header-gradient h5 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .card-body {
      padding: 16px;
    }

    /* Form Elements */
    .form-group {
      margin-bottom: 12px;
    }

    .form-label {
      font-weight: 500;
      color: #555;
      font-size: 0.85rem;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .modern-input {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 0.9rem;
    }

    .modern-input:focus {
      border-color: #4a90d9;
      outline: none;
      box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.1);
    }

    .input-group-text {
      background: #f5f5f5;
      border: 1px solid #ccc;
      border-left: none;
      border-radius: 0 4px 4px 0;
      color: #666;
      font-weight: 500;
      padding: 8px 12px;
    }

    /* Coefficients Section */
    .coefficients-section {
      background: #fafafa;
      padding: 12px;
      border-radius: 6px;
      margin: 12px 0;
      border: 1px solid #e0e0e0;
    }

    .section-label {
      font-weight: 600;
      color: #444;
      margin-bottom: 8px;
      display: block;
      font-size: 0.9rem;
    }

    .coeff-input label {
      font-size: 0.75rem;
      color: #718096;
      text-transform: uppercase;
    }

    .coeff-input input {
      text-align: center;
      font-weight: 600;
    }

    /* Buttons - Simple */
    .btn-modern {
      padding: 10px 16px;
      border-radius: 4px;
      font-weight: 500;
      font-size: 0.85rem;
      border: 1px solid transparent;
    }

    .btn-primary.btn-modern {
      background: #4a90d9;
      color: white;
      border-color: #4a90d9;
    }

    .btn-primary.btn-modern:hover {
      background: #357abd;
      border-color: #357abd;
    }

    .btn-info.btn-modern {
      background: #5fa8e8;
      color: white;
      border-color: #5fa8e8;
    }

    .btn-info.btn-modern:hover {
      background: #4a90d9;
      border-color: #4a90d9;
    }

    .btn-success.btn-modern {
      background: #4a90d9;
      color: white;
      border-color: #4a90d9;
    }

    .btn-success.btn-modern:hover {
      background: #357abd;
      border-color: #357abd;
    }

    .btn-warning.btn-modern {
      background: #6b9dc7;
      color: white;
      border-color: #6b9dc7;
    }

    .btn-warning.btn-modern:hover {
      background: #5fa8e8;
      border-color: #5fa8e8;
    }

    .btn-outline-success.btn-apply {
      border: 1px solid #4a90d9;
      color: #4a90d9;
      font-weight: 500;
      background: transparent;
    }

    .btn-outline-success.btn-apply:hover {
      background: #4a90d9;
      color: white;
    }

    /* Elasticity Results - Simple */
    .elasticity-preview {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    .placeholder-icon {
      font-size: 2rem;
      margin-bottom: 8px;
    }

    .metric-card {
      background: linear-gradient(135deg, #f0f7fc 0%, #e8f4f8 100%);
      color: #2c5282;
      padding: 16px;
      border-radius: 6px;
      text-align: center;
      margin-bottom: 12px;
      border: 1px solid #bee3f8;
    }

    .metric-card.secondary {
      background: #fafafa;
      color: #555;
      border-color: #e0e0e0;
    }

    .metric-value {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .metric-label {
      font-size: 0.8rem;
      color: #666;
    }

    .metric-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 500;
      margin-top: 6px;
      background: #e0e0e0;
      color: #555;
    }

    .metric-badge.high {
      background: #bee3f8;
      color: #2b6cb0;
    }

    .metric-badge.medium {
      background: #e2e8f0;
      color: #4a5568;
    }

    .metric-badge.low {
      background: #c6f6d5;
      color: #276749;
    }

    .metrics-row {
      margin-top: 8px;
    }

    .interpretation-box {
      background: #f0f7fc;
      border-left: 3px solid #4a90d9;
      padding: 12px;
      border-radius: 4px;
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }

    .interpretation-box i {
      color: #4a90d9;
      font-size: 1rem;
    }

    .interpretation-box p {
      margin: 0;
      color: #555;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    /* Price Results - Simple */
    .price-comparison {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .price-item {
      text-align: center;
      padding: 12px 16px;
      border-radius: 6px;
      min-width: 80px;
      border: 1px solid #e0e0e0;
    }

    .price-item.old {
      background: #f5f5f5;
      color: #555;
    }

    .price-item.new {
      background: #fafafa;
      color: #333;
    }

    .price-label {
      display: block;
      font-size: 0.7rem;
      color: #666;
      margin-bottom: 4px;
    }

    .price-value {
      display: block;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .arrow {
      font-size: 1.2rem;
      color: #999;
    }

    .variation-indicator {
      text-align: center;
      padding: 8px;
      border-radius: 4px;
      font-weight: 500;
      font-size: 1rem;
      margin-bottom: 12px;
      border: 1px solid #e0e0e0;
    }

    .variation-indicator.positive {
      background: #f5f5f5;
      color: #333;
    }

    .variation-indicator.negative {
      background: #f5f5f5;
      color: #666;
    }

    .revenue-impact {
      background: #fafafa;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
    }

    .impact-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .impact-item:last-child {
      border-bottom: none;
    }

    .impact-item.gain {
      background: #f0f0f0;
      margin: 6px -12px -6px;
      padding: 10px 12px;
      border-radius: 0 0 4px 4px;
    }

    .impact-item.gain .impact-value {
      color: #333;
      font-weight: 600;
    }

    .impact-label {
      color: #666;
      font-size: 0.85rem;
    }

    .impact-value {
      color: #333;
      font-weight: 500;
    }

    .applied-badge {
      background: linear-gradient(135deg, #f0f7fc 0%, #e8f4f8 100%);
      color: #2c5282;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1px solid #bee3f8;
    }

    /* Simulation Section - Simple */
    .sim-input-section {
      background: #fafafa;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      border: 1px solid #e0e0e0;
    }

    .sim-label {
      font-weight: 600;
      color: #555;
      display: block;
      margin-bottom: 6px;
      font-size: 0.9rem;
    }

    .sim-input-group {
      margin-bottom: 8px;
    }

    .sim-input {
      font-size: 1rem;
      font-weight: 600;
      text-align: center;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
    }

    .sim-input:focus {
      border-color: #4a90d9;
      outline: none;
      box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.1);
    }

    .quick-prices {
      display: flex;
      gap: 6px;
      justify-content: center;
    }

    .quick-prices button {
      border-radius: 4px;
      font-size: 0.8rem;
      border: 1px solid #ccc;
    }

    .empty-state {
      text-align: center;
      padding: 30px 16px;
      color: #888;
    }

    .empty-icon {
      font-size: 2rem;
      margin-bottom: 8px;
    }

    /* Scenario Table - Simple */
    .scenario-table {
      background: white;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 12px;
      border: 1px solid #e0e0e0;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr 1.5fr;
      background: linear-gradient(135deg, #f0f7fc 0%, #e8f4f8 100%);
      color: #2c5282;
      padding: 10px 12px;
      font-weight: 600;
      font-size: 0.8rem;
      border-bottom: 1px solid #bee3f8;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr 1.5fr;
      padding: 10px 12px;
      border-bottom: 1px solid #e0e0e0;
      align-items: center;
      font-size: 0.85rem;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-row.current {
      background: #fafafa;
    }

    .table-row.simulated {
      background: #f5f5f5;
      font-weight: 500;
    }

    /* Impact Card - Simple */
    .impact-card {
      border-radius: 6px;
      padding: 16px;
      text-align: center;
      margin-top: 12px;
      border: 1px solid #e0e0e0;
    }

    .impact-card.positive {
      background: #f5f5f5;
    }

    .impact-card.negative {
      background: #fafafa;
    }

    .impact-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-bottom: 6px;
      font-weight: 500;
      font-size: 0.8rem;
      color: #666;
    }

    .impact-value-large {
      font-size: 1.8rem;
      font-weight: 600;
      margin: 6px 0;
      color: #2b6cb0;
    }

    .impact-percentage {
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 8px;
    }

    .recommendation-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: 500;
      font-size: 0.8rem;
      border: 1px solid #ddd;
    }

    .recommendation-badge.recommended {
      background: #bee3f8;
      color: #2b6cb0;
      border-color: #90cdf4;
    }

    .recommendation-badge.not-recommended {
      background: #e2e8f0;
      color: #4a5568;
      border-color: #cbd5e0;
    }

    /* Responsive */
    @media (max-width: 991px) {
      .progress-steps {
        flex-wrap: wrap;
        gap: 10px;
      }

      .step-connector {
        display: none;
      }

      .price-comparison {
        flex-direction: column;
      }

      .arrow {
        transform: rotate(90deg);
      }
    }
  `]
})
export class PricingModernComponent implements OnInit {
  private apiUrl = 'http://localhost:8086/ms6/api/pricing';

  // États
  currentStep = 1;
  backendOnline = true;
  loadingConfig = false;
  loadingElasticite = false;
  loadingPrix = false;
  loadingSim = false;
  prixApplique = false;
  error: string | null = null;
  success: string | null = null;

  // Données formulaires - Produit 21: Maillot Tunisie CAN 2024 (199 DT)
  config = {
    produitId: 21,
    prixBase: 199,
    prixMin: 149,
    prixMax: 249,
    strategie: 'DYNAMIQUE',
    coefficientDemande: 1.35,
    coefficientConcurrence: 0.95,
    coefficientSaisonnalite: 1.45
  };

  calcRequest = {
    produitId: 21,
    stockDisponible: 500,
    vuesDerniereHeure: 350,
    ventesDerniereHeure: 12,
    prixConcurrent: 189
  };

  simRequest = {
    produitId: 21,
    nouveauPrix: 180
  };

  // Résultats
  elasticiteResult: any = null;
  prixResult: any = null;
  simResult: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Vérifier backend
    this.http.get(`${this.apiUrl}/configs`).subscribe({
      next: () => this.backendOnline = true,
      error: () => this.backendOnline = false
    });

    // Charger config existante
    this.http.get<any[]>(`${this.apiUrl}/configs`).subscribe({
      next: (configs) => {
        const existing = configs.find(c => c.produitId === 21);
        if (existing) {
          this.currentStep = 2;
          this.success = 'Configuration existante chargée - Passez à l\'étape 2';
        }
      },
      error: () => {}
    });
  }

  getElasticityLabel(value: number): string {
    if (value < -2.5) return 'Très Élastique';
    if (value < -1.5) return 'Élastique';
    if (value < -0.5) return 'Modéré';
    return 'Peu Élastique';
  }

  creerConfig(): void {
    this.loadingConfig = true;
    this.error = null;
    this.success = null;

    this.http.post(`${this.apiUrl}/config`, this.config).subscribe({
      next: (result) => {
        this.currentStep = 2;
        this.success = 'Configuration créée ! Passez à l\'étape 2';
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

    this.http.post(`${this.apiUrl}/elasticity/${this.config.produitId}?periodeJours=60`, {}).subscribe({
      next: (result: any) => {
        this.elasticiteResult = result;
        this.currentStep = 3;
        this.loadingElasticite = false;
        this.success = 'Élasticité calculée ! Passez à l\'étape 3';
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur calcul élasticité';
        this.loadingElasticite = false;
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
        this.currentStep = 4;
        this.loadingPrix = false;
        this.success = 'Prix optimal calculé ! Testez à l\'étape 4';
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
        this.success = 'Prix appliqué avec succès !';
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
        this.success = 'Simulation terminée !';
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur simulation';
        this.loadingSim = false;
      }
    });
  }
}
