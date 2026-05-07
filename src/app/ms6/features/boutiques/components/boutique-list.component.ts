import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Boutique, BoutiqueService } from '../../boutiques';
import { NotificationService } from '../../../core';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-boutique-list',
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-1">Gestion des boutiques</h1>
          <p class="text-muted mb-0">Gérez vos boutiques et leurs configurations</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2" (click)="navigateToCreate()">
          <i class="bi bi-plus-lg"></i>
          Nouvelle boutique
        </button>
      </div>

      <!-- Boutiques Grid -->
      <div class="row g-4">
        <div class="col-xl-4 col-md-6" *ngFor="let boutique of boutiques">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-header bg-white border-bottom py-3">
              <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex align-items-center">
                  <div class="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                    <img *ngIf="boutique.logo" [src]="boutique.logo" class="rounded-3" style="width: 40px; height: 40px; object-fit: cover;" alt="Logo">
                    <i *ngIf="!boutique.logo" class="bi bi-shop fs-4 text-primary"></i>
                  </div>
                  <div>
                    <h5 class="card-title mb-1">{{ boutique.nom }}</h5>
                    <span class="badge" [ngClass]="getStatusClass(boutique.statut)">
                      {{ getStatusLabel(boutique.statut) }}
                    </span>
                  </div>
                </div>
                <div class="dropdown">
                  <button class="btn btn-link text-dark p-1" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <a class="dropdown-item d-flex align-items-center" (click)="viewDetails(boutique)">
                        <i class="bi bi-eye me-2 text-primary"></i>Détails
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item d-flex align-items-center" (click)="viewStats(boutique)">
                        <i class="bi bi-graph-up me-2 text-info"></i>Statistiques
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item d-flex align-items-center" (click)="editBoutique(boutique)">
                        <i class="bi bi-pencil me-2 text-primary"></i>Modifier
                      </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <a class="dropdown-item d-flex align-items-center" (click)="toggleStatus(boutique)">
                        <i class="bi me-2" [class.bi-pause-circle]="boutique.statut === 'ACTIF'" [class.bi-play-circle]="boutique.statut !== 'ACTIF'" 
                           [class.text-warning]="boutique.statut === 'ACTIF'" [class.text-success]="boutique.statut !== 'ACTIF'"></i>
                        {{ boutique.statut === 'ACTIF' ? 'Suspendre' : 'Activer' }}
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item d-flex align-items-center text-danger" (click)="deleteBoutique(boutique)">
                        <i class="bi bi-trash me-2"></i>Supprimer
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="card-body">
              <p class="card-text text-muted mb-3">{{ boutique.description || 'Aucune description' }}</p>
              <div class="d-flex align-items-center text-muted small">
                <i class="bi bi-calendar3 me-2"></i>
                Créée le {{ boutique.dateCreation | date:'dd/MM/yyyy' }}
              </div>
            </div>
            <div class="card-footer bg-white border-top py-3">
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm" (click)="viewDetails(boutique)" title="Détails">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-outline-info btn-sm" (click)="viewStats(boutique)" title="Statistiques">
                  <i class="bi bi-graph-up"></i>
                </button>
                <button class="btn btn-outline-secondary btn-sm" (click)="editBoutique(boutique)" title="Modifier">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm ms-auto" (click)="deleteBoutique(boutique)" title="Supprimer">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="text-center py-5" *ngIf="boutiques.length === 0">
        <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 100px; height: 100px;">
          <i class="bi bi-shop fs-1 text-muted"></i>
        </div>
        <h5 class="text-muted">Aucune boutique</h5>
        <p class="text-muted mb-3">Commencez par créer votre première boutique</p>
        <button class="btn btn-primary" (click)="navigateToCreate()">
          <i class="bi bi-plus-lg me-2"></i>Créer une boutique
        </button>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: all 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
    }
    
    .dropdown-item {
      cursor: pointer;
      padding: 0.5rem 1rem;
    }
    
    .dropdown-item:hover {
      background-color: #f8f9fa;
    }
    
    .btn-link {
      text-decoration: none;
    }
    
    .bg-opacity-10 {
      --bs-bg-opacity: 0.1;
    }
  `],
  standalone: false
})
export class BoutiqueListComponent implements OnInit {
  boutiques: Boutique[] = [];

  constructor(
    private boutiqueService: BoutiqueService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('BoutiqueListComponent ngOnInit called');
    this.loadBoutiques();
  }

  loadBoutiques(): void {
    this.boutiqueService.getAllBoutiques().subscribe({
      next: (boutiques) => {
        this.boutiques = [...boutiques];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading boutiques:', err);
        this.notificationService.error('Erreur lors du chargement des boutiques');
      }
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/admin/boutiques/new']);
  }

  editBoutique(boutique: Boutique): void {
    this.router.navigate(['/admin/boutiques/edit', boutique.boutiqueId]);
  }

  viewStats(boutique: Boutique): void {
    console.log('viewStats called with boutique:', boutique);
    if (boutique && boutique.boutiqueId) {
      console.log('Navigating to stats for boutiqueId:', boutique.boutiqueId);
      this.router.navigate(['/admin/boutiques/stats', boutique.boutiqueId]).then(
        success => console.log('Navigation to stats success:', success),
        error => console.error('Navigation to stats error:', error)
      );
    } else {
      console.error('Cannot navigate to stats - boutique or boutiqueId is missing');
      this.notificationService.error('ID de boutique manquant');
    }
  }

  viewDetails(boutique: Boutique): void {
    console.log('viewDetails called with boutique:', boutique);
    if (boutique && boutique.boutiqueId) {
      console.log('Navigating to details for boutiqueId:', boutique.boutiqueId);
      this.router.navigate(['/admin/boutiques', boutique.boutiqueId]).then(
        success => console.log('Navigation to details success:', success),
        error => console.error('Navigation to details error:', error)
      );
    } else {
      console.error('Cannot navigate to details - boutique or boutiqueId is missing');
      this.notificationService.error('ID de boutique manquant');
    }
  }

  toggleStatus(boutique: Boutique): void {
    this.boutiqueService.toggleSuspendBoutique(boutique.boutiqueId).subscribe({
      next: (updated) => {
        this.notificationService.success(`Boutique ${updated.statut === 'ACTIF' ? 'activée' : 'suspendue'}`);
        this.loadBoutiques();
      },
      error: () => this.notificationService.error('Erreur lors du changement de statut')
    });
  }

  deleteBoutique(boutique: Boutique): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Voulez-vous vraiment supprimer la boutique "${boutique.nom}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boutiqueService.deleteBoutique(boutique.boutiqueId).subscribe({
          next: () => {
            this.notificationService.success('Boutique supprimée avec succès');
            this.loadBoutiques();
          },
          error: () => this.notificationService.error('Erreur lors de la suppression')
        });
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
}
