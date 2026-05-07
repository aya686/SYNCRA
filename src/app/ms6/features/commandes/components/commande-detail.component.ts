import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Commande, CommandeService, Annulation, AnnulationRequest, StatutUpdateRequest } from '../../commandes';
import { NotificationService } from '../../../core';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-commande-detail',
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex align-items-center mb-4">
        <button class="btn btn-outline-secondary btn-sm me-3" (click)="goBack()">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div>
          <h1 class="h3 mb-1" *ngIf="commande">Détails Commande</h1>
          <p class="text-muted mb-0" *ngIf="commande">
            <span class="badge" [ngClass]="getStatusClass(commande.statut)">
              {{ getStatusLabel(commande.statut) }}
            </span>
          </p>
        </div>
        <div class="ms-auto d-flex gap-2">
          <button class="btn btn-outline-primary" (click)="editCommande()" *ngIf="canEdit()">
            <i class="bi bi-pencil me-2"></i>Modifier
          </button>
          <button class="btn btn-outline-danger" (click)="cancelCommande()" *ngIf="canCancel()">
            <i class="bi bi-x-lg me-2"></i>Annuler
          </button>
        </div>
      </div>

      <div class="row g-4" *ngIf="commande">
        <!-- Informations principales -->
        <div class="col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-info-circle me-2 text-primary"></i>Informations</h5>
            </div>
            <div class="card-body">
              <div class="mb-4">
                <h6 class="text-muted mb-2">Date de commande</h6>
                <p class="mb-0">
                  <i class="bi bi-calendar3 me-2"></i>
                  {{ commande.date | date:'dd/MM/yyyy HH:mm' }}
                </p>
              </div>
              
              <div class="mb-4">
                <h6 class="text-muted mb-2">Adresse de livraison</h6>
                <p class="mb-0">{{ commande.adresseLivraison }}</p>
              </div>

              <!-- Informations de promotion -->
              <div class="mb-3" *ngIf="commande.codePromo">
                <h6 class="text-muted mb-2"><i class="bi bi-tag me-1"></i>Code promo appliqué</h6>
                <div class="alert alert-success p-2">
                  <div class="d-flex justify-content-between mb-1">
                    <span>Code:</span>
                    <span class="fw-bold">{{ commande.codePromo }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-1">
                    <span>Type:</span>
                    <span>{{ commande.promotionType === 'POURCENTAGE' ? commande.promotionValeur + '%' : commande.promotionValeur + ' TND' }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span>Remise:</span>
                    <span class="text-success fw-bold">-{{ commande.montantRemise | currency:'EUR' }}</span>
                  </div>
                </div>
              </div>

              <div class="mb-0" *ngIf="commande.codePromo">
                <h6 class="text-muted mb-2">Sous-total</h6>
                <p class="h6 text-decoration-line-through text-muted mb-0">{{ commande.montantAvantRemise | currency:'EUR' }}</p>
              </div>

              <div class="mb-0 mt-3">
                <h6 class="text-muted mb-2">Total</h6>
                <p class="h4 text-primary mb-0">{{ commande.montantTotal | currency:'EUR' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Changer le statut -->
        <div class="col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-arrow-repeat me-2 text-primary"></i>Changer le statut</h5>
            </div>
            <div class="card-body">
              <form [formGroup]="statutForm" (ngSubmit)="updateStatut()">
                <div class="mb-3">
                  <label class="form-label">Nouveau statut</label>
                  <select class="form-select" formControlName="statut">
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="CONFIRMEE">Confirmée</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="LIVREE">Livrée</option>
                    <option value="ANNULEE">Annulée</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary" [disabled]="statutForm.invalid">
                  <i class="bi bi-check-lg me-2"></i>Mettre à jour
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Articles -->
        <div class="col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-cart me-2 text-primary"></i>Articles</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Produit</th>
                      <th>Qté</th>
                      <th>Prix</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let ligne of commande.lignes">
                      <td>{{ ligne.nomProduit }}</td>
                      <td>{{ ligne.quantite }}</td>
                      <td>{{ ligne.prixUnitaire | currency:'EUR' }}</td>
                      <td class="fw-bold">{{ ligne.total | currency:'EUR' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Demande d'annulation -->
        <div class="col-lg-6" *ngIf="canRequestAnnulation()">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-x-circle me-2 text-danger"></i>Demande d'annulation</h5>
            </div>
            <div class="card-body">
              <form [formGroup]="annulationForm" (ngSubmit)="createAnnulation()">
                <div class="mb-3">
                  <label class="form-label">Motif <span class="text-danger">*</span></label>
                  <textarea 
                    class="form-control" 
                    formControlName="motif" 
                    rows="3"
                    [class.is-invalid]="annulationForm.get('motif')?.invalid && annulationForm.get('motif')?.touched">
                  </textarea>
                  <div class="invalid-feedback">Motif requis</div>
                </div>
                <div class="form-check mb-3">
                  <input class="form-check-input" type="checkbox" formControlName="rembourse" id="rembourseCheck">
                  <label class="form-check-label" for="rembourseCheck">
                    Demander un remboursement
                  </label>
                </div>
                <button type="submit" class="btn btn-danger" [disabled]="annulationForm.invalid">
                  <i class="bi bi-exclamation-triangle me-2"></i>Demander l'annulation
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Info annulation existante -->
        <div class="col-lg-6" *ngIf="annulation">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white py-3 d-flex align-items-center">
              <i class="bi bi-info-circle me-2 text-info fs-5"></i>
              <h5 class="mb-0">Demande d'annulation</h5>
              <span class="badge ms-auto" [ngClass]="getAnnulationStatusClass(annulation.statut || '')">
                {{ annulation.statut }}
              </span>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <h6 class="text-muted mb-1">Motif</h6>
                <p class="mb-0">{{ annulation.motif }}</p>
              </div>
              <div class="row">
                <div class="col-6">
                  <h6 class="text-muted mb-1">Date</h6>
                  <p class="mb-0">
                    <i class="bi bi-calendar3 me-1 text-primary"></i>
                    {{ annulation.dateAnnulation | date:'dd/MM/yyyy HH:mm' }}
                  </p>
                </div>
                <div class="col-6">
                  <h6 class="text-muted mb-1">Remboursement</h6>
                  <p class="mb-0">
                    <i class="bi me-1" [class.bi-check-circle-fill]="annulation.rembourse" [class.bi-x-circle-fill]="!annulation.rembourse" [class.text-success]="annulation.rembourse" [class.text-secondary]="!annulation.rembourse"></i>
                    {{ annulation.rembourse ? 'Oui' : 'Non' }}
                  </p>
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
    
    .bg-opacity-25 {
      --bs-bg-opacity: 0.25;
    }
    
    .btn {
      border-radius: 0.5rem;
    }
    
    .table {
      font-size: 0.875rem;
    }
  `],
  standalone: false
})
export class CommandeDetailComponent implements OnInit {
  commande?: Commande;
  annulation?: Annulation;
  statutForm!: FormGroup;
  annulationForm!: FormGroup;
  commandeId?: number;

  constructor(
    private fb: FormBuilder,
    private commandeService: CommandeService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    // Check if id is a valid number (not "new" or undefined)
    this.commandeId = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;
    this.initForms();
    
    if (this.commandeId) {
      this.loadData();
    } else {
      this.notificationService.error('ID de commande manquant ou invalide');
      this.router.navigate(['/admin/commandes']);
    }
  }

  initForms(): void {
    this.statutForm = this.fb.group({
      statut: ['', Validators.required]
    });

    this.annulationForm = this.fb.group({
      motif: ['', [Validators.required, Validators.maxLength(1000)]],
      rembourse: [false]
    });
  }

  loadData(): void {
    if (!this.commandeId) return;

    this.commandeService.getCommandeById(this.commandeId).subscribe({
      next: (commande) => {
        this.commande = commande;
        this.statutForm.patchValue({ statut: commande.statut });
        this.cdr.markForCheck();
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement de la commande');
        this.router.navigate(['/admin/commandes']);
      }
    });

    // Handle 404 gracefully - annulation endpoint may not exist
    this.commandeService.getAnnulation(this.commandeId).subscribe({
      next: (annulation) => {
        this.annulation = annulation;
        this.cdr.markForCheck();
      },
      error: () => {
        // Silently ignore - endpoint may not exist
        this.annulation = undefined;
      }
    });
  }

  canRequestAnnulation(): boolean {
    return this.commande !== undefined && 
           !this.annulation && 
           (this.commande.statut === 'EN_ATTENTE' || this.commande.statut === 'CONFIRMEE' || this.commande.statut === 'EN_COURS');
  }

  updateStatut(): void {
    if (this.statutForm.invalid || !this.commandeId) return;

    const request: StatutUpdateRequest = this.statutForm.value;
    this.commandeService.updateStatut(this.commandeId, request).subscribe({
      next: (commande) => {
        this.commande = commande;
        this.notificationService.success('Statut mis à jour avec succès');
      },
      error: () => {
        this.notificationService.error('Erreur lors de la mise à jour du statut');
      }
    });
  }

  createAnnulation(): void {
    if (this.annulationForm.invalid || !this.commandeId) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la demande',
        message: 'Voulez-vous vraiment demander l\'annulation de cette commande ?',
        confirmText: 'Confirmer',
        cancelText: 'Retour',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.commandeId) {
        const request: AnnulationRequest = this.annulationForm.value;
        this.commandeService.createAnnulation(this.commandeId, request).subscribe({
          next: (annulation) => {
            this.annulation = annulation;
            this.notificationService.success('Demande d\'annulation créée');
          },
          error: () => {
            this.notificationService.error('Erreur lors de la création de la demande');
          }
        });
      }
    });
  }

  // Méthodes pour les badges de statut
  getStatusClass(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'EN_ATTENTE':
        return 'bg-warning text-dark';
      case 'CONFIRMEE':
        return 'bg-info';
      case 'EN_COURS':
        return 'bg-primary';
      case 'LIVREE':
        return 'bg-success';
      case 'ANNULEE':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'EN_ATTENTE':
        return 'En attente';
      case 'CONFIRMEE':
        return 'Confirmée';
      case 'EN_COURS':
        return 'En cours';
      case 'LIVREE':
        return 'Livrée';
      case 'ANNULEE':
        return 'Annulée';
      default:
        return statut || 'Inconnu';
    }
  }

  getAnnulationStatusClass(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'APPROUVEE':
        return 'bg-success';
      case 'REFUSEE':
        return 'bg-danger';
      case 'EN_ATTENTE':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }

  // Méthodes pour les actions
  canEdit(): boolean {
    return this.commande !== undefined && 
           (this.commande.statut === 'EN_ATTENTE' || this.commande.statut === 'CONFIRMEE');
  }

  canCancel(): boolean {
    return this.commande !== undefined && 
           (this.commande.statut === 'EN_ATTENTE' || this.commande.statut === 'CONFIRMEE' || this.commande.statut === 'EN_COURS');
  }

  editCommande(): void {
    if (this.commandeId) {
      this.router.navigate(['/admin/commandes/edit', this.commandeId]);
    }
  }

  cancelCommande(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer l\'annulation',
        message: `Voulez-vous vraiment annuler la commande #${this.commande?.commandeId} ?`,
        confirmText: 'Annuler la commande',
        cancelText: 'Retour',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.commandeId) {
        this.commandeService.updateStatut(this.commandeId, { statut: 'ANNULEE' }).subscribe({
          next: () => {
            this.notificationService.success('Commande annulée avec succès');
            this.loadData();
          },
          error: () => {
            this.notificationService.error('Erreur lors de l\'annulation de la commande');
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/commandes']);
  }
}
