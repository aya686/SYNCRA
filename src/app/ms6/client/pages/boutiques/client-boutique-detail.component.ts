import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Boutique, BoutiqueService } from '../../../features/boutiques';
import { NotificationService } from '../../../core';
import { Produit, ProduitService } from '../../../features/produits';

@Component({
  selector: 'app-client-boutique-detail',
  template: `
    <div class="client-page">
      <!-- Breadcrumb -->
      <div class="breadcrumb-bar">
        <button class="btn-back" (click)="goBack()">
          <i class="bi bi-arrow-left"></i>
          Retour aux boutiques
        </button>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <!-- Boutique Detail -->
      <div class="boutique-detail" *ngIf="!loading && boutique">
        
        <!-- Header Card -->
        <div class="header-card">
          <div class="boutique-logo">
            <img *ngIf="boutique.logo" [src]="boutique.logo" alt="{{ boutique.nom }}">
            <i *ngIf="!boutique.logo" class="bi bi-shop"></i>
          </div>
          <div class="boutique-info">
            <h1>{{ boutique.nom }}</h1>
            <span class="status-badge" [class.active]="boutique.statut === 'ACTIF'">
              {{ boutique.statut === 'ACTIF' ? 'Boutique Active' : 'Boutique en pause' }}
            </span>
            <p class="description" *ngIf="boutique.description">{{ boutique.description }}</p>
          </div>
        </div>

        <!-- Info Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <i class="bi bi-calendar3"></i>
            <div class="stat-info">
              <span class="stat-label">Créée le</span>
              <span class="stat-value">{{ boutique.dateCreation | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="bi bi-box-seam"></i>
            <div class="stat-info">
              <span class="stat-label">Produits</span>
              <span class="stat-value">{{ produits.length }}</span>
            </div>
          </div>
        </div>

        <!-- Produits Section -->
        <div class="section-card">
          <div class="section-header">
            <h3><i class="bi bi-box-seam"></i> Produits de cette boutique</h3>
          </div>
          
          <div class="produits-grid" *ngIf="produits.length > 0">
            <div class="produit-card" *ngFor="let produit of produits" (click)="viewProduit(produit)">
              <div class="produit-image" *ngIf="produit.images">
                <img [src]="produit.images" alt="{{ produit.nom }}">
              </div>
              <div class="produit-image placeholder" *ngIf="!produit.images">
                <i class="bi bi-box-seam"></i>
              </div>
              <div class="produit-info">
                <h4>{{ produit.nom }}</h4>
                <div class="price-row">
                  <span class="current-price">{{ (produit.prixPromo || produit.prix) | number:'1.3-3' }} DT</span>
                  <span class="original-price" *ngIf="produit.prixPromo">{{ produit.prix | number:'1.3-3' }} DT</span>
                </div>
                <span class="promo-badge" *ngIf="produit.prixPromo">Promo</span>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="produits.length === 0">
            <div class="empty-icon">
              <i class="bi bi-box"></i>
            </div>
            <h4>Aucun produit disponible</h4>
            <p>Cette boutique n'a pas encore de produits en stock</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-bar">
          <button class="btn btn-primary" (click)="router.navigate(['/produits'])" [disabled]="produits.length === 0">
            <i class="bi bi-box-seam"></i>
            Voir tous les produits
          </button>
          <button class="btn btn-secondary" (click)="router.navigate(['/commandes/new'])">
            <i class="bi bi-cart-plus"></i>
            Passer une commande
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="!loading && !boutique">
        <div class="error-icon">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <h3>Boutique non trouvée</h3>
        <button class="btn btn-primary" (click)="goBack()">
          Retour aux boutiques
        </button>
      </div>
    </div>
  `,
  styles: [`
    .client-page {
      padding: 1rem 0;
    }

    .breadcrumb-bar {
      margin-bottom: 1.5rem;
    }

    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-back:hover {
      background: #e5e7eb;
    }

    /* Loading */
    .loading-state {
      text-align: center;
      padding: 4rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid #f3f4f6;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Header Card */
    .header-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .boutique-logo {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .boutique-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 16px;
    }

    .boutique-logo i {
      font-size: 3rem;
      color: #fff;
    }

    .boutique-info {
      flex: 1;
    }

    .boutique-info h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: #fee2e2;
      color: #ef4444;
      border-radius: 50px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .status-badge.active {
      background: #d1fae5;
      color: #10b981;
    }

    .description {
      color: #6b7280;
      font-size: 1rem;
      line-height: 1.5;
      margin: 0;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .stat-card i {
      width: 48px;
      height: 48px;
      background: #eff6ff;
      color: #3b82f6;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      color: #9ca3af;
      font-size: 0.875rem;
    }

    .stat-value {
      color: #1f2937;
      font-weight: 700;
      font-size: 1.25rem;
    }

    /* Section Card */
    .section-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .section-header {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .section-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0;
    }

    .section-header h3 i {
      color: #3b82f6;
    }

    /* Produits Grid */
    .produits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .produit-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .produit-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      transform: translateY(-4px);
    }

    .produit-image {
      height: 160px;
      background: #f9fafb;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .produit-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .produit-image.placeholder {
      font-size: 3rem;
      color: #d1d5db;
    }

    .produit-info {
      padding: 1.25rem;
    }

    .produit-info h4 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.75rem;
    }

    .price-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .current-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #3b82f6;
    }

    .original-price {
      font-size: 0.875rem;
      color: #9ca3af;
      text-decoration: line-through;
    }

    .promo-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #fee2e2;
      color: #ef4444;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    /* Actions Bar */
    .actions-bar {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #e5e7eb;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      background: #f9fafb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-size: 2rem;
      color: #d1d5db;
    }

    .empty-state h4 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #9ca3af;
      margin: 0;
    }

    /* Error State */
    .error-state {
      text-align: center;
      padding: 4rem;
    }

    .error-icon {
      width: 80px;
      height: 80px;
      background: #fee2e2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2.5rem;
      color: #ef4444;
    }

    .error-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .header-card {
        flex-direction: column;
        text-align: center;
      }

      .boutique-logo {
        width: 80px;
        height: 80px;
      }

      .produits-grid {
        grid-template-columns: 1fr;
      }

      .actions-bar {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `],
  standalone: false
})
export class ClientBoutiqueDetailComponent implements OnInit {
  boutique: Boutique | null = null;
  produits: Produit[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private boutiqueService: BoutiqueService,
    private produitService: ProduitService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    // Check if id is a valid number (not "new" or undefined)
    const id = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;
    if (id) {
      this.loadBoutique(id);
    } else {
      this.loading = false;
      if (idParam && idParam !== 'new') {
        this.notificationService.error('ID de boutique invalide');
      }
    }
  }

