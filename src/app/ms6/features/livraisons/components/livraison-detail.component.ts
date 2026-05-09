import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Livraison, LivraisonService, Retour, RetourRequest, Remboursement, RemboursementRequest } from '../../livraisons';
import { NotificationService, WeatherService, WeatherData } from '../../../core';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog.component';
import { RemboursementDialogComponent } from './remboursement-dialog.component';

@Component({
  selector: 'app-livraison-detail',
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex align-items-center mb-4">
        <button class="btn btn-outline-secondary btn-sm me-3" (click)="goBack()">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div>
          <h1 class="h3 mb-1" *ngIf="livraison">Détails Livraison</h1>
          <p class="text-muted mb-0" *ngIf="livraison">Informations de suivi</p>
        </div>
        <div class="ms-auto d-flex gap-2">
          <button class="btn btn-outline-secondary" (click)="editLivraison()">
            <i class="bi bi-pencil me-2"></i>Modifier
          </button>
        </div>
      </div>

      <div class="row g-4" *ngIf="livraison">
        <!-- Informations Card -->
        <div class="col-lg-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-info-circle me-2 text-primary"></i>Informations</h5>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between py-2 border-bottom">
                <span class="text-muted">Adresse</span>
                <span>{{ livraison.adresse }}</span>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom">
                <span class="text-muted">Transporteur</span>
                <span>{{ livraison.transporteur || 'N/A' }}</span>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom">
                <span class="text-muted">Tracking</span>
                <span class="font-monospace">{{ livraison.tracking || 'N/A' }}</span>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom">
                <span class="text-muted">Statut</span>
                <span class="badge" 
                      [class.bg-warning]="livraison.statut === 'EN_PREPARATION'"
                      [class.bg-info]="livraison.statut === 'EXPEDIE'"
                      [class.bg-primary]="livraison.statut === 'EN_TRANSIT'"
                      [class.bg-success]="livraison.statut === 'LIVRE'">
                  {{ livraison.statut.replace('_', ' ') }}
                </span>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom">
                <span class="text-muted">Date expédition</span>
                <span>{{ livraison.dateExp | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="d-flex justify-content-between py-2">
                <span class="text-muted">Date livraison</span>
                <span>{{ livraison.dateLiv ? (livraison.dateLiv | date:'dd/MM/yyyy') : 'En attente' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Update Card -->
        <div class="col-lg-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-arrow-repeat me-2 text-primary"></i>Changer le statut</h5>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap gap-2">
                <button *ngFor="let statut of statuts" 
                        class="btn"
                        [class.btn-primary]="livraison.statut === statut.value"
                        [class.btn-outline-primary]="livraison.statut !== statut.value"
                        (click)="updateStatut(statut.value)"
                        [disabled]="livraison.statut === statut.value">
                  {{ statut.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Weather Card -->
        <div class="col-12" *ngIf="weatherData || weatherLoading">
          <div class="card shadow-sm" [class]="'border-start border-4 ' + getWeatherCardClass()">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0">
                <i class="bi bi-cloud-sun me-2 text-primary"></i>
                Conditions météo à la livraison
                <span class="badge ms-2" 
                      [class.bg-success]="weatherData.deliveryGood"
                      [class.bg-warning]="!weatherData.deliveryGood"
                      *ngIf="weatherData">
                  {{ weatherData.deliveryGood ? 'Favorable' : 'Attention' }}
                </span>
              </h5>
            </div>
            <div class="card-body">
              <!-- Loading State -->
              <div *ngIf="weatherLoading" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Chargement...</span>
                </div>
                <span class="ms-2 text-muted">Chargement des conditions météo...</span>
              </div>

              <!-- Weather Content -->
              <div *ngIf="weatherData && !weatherLoading" class="row align-items-center">
                <div class="col-md-6">
                  <div class="d-flex align-items-center mb-3">
                    <i class="bi {{ getWeatherIcon() }} fs-1 me-3" 
                       [class.text-warning]="!weatherData.deliveryGood"
                       [class.text-primary]="weatherData.deliveryGood"></i>
                    <div>
                      <div class="fs-4 fw-bold">{{ weatherData.temperature }}</div>
                      <div class="text-muted">{{ weatherData.description }}</div>
                    </div>
                  </div>
                  <div class="row text-center">
                    <div class="col-4">
                      <div class="text-muted small">Humidité</div>
                      <div class="fw-medium">{{ weatherData.humidity }}</div>
                    </div>
                    <div class="col-4">
                      <div class="text-muted small">Vent</div>
                      <div class="fw-medium">{{ weatherData.windSpeed }}</div>
                    </div>
                    <div class="col-4">
                      <div class="text-muted small">Ville</div>
                      <div class="fw-medium">{{ weatherData.city }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="alert mb-0" 
                       [class.alert-success]="weatherData.deliveryGood"
                       [class.alert-warning]="!weatherData.deliveryGood"
                       role="alert">
                    <i class="bi me-2" 
                       [class.bi-check-circle-fill]="weatherData.deliveryGood"
                       [class.bi-exclamation-triangle-fill]="!weatherData.deliveryGood"></i>
                    {{ weatherData.advice }}
                  </div>
                </div>
              </div>

              <!-- Error State -->
              <div *ngIf="weatherError && !weatherLoading" class="alert alert-light mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Données météo non disponibles pour cette adresse.
              </div>
            </div>
          </div>
        </div>

        <!-- Retour Card -->
        <div class="col-12">
          <div class="card shadow-sm" *ngIf="canCreateRetour() || retours.length > 0">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-reply me-2 text-primary"></i>Retours</h5>
            </div>
            <div class="card-body">
              <!-- Create Retour Form -->
              <form [formGroup]="retourForm" (ngSubmit)="initiateRetour()" *ngIf="canCreateRetour()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Motif du retour <span class="text-danger">*</span></label>
                    <textarea class="form-control" formControlName="motif" rows="3"
                              [class.is-invalid]="retourForm.get('motif')?.invalid && retourForm.get('motif')?.touched"></textarea>
                    <div class="invalid-feedback">Motif requis</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">État du produit</label>
                    <input type="text" class="form-control" formControlName="condition" placeholder="État lors du retour">
                  </div>
                </div>
                <button class="btn btn-primary" type="submit" [disabled]="retourForm.invalid">
                  <i class="bi bi-reply me-2"></i>Initier le retour
                </button>
              </form>

              <!-- Existing Retours -->
              <div class="mt-4" *ngIf="retours.length > 0">
                <h6 class="mb-3">Retours existants</h6>
                <div class="list-group">
                  <div *ngFor="let retour of retours" class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div class="fw-medium">{{ retour.motif }}</div>
                      <small class="text-muted">
                        <span class="badge bg-secondary me-2">{{ retour.statut }}</span>
                        {{ retour.dateRetour | date:'dd/MM/yyyy' }}
                      </small>
                    </div>
                    <button class="btn btn-outline-warning btn-sm" 
                            (click)="createRemboursement(retour)" 
                            *ngIf="!remboursements[retour.retourId]">
                      <i class="bi bi-cash me-1"></i>Rembourser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 0.75rem;
      border: none;
    }
    
    .card-header {
      border-radius: 0.75rem 0.75rem 0 0 !important;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    
    .badge {
      font-size: 0.75rem;
      padding: 0.5em 0.75em;
    }
    
    .form-label {
      font-weight: 500;
      color: #495057;
    }
    
    .form-control:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.2rem rgba(25, 118, 210, 0.25);
    }
    
    .btn {
      border-radius: 0.5rem;
    }
    
    .font-monospace {
      font-family: monospace;
    }
    
    .list-group-item {
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      border: 1px solid rgba(0,0,0,0.125);
    }
  `],
  standalone: false
})
export class LivraisonDetailComponent implements OnInit {
  livraison?: Livraison;
  retours: Retour[] = [];
  remboursements: { [key: number]: Remboursement } = {};
  statutForm!: FormGroup;
  retourForm!: FormGroup;
  livraisonId?: number;
  
  // Weather data
  weatherData?: WeatherData;
  weatherLoading = false;
  weatherError = false;

  statuts = [
    { value: 'EN_PREPARATION', label: 'En préparation' },
    { value: 'EXPEDIE', label: 'Expédié' },
    { value: 'EN_TRANSIT', label: 'En transit' },
    { value: 'LIVRE', label: 'Livré' }
  ];

  constructor(
    private fb: FormBuilder,
    private livraisonService: LivraisonService,
    private weatherService: WeatherService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    // Check if id is a valid number (not "new" or undefined)
    this.livraisonId = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;
    this.initForms();
    
    if (this.livraisonId) {
      this.loadData();
    } else {
      this.notificationService.error('ID de livraison manquant ou invalide');
      this.router.navigate(['/admin/livraisons']);
    }
  }

  initForms(): void {
    this.statutForm = this.fb.group({
      statut: ['', Validators.required]
    });

    this.retourForm = this.fb.group({
      motif: ['', [Validators.required, Validators.maxLength(1000)]],
      condition: ['']
    });
  }

  loadData(): void {
    if (!this.livraisonId) return;

    this.livraisonService.getLivraisonById(this.livraisonId).subscribe({
      next: (livraison) => {
        this.livraison = livraison;
        this.statutForm.patchValue({ statut: livraison.statut });
        // Load weather for the delivery address
        this.loadWeather(livraison);
        this.cdr.markForCheck();
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement de la livraison');
        this.router.navigate(['/admin/livraisons']);
      }
    });

    this.livraisonService.getRetoursByLivraison(this.livraisonId).subscribe({
      next: (retours) => {
        this.retours = retours;
        retours.forEach(retour => {
          this.loadRemboursement(retour.retourId);
        });
        this.cdr.markForCheck();
      }
    });
  }

  loadRemboursement(retourId: number): void {
    this.livraisonService.getRemboursement(retourId).subscribe({
      next: (remboursement) => {
        this.remboursements[retourId] = remboursement;
        this.cdr.markForCheck();
      }
    });
  }

  canCreateRetour(): boolean {
    return this.livraison !== undefined && 
           this.livraison.statut === 'LIVRE';
  }

  updateStatut(statut: string): void {
    if (!this.livraisonId) return;

    this.livraisonService.updateLivraisonStatut(this.livraisonId, statut).subscribe({
      next: (livraison) => {
        this.livraison = livraison;
        this.cdr.markForCheck();
        this.notificationService.success('Statut mis à jour avec succès');
      },
      error: () => {
        this.notificationService.error('Erreur lors de la mise à jour du statut');
      }
    });
  }

  initiateRetour(): void {
    if (this.retourForm.invalid || !this.livraisonId) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer le retour',
        message: 'Voulez-vous vraiment initier un retour pour cette livraison ?',
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        confirmColor: 'primary'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.livraisonId) {
        const request: RetourRequest = this.retourForm.value;
        this.livraisonService.initiateRetour(this.livraisonId, request).subscribe({
          next: () => {
            this.notificationService.success('Retour initié avec succès');
            this.retourForm.reset();
            this.loadData();
          },
          error: () => {
            this.notificationService.error('Erreur lors de l\'initiation du retour');
          }
        });
      }
    });
  }

  createRemboursement(retour: Retour): void {
    const dialogRef = this.dialog.open(RemboursementDialogComponent, {
      data: { retour }
    });

    dialogRef.afterClosed().subscribe((result: RemboursementRequest | undefined) => {
      if (result) {
        this.livraisonService.createRemboursement(retour.retourId, result).subscribe({
          next: () => {
            this.notificationService.success('Remboursement créé avec succès');
            this.loadRemboursement(retour.retourId);
          },
          error: () => {
            this.notificationService.error('Erreur lors de la création du remboursement');
          }
        });
      }
    });
  }

  editLivraison(): void {
    if (this.livraison) {
      this.router.navigate(['/admin/livraisons/edit', this.livraison.livraisonId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/livraisons']);
  }

  /**
   * Load weather data for the delivery address
   */
  loadWeather(livraison: Livraison): void {
    if (!livraison.adresse) return;
    
    this.weatherLoading = true;
    this.weatherError = false;
    
    // Extract city from address (simplified)
    const city = this.extractCityFromAddress(livraison.adresse);
    
    if (city) {
      this.weatherService.getWeather(city).subscribe({
        next: (weather) => {
          this.weatherData = weather;
          this.weatherLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.weatherLoading = false;
          this.weatherError = true;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.weatherLoading = false;
    }
  }

  /**
   * Extract city from full address
   */
  extractCityFromAddress(address: string): string | null {
    if (!address) return null;
    
    const parts = address.split(',');
    if (parts.length >= 2) {
      // Take second to last part (usually city)
      return parts[parts.length - 2].trim().replace(/\d+/g, '').trim();
    }
    return parts[parts.length - 1]?.trim() || null;
  }

  /**
   * Get weather icon based on condition
   */
  getWeatherIcon(): string {
    if (!this.weatherData) return 'bi-question-circle';
    
    const condition = this.weatherData.condition?.toLowerCase() || '';
    if (condition.includes('clear') || condition.includes('sun')) return 'bi-sun-fill';
    if (condition.includes('rain')) return 'bi-cloud-rain-fill';
    if (condition.includes('cloud')) return 'bi-cloud-fill';
    if (condition.includes('snow')) return 'bi-snow';
    if (condition.includes('storm')) return 'bi-lightning-fill';
    return 'bi-cloud';
  }

  /**
   * Get weather card class based on conditions
   */
  getWeatherCardClass(): string {
    if (!this.weatherData) return '';
    return this.weatherData.deliveryGood ? 'border-success' : 'border-warning';
  }
}
