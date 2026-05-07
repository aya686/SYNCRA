import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { Promotion, PromotionRequest, PromotionService } from '../';
import { Produit, ProduitService } from '../../produits';
import { NotificationService } from '../../../core';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog.component';
import { ApplyPromotionDialogComponent } from './apply-promotion-dialog.component';

@Component({
  selector: 'app-promotion-list',
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex align-items-center mb-4">
        <button class="btn btn-outline-secondary btn-sm me-3" (click)="goBack()">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div>
          <h1 class="h3 mb-1">Gestion des promotions</h1>
          <p class="text-muted mb-0">Créez et gérez les promotions pour vos produits</p>
        </div>
        <div class="ms-auto">
          <button class="btn btn-primary d-flex align-items-center gap-2" (click)="showCreateForm = !showCreateForm">
            <i class="bi" [class.bi-plus-lg]="!showCreateForm" [class.bi-x-lg]="showCreateForm"></i>
            {{ showCreateForm ? 'Annuler' : 'Nouvelle promotion' }}
          </button>
        </div>
      </div>

      <!-- Formulaire de création - Style Boutique -->
      <div class="row justify-content-center mb-4" *ngIf="showCreateForm">
        <div class="col-lg-8">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-tag me-2 text-primary"></i>Créer une promotion</h5>
            </div>
            <div class="card-body p-4">
              <form [formGroup]="form" (ngSubmit)="createPromotion()">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Type <span class="text-danger">*</span></label>
                    <select class="form-select" formControlName="type" [class.is-invalid]="form.get('type')?.invalid && form.get('type')?.touched">
                      <option value="POURCENTAGE">Pourcentage (%)</option>
                      <option value="FIXE">Montant fixe (€)</option>
                    </select>
                    <div class="invalid-feedback">Type obligatoire</div>
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label">Valeur <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <input type="number" class="form-control" formControlName="valeur" placeholder="Valeur" [class.is-invalid]="form.get('valeur')?.invalid && form.get('valeur')?.touched">
                      <span class="input-group-text">{{ form.get('type')?.value === 'POURCENTAGE' ? '%' : '€' }}</span>
                      <div class="invalid-feedback">Valeur obligatoire</div>
                    </div>
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label">Code promo</label>
                    <input type="text" class="form-control" formControlName="codePromo" placeholder="Optionnel">
                  </div>
                </div>

                <div class="row g-3 mt-2">
                  <div class="col-md-6">
                    <label class="form-label">Date de début</label>
                    <input type="datetime-local" class="form-control" formControlName="dateDebut">
                  </div>
                  
                  <div class="col-md-6">
                    <label class="form-label">Date de fin</label>
                    <input type="datetime-local" class="form-control" formControlName="dateFin">
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-outline-secondary" (click)="showCreateForm = false">
                    <i class="bi bi-x-lg me-2"></i>Annuler
                  </button>
                  <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" [disabled]="form.invalid || loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm"></span>
                    <i *ngIf="!loading" class="bi bi-check-lg"></i>
                    <span *ngIf="!loading">Créer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulaire d'édition - Style Bootstrap -->
      <div class="row justify-content-center mb-4" *ngIf="editingPromotion">
        <div class="col-lg-8">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="bi bi-pencil-square me-2 text-primary"></i>Modifier la promotion</h5>
              <button type="button" class="btn-close" (click)="cancelEdit()"></button>
            </div>
            <div class="card-body p-4">
              <form [formGroup]="editForm" (ngSubmit)="updatePromotion()">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Type <span class="text-danger">*</span></label>
                    <select class="form-select" formControlName="type" [class.is-invalid]="editForm.get('type')?.invalid && editForm.get('type')?.touched">
                      <option value="POURCENTAGE">Pourcentage (%)</option>
                      <option value="FIXE">Montant fixe (€)</option>
                    </select>
                    <div class="invalid-feedback">Type obligatoire</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Valeur <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <input type="number" class="form-control" formControlName="valeur" placeholder="Valeur" [class.is-invalid]="editForm.get('valeur')?.invalid && editForm.get('valeur')?.touched">
                      <span class="input-group-text">{{ editForm.get('type')?.value === 'POURCENTAGE' ? '%' : '€' }}</span>
                      <div class="invalid-feedback">Valeur obligatoire</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Code promo</label>
                    <input type="text" class="form-control" formControlName="codePromo" placeholder="Optionnel">
                  </div>
                </div>
                <div class="row g-3 mt-2">
                  <div class="col-md-6">
                    <label class="form-label">Date de début</label>
                    <input type="datetime-local" class="form-control" formControlName="dateDebut">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Date de fin</label>
                    <input type="datetime-local" class="form-control" formControlName="dateFin">
                  </div>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-outline-secondary" (click)="cancelEdit()">
                    <i class="bi bi-x-lg me-2"></i>Annuler
                  </button>
                  <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" [disabled]="editForm.invalid || loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm"></span>
                    <i *ngIf="!loading" class="bi bi-check-lg"></i>
                    <span *ngIf="!loading">Mettre à jour</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des promotions - Style Bootstrap -->
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0"><i class="bi bi-list me-2 text-primary"></i>Liste des promotions</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Période</th>
                  <th>Statut</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let promo of promotions">
                  <td>
                    <span class="fw-medium">{{ promo.codePromo || 'N/A' }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="promo.type === 'POURCENTAGE' ? 'bg-info' : 'bg-primary'">
                      {{ promo.type === 'POURCENTAGE' ? '%' : '€' }} {{ promo.valeur }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">
                      <i class="bi bi-calendar3 me-1"></i>
                      {{ promo.dateDebut | date:'dd/MM/yy' }} - {{ promo.dateFin | date:'dd/MM/yy' }}
                    </small>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="promo.active ? 'bg-success' : 'bg-secondary'">
                      {{ promo.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-success me-1" (click)="openApplyDialog(promo)" title="Appliquer à un produit">
                      <i class="bi bi-cart-plus"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-1" (click)="editPromotion(promo)" title="Modifier">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deletePromotion(promo)" title="Supprimer">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <!-- Loading -->
                <tr *ngIf="loading">
                  <td colspan="5" class="text-center py-4">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="visually-hidden">Chargement...</span>
                    </div>
                    <span class="ms-2 text-muted">Chargement...</span>
                  </td>
                </tr>
                <!-- Empty state -->
                <tr *ngIf="!loading && promotions.length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                    Aucune promotion disponible
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 0.75rem;
    }
    
    .card-header {
      border-radius: 0.75rem 0.75rem 0 0 !important;
    }
    
    .btn {
      border-radius: 0.5rem;
    }
    
    .table {
      font-size: 0.875rem;
    }
    
    .table th {
      font-weight: 600;
      color: #495057;
    }
    
    .form-label {
      font-weight: 500;
      color: #495057;
    }
    
    .form-control:focus, .form-select:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.2rem rgba(25, 118, 210, 0.25);
    }
  `],
  standalone: false
})
export class PromotionListComponent implements OnInit, OnDestroy {
  promotions: Promotion[] = [];
  displayedColumns = ['code', 'type', 'dates', 'statut', 'actions'];
  showCreateForm = false;
  form!: FormGroup;
  produits: Produit[] = [];

  loading = false;
  editingPromotion: Promotion | null = null;
  editForm!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService,
    private promotionService: PromotionService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPromotions();
    this.loadProduits();

    // Recharger les promotions à chaque navigation vers cette route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => event.urlAfterRedirects === '/admin/promotions'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadPromotions();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.form = this.fb.group({
      type: ['POURCENTAGE', Validators.required],
      valeur: ['', [Validators.required, Validators.min(0)]],
      dateDebut: [''],
      dateFin: [''],
      codePromo: ['', Validators.maxLength(50)]
    });
  }

  loadPromotions(): void {
    this.loading = true;
    this.promotionService.getAllPromotions().subscribe({
      next: (promotions: Promotion[]) => {
        console.log('Promotions chargées:', promotions);
        this.promotions = promotions;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement promotions:', err);
        this.loading = false;
        this.notificationService.error('Erreur lors du chargement des promotions');
      }
    });
  }

  loadProduits(): void {
    this.produitService.getAllProduits(true).subscribe({
      next: (produits: Produit[]) => this.produits = produits
    });
  }

  createPromotion(): void {
    if (this.form.invalid) return;

    const request: PromotionRequest = this.form.value;
    this.promotionService.createPromotion(request).subscribe({
      next: () => {
        this.notificationService.success('Promotion créée avec succès');
        this.showCreateForm = false;
        this.form.reset({ type: 'POURCENTAGE' });
        this.loadPromotions();
      },
      error: () => {
        this.notificationService.error('Erreur lors de la création de la promotion');
      }
    });
  }

  openApplyDialog(promotion: Promotion): void {
    const dialogRef = this.dialog.open(ApplyPromotionDialogComponent, {
      data: { promotion, produits: this.produits }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.promotionService.applyPromotionToProduit(promotion.promoId, result).subscribe({
          next: () => {
            this.notificationService.success('Promotion appliquée avec succès');
          },
          error: () => {
            this.notificationService.error('Erreur lors de l\'application de la promotion');
          }
        });
      }
    });
  }

  deletePromotion(promotion: Promotion): void {
    console.log('[DELETE] Tentative suppression promotion:', promotion);
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Voulez-vous vraiment supprimer la promotion "${promotion.codePromo || promotion.promoId}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('[DELETE] Dialog result:', result);
      if (result) {
        console.log('[DELETE] Appel API suppression promotion ID:', promotion.promoId);
        this.promotionService.deletePromotion(promotion.promoId).subscribe({
          next: () => {
            console.log('[DELETE] Succès suppression promotion');
            this.notificationService.success('Promotion supprimée avec succès');
            this.loadPromotions();
          },
          error: (err: any) => {
            console.error('[DELETE] Erreur suppression promotion:', err);
            console.error('[DELETE] Status:', err.status);
            console.error('[DELETE] Message:', err.message);
            console.error('[DELETE] Error body:', err.error);
            const message = err.error?.message || err.message || 'Erreur lors de la suppression';
            this.notificationService.error(message);
          }
        });
      }
    });
  }

  editPromotion(promotion: Promotion): void {
    this.editingPromotion = promotion;
    this.editForm = this.fb.group({
      type: [promotion.type, Validators.required],
      valeur: [promotion.valeur, [Validators.required, Validators.min(0)]],
      dateDebut: [promotion.dateDebut ? promotion.dateDebut.slice(0, 16) : ''],
      dateFin: [promotion.dateFin ? promotion.dateFin.slice(0, 16) : ''],
      codePromo: [promotion.codePromo || '', Validators.maxLength(50)]
    });
  }

  updatePromotion(): void {
    if (this.editForm.invalid || !this.editingPromotion) return;

    const request: PromotionRequest = this.editForm.value;
    this.loading = true;
    this.promotionService.updatePromotion(this.editingPromotion.promoId, request).subscribe({
      next: () => {
        this.notificationService.success('Promotion mise à jour avec succès');
        this.editingPromotion = null;
        this.loading = false;
        this.loadPromotions();
      },
      error: () => {
        this.notificationService.error('Erreur lors de la mise à jour');
        this.loading = false;
      }
    });
  }

  cancelEdit(): void {
    this.editingPromotion = null;
  }

  goBack(): void {
    this.router.navigate(['/admin/produits']);
  }
}
