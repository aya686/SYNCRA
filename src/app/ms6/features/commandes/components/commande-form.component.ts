import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommandeRequest, CommandeService, PromoValidationResponse } from '../../commandes';
import { NotificationService } from '../../../core';
import { Produit, ProduitService } from '../../../features/produits';

@Component({
  selector: 'app-commande-form',
  template: `
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <!-- Header -->
          <div class="d-flex align-items-center mb-4">
            <button class="btn btn-outline-secondary btn-sm me-3" (click)="goBack()">
              <i class="bi bi-arrow-left"></i>
            </button>
            <div>
              <h1 class="h3 mb-1">Nouvelle Commande</h1>
              <p class="text-muted mb-0">Créez une nouvelle commande pour vos clients</p>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row g-4">
              <!-- Colonne principale -->
              <div class="col-lg-8">
                <!-- Adresse de livraison -->
                <div class="card shadow-sm border-0 mb-4">
                  <div class="card-header bg-white py-3">
                    <h5 class="mb-0"><i class="bi bi-truck me-2 text-primary"></i>Informations de Livraison</h5>
                  </div>
                  <div class="card-body p-4">
                    <div class="mb-3">
                      <label class="form-label">Adresse de livraison <span class="text-danger">*</span></label>
                      <textarea 
                        class="form-control" 
                        formControlName="adresseLivraison" 
                        rows="3" 
                        placeholder="Numéro, rue, code postal, ville, pays"
                        [class.is-invalid]="form.get('adresseLivraison')?.invalid && form.get('adresseLivraison')?.touched">
                      </textarea>
                      <div class="invalid-feedback" *ngIf="form.get('adresseLivraison')?.hasError('required')">
                        L'adresse de livraison est obligatoire
                      </div>
                      <div class="form-text text-end">{{form.get('adresseLivraison')?.value?.length || 0}}/500</div>
                    </div>
                  </div>
                </div>

                <!-- Articles -->
                <div class="card shadow-sm border-0">
                  <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 class="mb-0"><i class="bi bi-cart me-2 text-primary"></i>Articles Commandés</h5>
                    <span class="badge bg-secondary">{{ lignes.length }} article(s)</span>
                  </div>
                  <div class="card-body p-4">
                    <div formArrayName="lignes">
                      <div *ngFor="let ligne of lignes.controls; let i = index" [formGroupName]="i" class="article-row mb-3 p-3 border rounded-3 bg-light">
                        <div class="row g-3 align-items-end">
                          <div class="col-md-5">
                            <label class="form-label small text-muted">Produit <span class="text-danger">*</span></label>
                            <select class="form-select" formControlName="produitId" [class.is-invalid]="ligne.get('produitId')?.invalid && ligne.get('produitId')?.touched">
                              <option value="">Sélectionner un produit</option>
                              <option *ngFor="let produit of produits" [value]="produit.produitId">
                                {{ produit.nom }} - {{ produit.prix | currency:'EUR' }}
                              </option>
                            </select>
                            <div class="invalid-feedback">Sélectionnez un produit</div>
                            <small class="text-muted" *ngIf="getProduit(i)">
                              <i class="bi bi-box-seam me-1"></i>
                              Stock: 
                              <span [class.text-warning]="isStockLow(getProduit(i)!)">
                                {{ getProduit(i)?.stock?.quantite || 0 }}
                              </span>
                              <span *ngIf="isStockLow(getProduit(i)!)" class="badge bg-warning text-dark ms-1">Stock bas</span>
                            </small>
                          </div>
                          <div class="col-md-2">
                            <label class="form-label small text-muted">Qté <span class="text-danger">*</span></label>
                            <input 
                              type="number" 
                              class="form-control" 
                              formControlName="quantite" 
                              min="1"
                              [class.is-invalid]="ligne.get('quantite')?.invalid && ligne.get('quantite')?.touched">
                            <div class="invalid-feedback">Min 1</div>
                          </div>
                          <div class="col-md-3">
                            <label class="form-label small text-muted">Prix unitaire</label>
                            <div class="form-control-plaintext fw-bold text-primary">
                              {{ getPrixProduit(i) | currency:'EUR' }}
                            </div>
                          </div>
                          <div class="col-md-2 text-end">
                            <button 
                              type="button" 
                              class="btn btn-outline-danger btn-sm" 
                              (click)="removeLigne(i)"
                              *ngIf="lignes.length > 1">
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                        <div class="row mt-2">
                          <div class="col-12 text-end">
                            <small class="text-muted">Total ligne: </small>
                            <span class="fw-bold">{{ getTotalLigne(i) | currency:'EUR' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button type="button" class="btn btn-outline-primary w-100 mt-3" (click)="addLigne()">
                      <i class="bi bi-plus-lg me-2"></i>Ajouter un article
                    </button>
                  </div>
                </div>
              </div>

              <!-- Colonne latérale -->
              <div class="col-lg-4">
                <div class="card shadow-sm border-0 sticky-top" style="top: 20px;">
                  <div class="card-header bg-white py-3">
                    <h5 class="mb-0"><i class="bi bi-receipt me-2 text-primary"></i>Récapitulatif</h5>
                  </div>
                  <div class="card-body p-4">
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">Nombre d'articles</span>
                      <span class="fw-semibold">{{ lignes.length }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">Total quantités</span>
                      <span class="fw-semibold">{{ getTotalArticles() }}</span>
                    </div>
                    <hr>
                    <!-- Code Promo -->
                    <div class="mb-3">
                      <label class="form-label small text-muted">
                        <i class="bi bi-tag me-1"></i>Code promo
                      </label>
                      <div class="input-group">
                        <input 
                          type="text" 
                          class="form-control" 
                          formControlName="codePromo"
                          placeholder="Entrez un code"
                          [class.is-valid]="promoValidation?.valid"
                          [class.is-invalid]="promoValidation && !promoValidation.valid">
                        <button 
                          type="button" 
                          class="btn btn-outline-primary" 
                          (click)="validatePromoCode()"
                          [disabled]="promoLoading || !form.get('codePromo')?.value">
                          <span *ngIf="promoLoading" class="spinner-border spinner-border-sm"></span>
                          <i *ngIf="!promoLoading" class="bi bi-check-lg"></i>
                        </button>
                      </div>
                      <div class="form-text" *ngIf="promoValidation?.valid" class="text-success">
                        <i class="bi bi-check-circle me-1"></i>{{ promoValidation?.message }}
                      </div>
                      <div class="form-text" *ngIf="promoValidation && !promoValidation.valid" class="text-danger">
                        <i class="bi bi-x-circle me-1"></i>{{ promoValidation.message }}
                      </div>
                    </div>

                    <!-- Récapitulatif des montants -->
                    <div class="mb-2" *ngIf="promoValidation?.valid">
                      <div class="d-flex justify-content-between mb-1">
                        <span class="text-muted small">Sous-total</span>
                        <span class="text-decoration-line-through">{{ promoValidation?.montantAvantRemise | currency:'EUR' }}</span>
                      </div>
                      <div class="d-flex justify-content-between mb-1 text-success">
                        <span class="small"><i class="bi bi-tag me-1"></i>Remise ({{ promoValidation?.type === 'POURCENTAGE' ? promoValidation?.valeur + '%' : promoValidation?.valeur + ' TND' }})</span>
                        <span>-{{ promoValidation?.montantRemise | currency:'EUR' }}</span>
                      </div>
                    </div>

                    <hr *ngIf="promoValidation?.valid">

                    <div class="d-flex justify-content-between align-items-center mb-4">
                      <span class="h5 mb-0">Total TTC</span>
                      <span class="h4 mb-0 text-primary fw-bold">
                        {{ promoValidation?.valid ? (promoValidation?.montantApresRemise | currency:'EUR') : (calculerTotal() | currency:'EUR') }}
                      </span>
                    </div>

                    <button 
                      type="submit" 
                      class="btn btn-primary w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                      [disabled]="form.invalid || loading">
                      <span *ngIf="loading" class="spinner-border spinner-border-sm"></span>
                      <i *ngIf="!loading" class="bi bi-check-lg"></i>
                      {{ loading ? 'Création...' : 'Créer la commande' }}
                    </button>
                    
                    <button type="button" class="btn btn-outline-secondary w-100" (click)="goBack()">
                      <i class="bi bi-x-lg me-2"></i>Annuler
                    </button>
                  </div>
                </div>

                <!-- Info -->
                <div class="alert alert-info mt-3 d-flex align-items-center">
                  <i class="bi bi-lightbulb me-2 fs-5"></i>
                  <small>Les produits avec <span class="badge bg-warning text-dark">stock bas</span> sont signalés.</small>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-label {
      font-weight: 500;
      color: #495057;
    }
    
    .form-control:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.2rem rgba(25, 118, 210, 0.25);
    }
    
    .form-select:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.2rem rgba(25, 118, 210, 0.25);
    }
    
    .card {
      border-radius: 0.75rem;
    }
    
    .card-header {
      border-radius: 0.75rem 0.75rem 0 0 !important;
    }
    
    .btn {
      border-radius: 0.5rem;
    }
    
    .article-row {
      transition: all 0.2s ease;
    }
    
    .article-row:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  `],
  standalone: false
})
export class CommandeFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  produits: Produit[] = [];
  promoLoading = false;
  promoValidation: PromoValidationResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private commandeService: CommandeService,
    private produitService: ProduitService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProduits();
  }

  initForm(): void {
    this.form = this.fb.group({
      adresseLivraison: ['', [Validators.required, Validators.maxLength(500)]],
      lignes: this.fb.array([this.createLigne()]),
      codePromo: ['']
    });
  }

  get lignes(): FormArray {
    return this.form.get('lignes') as FormArray;
  }

  createLigne(): FormGroup {
    return this.fb.group({
      produitId: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]]
    });
  }

  addLigne(): void {
    this.lignes.push(this.createLigne());
  }

  removeLigne(index: number): void {
    this.lignes.removeAt(index);
  }

  loadProduits(): void {
    this.produitService.getAllProduits(true).subscribe({
      next: (produits) => this.produits = produits
    });
  }

  calculerTotal(): number {
    let total = 0;
    this.lignes.controls.forEach(ligne => {
      const produitId = ligne.get('produitId')?.value;
      const quantite = ligne.get('quantite')?.value || 0;
      const produit = this.produits.find(p => p.produitId === produitId);
      if (produit) {
        const prix = produit.prixPromo || produit.prix;
        total += prix * quantite;
      }
    });
    return total;
  }

  getPrixProduit(index: number): number {
    const ligne = this.lignes.at(index);
    const produitId = ligne.get('produitId')?.value;
    const produit = this.produits.find(p => p.produitId === produitId);
    return produit ? (produit.prixPromo || produit.prix) : 0;
  }

  getTotalLigne(index: number): number {
    const ligne = this.lignes.at(index);
    const produitId = ligne.get('produitId')?.value;
    const quantite = ligne.get('quantite')?.value || 0;
    const produit = this.produits.find(p => p.produitId === produitId);
    if (produit) {
      const prix = produit.prixPromo || produit.prix;
      return prix * quantite;
    }
    return 0;
  }

  getTotalArticles(): number {
    return this.lignes.controls.reduce((total, ligne) => {
      return total + (ligne.get('quantite')?.value || 0);
    }, 0);
  }

  getProduit(index: number): Produit | null {
    const ligne = this.lignes.at(index);
    const produitId = ligne.get('produitId')?.value;
    if (!produitId) return null;
    return this.produits.find(p => p.produitId === produitId) || null;
  }

  isStockLow(produit: Produit): boolean {
    return produit.stock !== undefined && produit.stock !== null && 
           produit.stock.seuilAlerte !== undefined &&
           produit.stock.quantite <= produit.stock.seuilAlerte;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const request: CommandeRequest = this.form.value;

    this.commandeService.createCommande(request).subscribe({
      next: () => {
        this.notificationService.success('Commande créée avec succès');
        this.router.navigate(['/admin/commandes']);
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Erreur lors de la création de la commande');
      }
    });
  }

  validatePromoCode(): void {
    const codePromo = this.form.get('codePromo')?.value;
    if (!codePromo) return;

    this.promoLoading = true;
    const montantTotal = this.calculerTotal();

    this.commandeService.validatePromoCode(codePromo, montantTotal).subscribe({
      next: (response) => {
        this.promoValidation = response;
        this.promoLoading = false;
      },
      error: () => {
        this.promoValidation = {
          valid: false,
          message: 'Erreur lors de la validation du code promo'
        };
        this.promoLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/commandes']);
  }
}
