import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Commande, CommandeService } from '../../commandes';
import { NotificationService } from '../../../core';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-commande-list',
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-1">Gestion des commandes</h1>
          <p class="text-muted mb-0">Suivez et gérez les commandes clients</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2" (click)="navigateToCreate()">
          <i class="bi bi-plus-lg"></i>
          Nouvelle commande
        </button>
      </div>

      <!-- Filters -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-6">
              <label class="form-label">Statut</label>
              <select class="form-select" [(ngModel)]="selectedStatut" (change)="onFilterChange()">
                <option value="">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="CONFIRMEE">Confirmée</option>
                <option value="EN_COURS">En cours</option>
                <option value="LIVREE">Livrée</option>
                <option value="ANNULEE">Annulée</option>
              </select>
            </div>
            <div class="col-md-6">
              <button class="btn btn-outline-secondary w-100" (click)="resetFilters()">
                <i class="bi bi-arrow-counterclockwise me-2"></i>Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Commandes List -->
      <div class="row g-4">
        <div class="col-xl-4 col-md-6" *ngFor="let cmd of commandes">
          <div class="card h-100 shadow-sm border-0 commande-card">
            <div class="card-header bg-white border-bottom py-3">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h5 class="card-title mb-1">Commande Client</h5>
                  <small class="text-muted">{{ cmd.date | date:'dd/MM/yyyy HH:mm' }}</small>
                </div>
                <span class="badge" 
                      [class.bg-warning]="cmd.statut === 'EN_ATTENTE'"
                      [class.bg-info]="cmd.statut === 'CONFIRMEE'"
                      [class.bg-primary]="cmd.statut === 'EN_COURS'"
                      [class.bg-success]="cmd.statut === 'LIVREE'"
                      [class.bg-danger]="cmd.statut === 'ANNULEE'">
                  {{ cmd.statut.replace('_', ' ') }}
                </span>
              </div>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <span class="text-muted small">Montant total</span>
                <div class="h4 mb-0 text-primary">{{ cmd.montantTotal | currency:'EUR' }}</div>
              </div>
              <div class="mb-0">
                <span class="text-muted small">Articles</span>
                <div class="h5 mb-0">{{ cmd.lignes.length || 0 }} produit(s)</div>
              </div>
            </div>
            <div class="card-footer bg-white border-top py-3">
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm flex-fill" (click)="viewDetails(cmd)">
                  <i class="bi bi-eye me-1"></i>Détails
                </button>
                <button class="btn btn-outline-secondary btn-sm flex-fill" (click)="updateStatut(cmd)">
                  <i class="bi bi-pencil me-1"></i>Statut
                </button>
                <button 
                  class="btn btn-outline-danger btn-sm" 
                  (click)="deleteCommande(cmd)"
                  title="Supprimer">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="text-center py-5" *ngIf="commandes.length === 0">
        <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 100px; height: 100px;">
          <i class="bi bi-cart-x fs-1 text-muted"></i>
        </div>
        <h5 class="text-muted">Aucune commande</h5>
        <p class="text-muted mb-3">Aucune commande ne correspond à vos critères</p>
        <button class="btn btn-primary" (click)="resetFilters()">
          <i class="bi bi-arrow-counterclockwise me-2"></i>Réinitialiser les filtres
        </button>
      </div>
    </div>
  `,
  styles: [`
    .commande-card {
      transition: all 0.3s ease;
    }
    
    .commande-card:hover {
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
    
    .form-label {
      font-weight: 500;
      color: #495057;
    }
    
    .badge {
      font-size: 0.75rem;
      padding: 0.5em 0.75em;
    }
  `],
  standalone: false
})
export class CommandeListComponent implements OnInit {
  commandes: Commande[] = [];
  selectedStatut = '';

  constructor(
    private commandeService: CommandeService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    const statut = this.selectedStatut || undefined;

    this.commandeService.getAllCommandes(statut, undefined, undefined).subscribe({
      next: (commandes) => {
        this.commandes = [...commandes];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[COMMANDES] Erreur chargement:', err);
        console.error('[COMMANDES] Status:', err.status);
        console.error('[COMMANDES] Message:', err.message);
        console.error('[COMMANDES] URL:', err.url);
        const errorMsg = err.error?.error || err.error?.message || err.message || 'Erreur lors du chargement des commandes';
        this.notificationService.error(errorMsg);
      }
    });
  }

  onFilterChange(): void {
    this.loadCommandes();
  }

  resetFilters(): void {
    this.selectedStatut = '';
    this.loadCommandes();
  }

  deleteCommande(commande: Commande): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Voulez-vous vraiment supprimer la commande #${commande.commandeId} ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.commandeService.deleteCommande(commande.commandeId).subscribe({
          next: () => {
            this.notificationService.success('Commande supprimée avec succès');
            this.loadCommandes();
          },
          error: (err) => {
            const message = err.error?.message || 'Erreur lors de la suppression';
            this.notificationService.error(message);
          }
        });
      }
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/admin/commandes/new']);
  }

  viewDetails(commande: Commande): void {
    this.router.navigate(['/admin/commandes', commande.commandeId]);
  }

  updateStatut(commande: Commande): void {
    this.router.navigate(['/admin/commandes', commande.commandeId]);
  }

  cancelCommande(commande: Commande): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer l\'annulation',
        message: `Voulez-vous vraiment annuler la commande #${commande.commandeId} ?`,
        confirmText: 'Annuler la commande',
        cancelText: 'Retour',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.commandeService.cancelCommande(commande.commandeId).subscribe({
          next: () => {
            this.notificationService.success('Commande annulée avec succès');
            this.loadCommandes();
          },
          error: () => this.notificationService.error('Erreur lors de l\'annulation')
        });
      }
    });
  }

  canCancel(commande: Commande): boolean {
    return commande.statut !== 'ANNULEE' && commande.statut !== 'LIVREE';
  }
}
