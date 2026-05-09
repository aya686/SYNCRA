import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Produit, ProduitService } from '../../../features/produits';
import { Boutique, BoutiqueService } from '../../../features/boutiques';
import { NotificationService } from '../../../core';

@Component({
  selector: 'app-client-produit-list',
  template: `
    <div class="client-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Nos Produits</h1>
          <p class="page-subtitle">Découvrez notre sélection de produits de qualité</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="filter-group">
          <i class="bi bi-search"></i>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="onSearch()"
            placeholder="Rechercher un produit..."
          >
        </div>
        <div class="filter-group">
          <i class="bi bi-shop"></i>
          <select class="form-select" [(ngModel)]="selectedBoutique" (change)="onFilterChange()">
                <option value="">Toutes les boutiques</option>
                <option *ngFor="let boutique of boutiques" [value]="boutique.boutiqueId">
                  {{ boutique.nom }}
                </option>
              </select>
        </div>
        <button class="btn-reset" (click)="resetFilters()" *ngIf="searchTerm || selectedBoutique">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Produits Grid -->
      <div class="produits-grid" *ngIf="filteredProduits.length > 0">
        <div class="produit-card" *ngFor="let produit of filteredProduits" (click)="viewDetails(produit)">
          <!-- Image du produit -->
          <div class="produit-image">
            <img *ngIf="produit.images" [src]="produit.images" alt="{{ produit.nom }}" loading="lazy">
            <div class="image-placeholder" *ngIf="!produit.images">
              <i class="bi bi-box-seam"></i>
            </div>
            <!-- Badge Promo -->
            <span class="promo-badge" *ngIf="produit.prixPromo">
              <i class="bi bi-tag-fill"></i> -{{ getDiscount(produit) }}%
            </span>
          </div>
          
          <div class="produit-content">
            <div class="produit-header">
              <h3 class="produit-name">{{ produit.nom }}</h3>
              <span class="boutique-tag" *ngIf="getBoutiqueName(produit.boutiqueId)">
                <i class="bi bi-shop"></i>
                {{ getBoutiqueName(produit.boutiqueId) }}
              </span>
            </div>
            
            <div class="produit-footer">
              <div class="price-section">
                <span class="current-price">{{ (produit.prixPromo || produit.prix) | number:'1.3-3' }} DT</span>
                <span class="original-price" *ngIf="produit.prixPromo">{{ produit.prix | number:'1.3-3' }} DT</span>
              </div>
              
              <div class="stock-section">
                <span class="stock-badge" [class.low]="produit.stock?.alerteStock" [class.out]="(produit.stock?.quantite || 0) === 0">
                  <i class="bi" [class.bi-check-circle-fill]="!produit.stock?.alerteStock && (produit.stock?.quantite || 0) > 0" 
                     [class.bi-exclamation-triangle-fill]="produit.stock?.alerteStock"
                     [class.bi-x-circle-fill]="(produit.stock?.quantite || 0) === 0"></i>
                  {{ produit.stock?.quantite || 0 }} en stock
                </span>
              </div>
            </div>
            
            <!-- Quick Action -->
            <button class="btn-view" (click)="viewDetails(produit); $event.stopPropagation()">
              <i class="bi bi-eye"></i> Voir détails
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredProduits.length === 0">
        <div class="empty-icon">
          <i class="bi bi-box-seam"></i>
        </div>
        <h3>Aucun produit trouvé</h3>
        <p>Essayez une autre recherche ou sélectionnez une autre boutique</p>
        <button class="btn-reset-full" (click)="resetFilters()">
          <i class="bi bi-arrow-counterclockwise"></i>
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  `,
  styles: [`
    .client-page {
      padding: 1rem 0;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .page-subtitle {
      color: #6b7280;
      font-size: 1.125rem;
    }

    /* Filters */
    .filters-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-group {
      position: relative;
      flex: 1;
      min-width: 200px;
      max-width: 350px;
    }

    .filter-group i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
    }

    .filter-group input,
    .filter-group select {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 2.75rem;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      color: #374151;
      font-size: 0.95rem;
      transition: all 0.3s;
    }

    .filter-group input:focus,
    .filter-group select:focus {
      outline: none;
      border-color: #6366f1;
      background: #f3f4f6;
    }

    .filter-group input::placeholder {
      color: #9ca3af;
    }

    .filter-group select option {
      background: #fff;
      color: #374151;
    }

    .btn-reset {
      padding: 0.875rem;
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid #ef4444;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-reset:hover {
      background: #ef4444;
      color: #fff;
    }

    /* Produits Grid */
    .produits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .produit-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .produit-card:hover {
      transform: translateY(-8px);
      background: #fff;
      border-color: #3b82f6;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
    }

    .produit-image {
      height: 200px;
      background: #f9fafb;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .produit-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .produit-card:hover .produit-image img {
      transform: scale(1.05);
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      color: #9ca3af;
      font-size: 3rem;
    }

    .promo-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
      color: #fff;
      border-radius: 50px;
      font-size: 0.875rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .produit-content {
      padding: 1.25rem;
    }

    .produit-header {
      margin-bottom: 1rem;
    }

    .produit-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .boutique-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.875rem;
      color: #6366f1;
      background: #eff6ff;
      padding: 0.35rem 0.75rem;
      border-radius: 50px;
      font-weight: 500;
    }

    .produit-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #f3f4f6;
      margin-bottom: 1rem;
    }

    .price-section {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .current-price {
      font-size: 1.35rem;
      font-weight: 700;
      color: #3b82f6;
    }

    .original-price {
      font-size: 0.9rem;
      color: #9ca3af;
      text-decoration: line-through;
    }

    .stock-badge {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.5rem 0.875rem;
      background: #d1fae5;
      color: #10b981;
      border-radius: 50px;
      font-size: 0.8rem;
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

    .btn-view {
      width: 100%;
      padding: 0.75rem;
      background: #eff6ff;
      color: #3b82f6;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-view:hover {
      background: #3b82f6;
      color: #fff;
      border-color: #3b82f6;
    }

    .stock-badge.low {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-icon {
      width: 120px;
      height: 120px;
      background: #f9fafb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 3rem;
      color: #d1d5db;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .btn-reset-full {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background: #f3f4f6;
      color: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-reset-full:hover {
      background: #e5e7eb;
    }

    @media (max-width: 768px) {
      .filters-bar {
        flex-direction: column;
      }

      .filter-group {
        max-width: 100%;
      }

      .produits-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      }
    }
  `],
  standalone: false
})
export class ClientProduitListComponent implements OnInit {
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  boutiques: Boutique[] = [];
  searchTerm = '';
  selectedBoutique = '';