  loadBoutique(id: number): void {
    this.boutiqueService.getBoutiqueById(id).subscribe({
      next: (boutique) => {
        console.log('Boutique loaded:', boutique.nom, 'logo:', boutique.logo ? boutique.logo.substring(0, 50) + '...' : 'null');
        this.boutique = boutique;
        this.loadProduits(id);
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Boutique non trouvée');
        this.cdr.markForCheck();
      }
    });
  }

  loadProduits(boutiqueId: number): void {
    this.produitService.getAllProduits(undefined, boutiqueId).subscribe({
      next: (produits: Produit[]) => {
        console.log('Produits loaded for boutique:', produits.length);
        produits.forEach((p: Produit, i: number) => {
          console.log(`Produit ${i} - ${p.nom}: images = ${p.images ? (p.images.length > 50 ? p.images.substring(0, 50) + '...' : p.images) : 'null'}`);
        });
        this.produits = produits.filter((p: Produit) => !p.archive);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  viewProduit(produit: Produit): void {
    this.router.navigate(['/produits', produit.produitId]);
  }

  hasImage(images?: string): boolean {
    if (!images) return false;
    const imageArray = images.split(',').map(img => img.trim()).filter(img => img.length > 0);
    return imageArray.length > 0;
  }

  getFirstImage(images?: string): string | null {
    if (!images) return null;
    const imageArray = images.split(',').map(img => img.trim()).filter(img => img.length > 0);
    if (imageArray.length === 0) return null;
    
    const img = imageArray[0];
    // If image already has data URI prefix, return as-is
    if (img.startsWith('data:image/')) {
      return img;
    }
    // Otherwise, add default JPEG data URI prefix
    return 'data:image/jpeg;base64,' + img;
  }

  getPlaceholderImage(): string {
    // Return a simple SVG placeholder as data URI
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjFmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  goBack(): void {
    this.router.navigate(['/boutiques']);
  }
}
