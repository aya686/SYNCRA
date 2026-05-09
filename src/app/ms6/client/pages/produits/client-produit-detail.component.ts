import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Produit, ProduitService } from '../../../features/produits';
import { Boutique, BoutiqueService } from '../../../features/boutiques';
import { NotificationService } from '../../../core';

@Component({
  selector: 'app-client-produit-detail',
  template: `
    <div class="client-page">
      <!-- Back Button -->
      <button class="btn-back" (click)="goBack()">
        <i class="bi bi-arrow-left"></i>
        Retour aux produits
      </button>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <!-- Product Detail -->
      <div class="produit-detail" *ngIf="!loading && produit">
        <div class="detail-grid">
          <!-- Image Section -->
          <div class="image-section">
            <div class="product-image-card">
              <div class="promo-badge" *ngIf="produit.prixPromo">
                <i class="bi bi-tag-fill"></i>
                -{{ getDiscount() }}%
              </div>
              <div class="image-container">
                <img *ngIf="produit.images" [src]="produit.images" alt="{{ produit.nom }}" class="product-img">
                <div *ngIf="!produit.images" class="no-image">
                  <i class="bi bi-image"></i>
                  <span>Aucune image</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Info Section -->
          <div class="info-section">
            <div class="info-card">
              <div class="product-header">
                <h1 class="product-title">{{ produit.nom }}</h1>
                <div class="boutique-link" *ngIf="boutique" (click)="viewBoutique()">
                  <i class="bi bi-shop"></i>
                  <span>{{ boutique.nom }}</span>
                </div>
              </div>

              <div class="produit-footer">
                <div class="price-section">
                  <span class="current-price">{{ (produit.prixPromo || produit.prix) | number:'1.3-3' }} DT</span>
                  <span class="original-price" *ngIf="produit.prixPromo">{{ produit.prix | number:'1.3-3' }} DT</span>
                </div>
                <span class="stock-badge" [class.low]="produit.stock?.alerteStock">
                  <i class="bi" [class.bi-check-circle-fill]="!produit.stock?.alerteStock" [class.bi-exclamation-circle-fill]="produit.stock?.alerteStock"></i>
                  {{ produit.stock?.quantite || 0 }} en stock
                </span>
              </div>

              <div class="description-section" *ngIf="produit.description">
                <h3><i class="bi bi-info-circle me-2"></i>Description</h3>
                <p>{{ produit.description }}</p>
              </div>

              <div class="actions-section">
                <button class="btn-primary" (click)="createCommande()">
                  <i class="bi bi-cart-plus"></i>
                  <span>Ajouter au panier</span>
                </button>
                <button class="btn-secondary" (click)="viewBoutique()">
                  <i class="bi bi-shop"></i>
                  <span>Voir la boutique</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="!loading && !produit">
        <i class="bi bi-exclamation-triangle"></i>
        <h3>Produit non trouvé</h3>
        <button class="btn-primary" (click)="goBack()">
          Retour aux produits
        </button>
      </div>
    </div>
  `,
  styles: [`
    .client-page {
      padding: 1rem 0;
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
      margin-bottom: 1.5rem;
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
      border: 3px solid rgba(99, 102, 241, 0.3);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-state p {
      color: rgba(255, 255, 255, 0.6);
    }

    /* Product Detail */
    .produit-detail {
      animation: fadeIn 0.5s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
    }

    /* Image Section */
    .image-section {
      position: relative;
    }

    .product-image-card {
      position: relative;
      background: #f9fafb;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e7eb;
    }

    .image-container {
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-image {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 4rem;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      height: 100%;
    }

    .no-image span {
      font-size: 1rem;
      color: #6b7280;
      margin-top: 1rem;
    }

    .promo-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
      color: #fff;
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.875rem;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    /* Info Section */
    .info-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .product-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.75rem;
      line-height: 1.3;
    }

    .boutique-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #3b82f6;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.3s;
      padding: 0.5rem 1rem;
      background: #eff6ff;
      border-radius: 8px;
    }

    .boutique-link:hover {
      color: #1d4ed8;
      background: #dbeafe;
    }

    .price-section {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      padding: 1.5rem;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
    }

    .current-price {
      font-size: 2.5rem;
      font-weight: 800;
      color: #3b82f6;
    }

    .original-price {
      font-size: 1.5rem;
      color: #9ca3af;
      text-decoration: line-through;
    }

    .stock-section {
      display: flex;
      gap: 1rem;
    }

    .stock-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: #d1fae5;
      color: #10b981;
      border-radius: 12px;
      font-weight: 600;
    }

    .stock-badge.low {
      background: #fef3c7;
      color: #f59e0b;
    }

    .stock-badge.out {
      background: #fee2e2;
      color: #ef4444;
    }

    .description-section {
      padding: 1.5rem;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
    }

    .description-section h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .description-section h3 i {
      color: #3b82f6;
    }

    .description-section p {
      color: #4b5563;
      line-height: 1.8;
    }

    .specs-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }

    .spec-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .spec-item i {
      color: #3b82f6;
      font-size: 1.25rem;
    }

    .spec-item .label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .spec-item .value {
      font-weight: 600;
      color: #1f2937;
    }

    .actions-section {
      display: flex;
      gap: 1rem;
      margin-top: auto;
    }

    .btn-primary, .btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
      flex: 1;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #374151;
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #e5e7eb;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    /* Error State */
    .error-state {
      text-align: center;
      padding: 4rem;
    }

    .error-state i {
      font-size: 4rem;
      color: #ef4444;
      margin-bottom: 1rem;
    }

    .error-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .error-state .btn-primary {
      display: inline-flex;
    }

    @media (max-width: 968px) {
      .detail-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .product-image {
        aspect-ratio: 16/9;
      }

      .actions-section {
        flex-direction: column;
      }
    }

    @media (max-width: 768px) {
      .current-price {
        font-size: 1.75rem;
      }

      .original-price {
        font-size: 1.125rem;
      }
    }

  `],
  standalone: true,
  imports: [CommonModule]
})
export class ClientProduitDetailComponent implements OnInit {
  produit: Produit | null = null;
  boutique: Boutique | null = null;
  loading = true;
  selectedMainImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService,
    private boutiqueService: BoutiqueService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    // Check if id is a valid number (not "new" or undefined)
    const id = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;
    if (id) {
      this.loadProduit(id);
    } else {
      this.loading = false;
      if (idParam && idParam !== 'new') {
        this.notificationService.error('ID de produit invalide');
      }
      this.loading = false;
    }
  }

  loadProduit(id: number): void {
    this.produitService.getProduitById(id).subscribe({
      next: (produit) => {
        console.log('Produit loaded:', produit.nom, 'images:', produit.images ? produit.images.substring(0, 50) + '...' : 'null');
        if (produit.archive) {
          this.notificationService.error('Ce produit n\'est plus disponible');
          this.router.navigate(['/produits']);
          return;
        }
        this.produit = produit;
        
        if (produit.boutiqueId) {
          this.loadBoutique(produit.boutiqueId);
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Produit non trouvé');
        this.cdr.markForCheck();
      }
    });
  }

  loadBoutique(id: number): void {
    this.boutiqueService.getBoutiqueById(id).subscribe({
      next: (boutique) => {
        this.boutique = boutique;
        this.cdr.markForCheck();
      }
    });
  }

  getDiscount(): number {
    if (!this.produit?.prixPromo || !this.produit?.prix) return 0;
    return Math.round(((this.produit.prix - this.produit.prixPromo) / this.produit.prix) * 100);
  }

  hasImage(images?: string): boolean {
    if (!images) return false;
    const imageArray = images.split(',').map(img => img.trim()).filter(img => img.length > 0);
    return imageArray.length > 0;
  }

  getFirstImage(images?: string): string | null {
    if (this.selectedMainImage) return this.selectedMainImage;
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

  getImagesArray(images?: string): string[] {
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

  hasMultipleImages(images?: string): boolean {
    if (!images) return false;
    const imageArray = images.split(',').map(img => img.trim()).filter(img => img.length > 0);
    return imageArray.length > 1;
  }

  selectMainImage(img: string): void {
    this.selectedMainImage = img;
  }

  viewBoutique(): void {
    if (this.produit?.boutiqueId) {
      this.router.navigate(['/boutiques', this.produit.boutiqueId]);
    }
  }

  createCommande(): void {
    this.router.navigate(['/commandes/new'], { 
      queryParams: { produitId: this.produit?.produitId } 
    });
  }

  goBack(): void {
    this.router.navigate(['/produits']);
  }
}
