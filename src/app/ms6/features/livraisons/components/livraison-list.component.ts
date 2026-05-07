import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Livraison, LivraisonService } from '../../livraisons';
import { NotificationService } from '../../../core';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-livraison-list',
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-1">Gestion des livraisons</h1>
          <p class="text-muted mb-0">Suivez les livraisons et retours</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2" (click)="navigateToCreate()">
          <i class="bi bi-plus-lg"></i>
          Nouvelle livraison
        </button>
      </div>

      <!-- Livraisons Grid -->
      <div class="row g-4">
        <div class="col-xl-4 col-md-6" *ngFor="let liv of livraisons">
          <div class="card h-100 shadow-sm border-0 livraison-card">
            <div class="card-header bg-white border-bottom py-3">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h5 class="card-title mb-1">Livraison</h5>
                  <small class="text-muted">Suivi de colis</small>
                </div>
                <span class="badge" 
                      [class.bg-warning]="liv.statut === 'EN_PREPARATION'"
                      [class.bg-info]="liv.statut === 'EXPEDIE'"
                      [class.bg-primary]="liv.statut === 'EN_TRANSIT'"
                      [class.bg-success]="liv.statut === 'LIVRE'">
                  {{ liv.statut.replace('_', ' ') }}
                </span>
              </div>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <span class="text-muted small">Transporteur</span>
                <div class="h5 mb-0">{{ liv.transporteur || 'Non assigné' }}</div>
              </div>
              <div class="mb-3">
                <span class="text-muted small">N° Tracking</span>
                <div class="h6 mb-0 font-monospace">{{ liv.tracking || 'N/A' }}</div>
              </div>
              <div class="mb-0">
                <span class="text-muted small">Date d'expédition</span>
                <div class="h6 mb-0">{{ liv.dateExp | date:'dd/MM/yyyy' }}</div>
              </div>
            </div>
            <div class="card-footer bg-white border-top py-3">
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm flex-fill" (click)="viewDetails(liv)">
                  <i class="bi bi-eye me-1"></i>Détails
                </button>
                <button class="btn btn-outline-secondary btn-sm flex-fill" (click)="editLivraison(liv)">
                  <i class="bi bi-pencil me-1"></i>Modifier
                </button>
                <button class="btn btn-outline-danger btn-sm" (click)="deleteLivraison(liv)" title="Supprimer">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="text-center py-5" *ngIf="livraisons.length === 0">
        <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 100px; height: 100px;">
          <i class="bi bi-truck fs-1 text-muted"></i>
        </div>
        <h5 class="text-muted">Aucune livraison</h5>
        <p class="text-muted mb-3">Commencez par créer votre première livraison</p>
        <button class="btn btn-primary" (click)="navigateToCreate()">
          <i class="bi bi-plus-lg me-2"></i>Créer une livraison
        </button>
      </div>
    </div>
  `,
  styles: [`
    .livraison-card {
      transition: all 0.3s ease;
    }
    
    .livraison-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
    }
    
    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .btn-sm {
      padding: 0.25rem 0.5rem;
    }
    
    .badge {
      font-size: 0.75rem;
      padding: 0.5em 0.75em;
    }
    
    .font-monospace {
      font-family: monospace;
    }
  `],
  standalone: false
})
export class LivraisonListComponent implements OnInit {
  livraisons: Livraison[] = [];

  constructor(
    private livraisonService: LivraisonService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLivraisons();
  }

  loadLivraisons(): void {
    this.livraisonService.getAllLivraisons().subscribe({
      next: (livraisons) => {
        this.livraisons = [...livraisons];
        this.cdr.markForCheck();
      },
      error: () => this.notificationService.error('Erreur lors du chargement des livraisons')
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/admin/livraisons/new']);
  }

  viewDetails(livraison: Livraison): void {
    this.router.navigate(['/admin/livraisons', livraison.livraisonId]);
  }

  editLivraison(livraison: Livraison): void {
    this.router.navigate(['/admin/livraisons/edit', livraison.livraisonId]);
  }

  deleteLivraison(livraison: Livraison): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Voulez-vous vraiment supprimer la livraison #${livraison.livraisonId} ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.livraisonService.deleteLivraison(livraison.livraisonId).subscribe({
          next: () => {
            this.notificationService.success('Livraison supprimée avec succès');
            this.loadLivraisons();
          },
          error: (err) => {
            const message = err.error?.message || 'Erreur lors de la suppression';
            this.notificationService.error(message);
          }
        });
      }
    });
  }
}
