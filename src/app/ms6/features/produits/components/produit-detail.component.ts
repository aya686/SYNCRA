import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Produit, ProduitRequest, ProduitService, Stock, StockRequest } from '../../produits';
import { NotificationService } from '../../../core';
import { Boutique, BoutiqueService } from '../../boutiques';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-produit-detail',
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex align-items-center mb-4">
        <button class="btn btn-outline-secondary btn-sm me-3" (click)="goBack()">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div>
          <h1 class="h3 mb-1" *ngIf="produit">{{ produit.nom }}</h1>
          <p class="text-muted mb-0" *ngIf="produit">
            <span class="badge" [class.bg-secondary]="produit.archive" [class.bg-primary]="!produit.archive">
              {{ produit.archive ? 'Archivé' : 'En vente' }}
            </span>
          </p>
        </div>
        <div class="ms-auto d-flex gap-2">
          <button class="btn btn-outline-secondary" (click)="editProduit()">
            <i class="bi bi-pencil me-2"></i>Modifier
          </button>
          <button class="btn btn-outline-danger" (click)="deleteProduit()">
            <i class="bi bi-trash me-2"></i>Supprimer
          </button>
        </div>
      </div>

      <div class="row g-4" *ngIf="produit">
        <!-- Image Card - Grande taille comme Boutique -->
        <div class="col-lg-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-image me-2 text-primary"></i>Image du produit</h5>
            </div>
            <div class="card-body text-center p-4">
              <!-- Image principale -->
              <div *ngIf="produit.images" class="mb-3">
                <img [src]="produit.images" class="img-fluid rounded-3 shadow-sm" style="max-height: 300px; width: 100%; object-fit: contain;" alt="Image produit">
              </div>
              <!-- Placeholder si pas d'image -->
              <div *ngIf="!produit.images" class="bg-light rounded-3 d-flex flex-column align-items-center justify-content-center p-5">
                <i class="bi bi-box-seam fs-1 text-muted mb-2"></i>
                <span class="text-muted">Aucune image disponible</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Card -->
        <div class="col-lg-8">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-info-circle me-2 text-primary"></i>Informations du produit</h5>
            </div>
            <div class="card-body">
              <!-- Description -->
              <div class="mb-4">
                <h6 class="text-muted mb-2">Description</h6>
                <p class="mb-0">{{ produit.description || 'Aucune description disponible' }}</p>
              </div>

              <hr class="my-4">
              
              <!-- Grille d'infos -->
              <div class="row g-4">
                <!-- Prix -->
                <div class="col-md-6">
                  <div class="d-flex align-items-center">
                    <div class="bg-success bg-opacity-10 rounded-3 p-3 me-3">
                      <i class="bi bi-currency-euro fs-4 text-success"></i>
                    </div>
                  <div>
                    <h6 class="text-muted mb-1">Prix</h6>
                      <p class="h5 mb-0" [class.text-danger]="produit.prixPromo">
                        {{ (produit.prixPromo || produit.prix) | number:'1.3-3' }} DT
                        <span *ngIf="produit.prixPromo" class="text-decoration-line-through text-muted fs-6 ms-2">
                          {{ produit.prix | number:'1.3-3' }} DT
                        </span>
                      </p>

                    <small *ngIf="produit.prixPromo" class="text-success">
                      <i class="bi bi-tag-fill me-1"></i>Promo en cours
                    </small>
                  </div>
                  </div>
                </div>
                
                <!-- Boutique -->
                <div class="col-md-6">
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 rounded-3 p-3 me-3">
                      <i class="bi bi-shop fs-4 text-primary"></i>
                    </div>
                    <div>
                      <h6 class="text-muted mb-1">Boutique</h6>
                      <span class="badge bg-primary">{{ getBoutiqueName(produit.boutiqueId) }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Catégories -->
                <div class="col-md-6">
                  <h6 class="text-muted mb-2">Catégories</h6>
                  <p class="mb-0">
                    <span class="badge bg-secondary me-1" *ngFor="let cat of getCategoriesArray(produit.categories)">
                      {{ cat }}
                    </span>
                    <span *ngIf="!produit.categories" class="text-muted">Aucune catégorie</span>
                  </p>
                </div>
                
                <!-- Promotions -->
                <div class="col-md-6" *ngIf="produit.promotionIds && produit.promotionIds.length > 0">
                  <h6 class="text-muted mb-2">Promotions actives</h6>
                  <p class="mb-0">
                    <span class="badge bg-warning text-dark me-1" *ngFor="let promoId of produit.promotionIds">
                      <i class="bi bi-tag-fill me-1"></i>#{{ promoId }}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stock Card -->
        <div class="col-lg-6">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-box-seam me-2 text-primary"></i>Gestion du Stock</h5>
            </div>
            <div class="card-body">
              <!-- Affichage stock actuel -->
              <div *ngIf="stock" class="mb-4">
                <div class="row g-3">
                  <div class="col-6">
                    <div class="d-flex align-items-center">
                      <div class="bg-primary bg-opacity-10 rounded-3 p-3 me-3">
                        <i class="bi bi-box fs-4 text-primary"></i>
                      </div>
                      <div>
                        <h3 class="mb-0">{{ stock.quantite }}</h3>
                        <p class="text-muted mb-0">unités en stock</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="d-flex align-items-center">
                      <div class="bg-warning bg-opacity-10 rounded-3 p-3 me-3">
                        <i class="bi bi-exclamation-triangle fs-4 text-warning"></i>
                      </div>
                      <div>
                        <h3 class="mb-0">{{ stock.seuilAlerte }}</h3>
                        <p class="text-muted mb-0">seuil d'alerte</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Alerte stock faible -->
                <div *ngIf="isStockLow()" class="alert alert-warning mt-3 mb-0">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>Attention !</strong> Stock faible - Réapprovisionnement recommandé
                </div>
              </div>

              <hr *ngIf="stock">

              <!-- Formulaire mise à jour stock -->
              <h6 class="text-muted mb-3">Mettre à jour le stock</h6>
              <form [formGroup]="stockForm" (ngSubmit)="updateStock()">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label small">Quantité</label>
                    <input type="number" class="form-control" formControlName="quantite" min="0">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small">Seuil d'alerte</label>
                    <input type="number" class="form-control" formControlName="seuilAlerte" min="0">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small">Entrepôt</label>
                    <input type="text" class="form-control" formControlName="entrepot" placeholder="Nom">
                  </div>
                </div>
                <div class="mt-3">
                  <button type="submit" class="btn btn-primary w-100" [disabled]="stockForm.invalid">
                    <i class="bi bi-check-lg me-2"></i>Mettre à jour le stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Actions Card -->
        <div class="col-lg-6">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-gear me-2 text-primary"></i>Actions</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button class="btn btn-outline-warning" (click)="archiveProduit()" *ngIf="!produit.archive">
                  <i class="bi bi-archive me-2"></i>Archiver le produit
                </button>
                <button class="btn btn-outline-success" (click)="unarchiveProduit()" *ngIf="produit.archive">
                  <i class="bi bi-arrow-counterclockwise me-2"></i>Restaurer le produit
                </button>
                <button class="btn btn-outline-primary" (click)="applyPromotion()">
                  <i class="bi bi-tag me-2"></i>Appliquer une promotion
                </button>
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
    
    .img-fluid {
      transition: transform 0.3s ease;
    }
    
    .img-fluid:hover {
      transform: scale(1.05);
    }
  `],
  standalone: false
})
export class ProduitDetailComponent implements OnInit {
  produit?: Produit;
  stock?: Stock;
  stockForm!: FormGroup;
  produitId?: number;
  boutiques: Boutique[] = [];

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService,
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
    this.produitId = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;
    console.log('ProduitDetail - produitId from route:', this.produitId);
    this.initStockForm();
    this.loadBoutiques();
    
    if (this.produitId) {
      this.loadData();
    } else {
      console.error('ProduitDetail - No valid produitId provided, idParam was:', idParam);
      this.notificationService.error('ID de produit manquant ou invalide');
      this.router.navigate(['/admin/produits']);
    }
  }

  initStockForm(): void {
    this.stockForm = this.fb.group({
      quantite: [0, [Validators.required, Validators.min(0)]],
      seuilAlerte: [0, Validators.min(0)],
      entrepot: ['']
    });
  }

  loadBoutiques(): void {
    this.boutiqueService.getAllBoutiques().subscribe({
      next: (boutiques) => {
        this.boutiques = boutiques;
        this.cdr.markForCheck();
      }
    });
  }

  loadData(): void {
    if (this.produitId) {
      console.log('ProduitDetail - Loading data for produitId:', this.produitId);
      
      this.produitService.getProduitById(this.produitId).subscribe({
        next: (produit) => {
          console.log('ProduitDetail - Produit loaded:', produit);
          this.produit = produit;
          this.cdr.markForCheck();  // Force update UI
        },
        error: (err) => {
          console.error('ProduitDetail - Error loading produit:', err);
          this.notificationService.error(`Erreur lors du chargement du produit: ${err.status || 'Unknown'}`);
          // Don't navigate away immediately, let user see the error
        }
      });

      this.produitService.getStock(this.produitId).subscribe({
        next: (stock) => {
          console.log('ProduitDetail - Stock loaded:', stock);
          this.stock = stock;
          this.stockForm.patchValue(stock);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.warn('ProduitDetail - Error loading stock:', err);
          // Stock is optional
        }
      });
    }
  }

  hasImage(images: string | undefined): boolean {
    if (!images) return false;
    const imageArray = images.split(',').map(img => img.trim()).filter(img => img.length > 0);
    return imageArray.length > 0;
  }

  getImagesArray(images: string | undefined): string[] {
    if (!images) return [];
    const imageArray = images.split(',').map(img => img.trim()).filter(img => img.length > 0);
    if (imageArray.length === 0) return [];
    // Map each image and add data URI prefix if missing
    return imageArray.map(img => {
      if (img.startsWith('data:image/')) {
        return img;
      }
      return 'data:image/jpeg;base64,' + img;
    });
  }

  getPlaceholderImage(): string {
    // Return a simple SVG placeholder as data URI
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjFmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  getCategoriesArray(categories: string | undefined): string[] {
    if (!categories) return [];
    return categories.split(',').map(cat => cat.trim()).filter(cat => cat);
  }

  getBoutiqueName(boutiqueId: number): string {
    const boutique = this.boutiques.find(b => b.boutiqueId === boutiqueId);
    return boutique ? boutique.nom : 'Boutique';
  }

  isStockLow(): boolean {
    return !!this.stock && 
           this.stock.seuilAlerte !== undefined &&
           this.stock.quantite <= this.stock.seuilAlerte;
  }

  updateStock(): void {
    if (this.stockForm.invalid || !this.produitId) return;

    const request: StockRequest = this.stockForm.value;
    this.produitService.updateStock(this.produitId, request).subscribe({
      next: (stock) => {
        this.stock = stock;
        this.notificationService.success('Stock mis à jour avec succès');
      },
      error: () => {
        this.notificationService.error('Erreur lors de la mise à jour du stock');
      }
    });
  }

  archiveProduit(): void {
    if (!this.produit) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer l\'archivage',
        message: `Voulez-vous vraiment archiver le produit "${this.produit.nom}" ?`,
        confirmText: 'Archiver',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.produit) {
        this.produitService.archiveProduit(this.produit.produitId).subscribe({
          next: () => {
            this.notificationService.success('Produit archivé avec succès');
            this.loadData();
          },
          error: () => this.notificationService.error('Erreur lors de l\'archivage')
        });
      }
    });
  }

  unarchiveProduit(): void {
    if (!this.produit) {
      console.error('Cannot unarchive - no produit loaded');
      return;
    }
    
    console.log('Restoring product from detail view:', this.produit);
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la restauration',
        message: `Voulez-vous vraiment restaurer le produit "${this.produit.nom}" ?`,
        confirmText: 'Restaurer',
        cancelText: 'Annuler',
        confirmColor: 'primary'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.produit) {
        console.log('Calling unarchiveProduit endpoint for id:', this.produit.produitId);
        
        // Use the dedicated unarchive endpoint
        this.produitService.unarchiveProduit(this.produit.produitId).subscribe({
          next: (response) => {
            console.log('Product restored successfully:', response);
            this.notificationService.success('Produit restauré avec succès');
            this.loadData();  // Reload to show updated status
          },
          error: (err) => {
            console.error('Error restoring product:', err);
            this.notificationService.error(`Erreur lors de la restauration: ${err.status || 'Unknown'}`);
          }
        });
      }
    });
  }

  deleteProduit(): void {
    if (!this.produit) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Voulez-vous vraiment supprimer définitivement le produit "${this.produit.nom}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.produit) {
        this.produitService.deleteProduit(this.produit.produitId).subscribe({
          next: () => {
            this.notificationService.success('Produit supprimé avec succès');
            this.router.navigate(['/admin/produits']);
          },
          error: (err) => {
            // Afficher le message d'erreur spécifique du backend (409 CONFLICT)
            const message = err.error?.error || err.message || 'Erreur lors de la suppression';
            this.notificationService.error(message);
          }
        });
      }
    });
  }

  applyPromotion(): void {
    if (this.produit) {
      this.router.navigate(['/admin/promotions'], { 
        queryParams: { produitId: this.produit.produitId } 
      });
    }
  }

  editProduit(): void {
    if (this.produit) {
      this.router.navigate(['/admin/produits/edit', this.produit.produitId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/produits']);
  }
}
