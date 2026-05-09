import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Boutique, BoutiqueService, StatsBoutique } from '../../boutiques';
import { NotificationService } from '../../../core';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-boutique-detail',
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex align-items-center mb-4">
        <button class="btn btn-outline-secondary btn-sm me-3" (click)="goBack()">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div>
          <h1 class="h3 mb-1" *ngIf="boutique">{{ boutique.nom }}</h1>
          <p class="text-muted mb-0" *ngIf="boutique">
            <span class="badge" [ngClass]="getStatusClass(boutique.statut)">
              {{ getStatusLabel(boutique.statut) }}
            </span>
          </p>
        </div>
        <div class="ms-auto d-flex gap-2">
          <button class="btn btn-outline-primary" (click)="viewStats()">
            <i class="bi bi-graph-up me-2"></i>Statistiques
          </button>
          <button class="btn btn-outline-secondary" (click)="editBoutique()">
            <i class="bi bi-pencil me-2"></i>Modifier
          </button>
          <button class="btn btn-outline-danger" (click)="deleteBoutique()">
            <i class="bi bi-trash me-2"></i>Supprimer
          </button>
        </div>
      </div>

      <div class="row g-4" *ngIf="boutique">
        <!-- Logo & Info Card -->
        <div class="col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-shop me-2 text-primary"></i>Logo</h5>
            </div>
            <div class="card-body text-center">
              <div *ngIf="boutique.logo" class="mb-3">
                <img [src]="boutique.logo" class="img-fluid rounded-3" style="max-height: 200px; object-fit: cover;" alt="Logo boutique">
              </div>
              <div *ngIf="!boutique.logo" class="bg-light rounded-3 d-flex align-items-center justify-content-center mb-3" style="height: 200px;">
                <i class="bi bi-shop fs-1 text-muted"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Description Card -->
        <div class="col-lg-8">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-info-circle me-2 text-primary"></i>Informations</h5>
            </div>
            <div class="card-body">
              <div class="mb-4">
                <h6 class="text-muted mb-2">Description</h6>
                <p class="mb-0">{{ boutique.description || 'Aucune description' }}</p>
              </div>
              
              <div class="mb-4" *ngIf="boutique.theme">
                <h6 class="text-muted mb-2">Thème</h6>
                <p class="mb-0">
                  <span class="badge bg-secondary">{{ boutique.theme }}</span>
                </p>
              </div>

              <div class="mb-0">
                <h6 class="text-muted mb-2">Date de création</h6>
                <p class="mb-0">
                  <i class="bi bi-calendar3 me-2"></i>
                  {{ boutique.dateCreation | date:'dd/MM/yyyy' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Card -->
        <div class="col-12" *ngIf="stats">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-graph-up me-2 text-primary"></i>Statistiques</h5>
            </div>
            <div class="card-body">
              <div class="row g-4">
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 rounded-3 p-3 me-3">
                      <i class="bi bi-graph-up-arrow fs-4 text-primary"></i>
                    </div>
                    <div>
                      <h5 class="mb-1">{{ stats.totalVentes | currency:'EUR' }}</h5>
                      <p class="text-muted mb-0">Total des ventes</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-success bg-opacity-10 rounded-3 p-3 me-3">
                      <i class="bi bi-cart fs-4 text-success"></i>
                    </div>
                    <div>
                      <h5 class="mb-1">{{ stats.totalCommandes }}</h5>
                      <p class="text-muted mb-0">Commandes</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-warning bg-opacity-10 rounded-3 p-3 me-3">
                      <i class="bi bi-star-fill fs-4 text-warning"></i>
                    </div>
                    <div>
                      <h5 class="mb-1">{{ stats.noteMoyenne | number:'1.1-1' }}/5</h5>
                      <p class="text-muted mb-0">Note moyenne</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-info bg-opacity-10 rounded-3 p-3 me-3">
                      <i class="bi bi-calendar-check fs-4 text-info"></i>
                    </div>
                    <div>
                      <h5 class="mb-1">{{ stats.dateCalcul | date:'dd/MM/yyyy' }}</h5>
                      <p class="text-muted mb-0">Dernière mise à jour</p>
                    </div>
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
      transition: all 0.3s ease;
      border-radius: 0.75rem;
    }
    
    .card-header {
      border-radius: 0.75rem 0.75rem 0 0 !important;
    }
    
    .bg-opacity-10 {
      --bs-bg-opacity: 0.1;
    }
    
    .btn {
      border-radius: 0.5rem;
    }
  `],
  standalone: false
})
export class BoutiqueDetailComponent implements OnInit {
  boutique?: Boutique;
  stats?: StatsBoutique;
  boutiqueId?: number;

  constructor(
    private boutiqueService: BoutiqueService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    // Check if id is a valid number (not "new" or undefined)
    this.boutiqueId = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;
    console.log('BoutiqueDetail - boutiqueId from route:', this.boutiqueId);
    if (this.boutiqueId) {
      this.loadData();
    } else {
      console.error('BoutiqueDetail - No valid boutiqueId provided, idParam was:', idParam);
      this.notificationService.error('ID de boutique manquant ou invalide');
      this.router.navigate(['/admin/boutiques']);
    }
  }

  loadData(): void {
    console.log('BoutiqueDetail - Loading data for boutiqueId:', this.boutiqueId);
    
    // Load boutique details
    this.boutiqueService.getBoutiqueById(this.boutiqueId!).subscribe({
      next: (boutique) => {
        console.log('BoutiqueDetail - Boutique loaded:', boutique);
        this.boutique = boutique;
        this.cdr.markForCheck();  // Force update UI
      },
      error: (err) => {
        console.error('BoutiqueDetail - Error loading boutique:', err);
        this.notificationService.error(`Erreur lors du chargement de la boutique: ${err.status || 'Unknown'}`);
        // Don't navigate away, show empty state
      }
    });

    // Load boutique stats
    this.boutiqueService.getBoutiqueStats(this.boutiqueId!).subscribe({
      next: (stats) => {
        console.log('BoutiqueDetail - Stats loaded:', stats);
        this.stats = stats;
        this.cdr.markForCheck();  // Force update UI
      },
      error: (err) => {
        console.warn('BoutiqueDetail - Error loading stats:', err);
        // Stats are optional, don't show error to user
        this.stats = undefined;
      }
    });
  }

  getStatusClass(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'ACTIF':
      case 'ACTIVE':
        return 'bg-success';
      case 'SUSPENDU':
      case 'SUSPENDED':
        return 'bg-warning';
      case 'EN_ATTENTE':
      case 'PENDING':
        return 'bg-info';
      case 'INACTIF':
      case 'INACTIVE':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'ACTIF':
      case 'ACTIVE':
        return 'Active';
      case 'SUSPENDU':
      case 'SUSPENDED':
        return 'Suspendue';
      case 'EN_ATTENTE':
      case 'PENDING':
        return 'En attente';
      case 'INACTIF':
      case 'INACTIVE':
        return 'Inactive';
      default:
        return statut || 'Inconnu';
    }
  }

  viewStats(): void {
    if (this.boutiqueId) {
      this.router.navigate(['/admin/boutiques/stats', this.boutiqueId]);
    }
  }

  editBoutique(): void {
    if (this.boutiqueId) {
      this.router.navigate(['/admin/boutiques/edit', this.boutiqueId]);
    }
  }

  deleteBoutique(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Voulez-vous vraiment supprimer la boutique "${this.boutique?.nom}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.boutiqueId) {
        this.boutiqueService.deleteBoutique(this.boutiqueId).subscribe({
          next: () => {
            this.notificationService.success('Boutique supprimée avec succès');
            this.router.navigate(['/boutiques']);
          },
          error: () => this.notificationService.error('Erreur lors de la suppression')
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/boutiques']);
  }
}