  constructor(
    private produitService: ProduitService,
    private boutiqueService: BoutiqueService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBoutiques();
    this.loadProduits();
  }

  loadBoutiques(): void {
    this.boutiqueService.getAllBoutiques().subscribe({
      next: (boutiques) => {
        this.boutiques = boutiques.filter(b => b.statut === 'ACTIF');
        this.cdr.markForCheck();
      }
    });
  }

  loadProduits(): void {
    const boutiqueId = this.selectedBoutique ? Number(this.selectedBoutique) : undefined;
    console.log('Filter - selectedBoutique:', this.selectedBoutique, 'boutiqueId:', boutiqueId);
    
    this.produitService.getAllProduits(undefined, boutiqueId).subscribe({
      next: (produits) => {
        console.log('Produits loaded:', produits.length, 'for boutiqueId:', boutiqueId);
        this.produits = produits.filter(p => !p.archive);
        console.log('After archive filter:', this.produits.length);
        this.filterProduits();
        this.cdr.markForCheck();
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement des produits');
      }
    });
  }

  filterProduits(): void {
    let filtered = [...this.produits];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => p.nom.toLowerCase().includes(term));
    }
    
    this.filteredProduits = filtered;
  }

  onSearch(): void {
    this.filterProduits();
  }

  onFilterChange(): void {
    this.loadProduits();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedBoutique = '';
    this.loadProduits();
  }

  getBoutiqueName(boutiqueId?: number): string {
    if (!boutiqueId) return '';
    const boutique = this.boutiques.find(b => b.boutiqueId === boutiqueId);
    return boutique ? boutique.nom : '';
  }

  getDiscount(produit: Produit): number {
    if (!produit.prixPromo || !produit.prix) return 0;
    return Math.round(((produit.prix - produit.prixPromo) / produit.prix) * 100);
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

  viewDetails(produit: Produit): void {
    this.router.navigate(['/produits', produit.produitId]);
  }
}
