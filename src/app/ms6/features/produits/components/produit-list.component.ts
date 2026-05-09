import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Produit, ProduitService } from '../../produits';
import { Boutique, BoutiqueService } from '../../boutiques';
import { NotificationService } from '../../../core';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog.component';
import { BerryCardComponent, CardAction } from '../../../shared/components/berry-card/berry-card.component';
import { BerryBreadcrumbComponent, BreadcrumbItem } from '../../../shared/components/berry-breadcrumb/berry-breadcrumb.component';

@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    BerryCardComponent,
    BerryBreadcrumbComponent
  ],
  template: `
    <div class="produits-page">
      <!-- Breadcrumb -->
      <app-berry-breadcrumb [items]="breadcrumbItems">
        <button class="btn btn-primary" breadcrumbActions (click)="navigateToCreate()">
          <i class="bi bi-plus-lg"></i>
          <span>Nouveau Produit</span>
        </button>
      </app-berry-breadcrumb>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon primary">
            <i class="bi bi-box-seam"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ allProduits.length }}</span>
            <span class="stat-label">Total Produits</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">
            <i class="bi bi-check-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ activeCount }}</span>
            <span class="stat-label">En Vente</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <i class="bi bi-archive"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ archivedCount }}</span>
            <span class="stat-label">Archivés</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">
            <i class="bi bi-tag"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ promoCount }}</span>
            <span class="stat-label">En Promotion</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">Boutique</label>
            <div class="filter-input">
              <i class="bi bi-shop"></i>
              <select [(ngModel)]="selectedBoutique" (change)="onFilterChange()">
                <option value="">Toutes les boutiques</option>
                <option *ngFor="let boutique of boutiques" [value]="boutique.boutiqueId">
                  {{ boutique.nom }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="filter-group flex-1">
            <label class="filter-label">Recherche</label>
            <div class="filter-input">
              <i class="bi bi-search"></i>
              <input 
                type="text" 
                [(ngModel)]="searchTerm" 
                (input)="onSearch()" 
                placeholder="Rechercher un produit...">
              <button class="btn-clear" *ngIf="searchTerm" (click)="clearSearch()">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Vue</label>
            <div class="toggle-group">
              <button 
                class="toggle-btn" 
                [class.active]="!showArchived"
                (click)="showArchived = false; filterProduits()">
                <i class="bi bi-check-circle"></i>
                Actifs
              </button>
              <button 
                class="toggle-btn" 
                [class.active]="showArchived"
                (click)="showArchived = true; filterProduits()">
                <i class="bi bi-archive"></i>
                Archivés
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-section">
        <div class="section-header">
          <h3>{{ showArchived ? 'Produits Archivés' : 'Produits en Vente' }}</h3>
          <div class="header-actions">
            <span class="count-badge">{{ produits.length }} produits</span>
            <button class="btn btn-primary" (click)="navigateToCreate()" *ngIf="!showArchived">
              <i class="bi bi-plus-lg"></i>
              Ajouter Produit
            </button>
          </div>
        </div>
        
        <div class="products-grid">
          <app-berry-card
            *ngFor="let produit of produits"
            [title]="produit.nom"
            [subtitle]="getBoutiqueName(produit.boutiqueId)"
            [icon]="showArchived ? 'archive' : 'box-seam'"
            [imageUrl]="getProductImageUrl(produit)"
            [badgeText]="getBadgeText(produit)"
            [badgeType]="getBadgeType(produit)"
            [archived]="!!produit.archive"
            [stats]="getProductStats(produit)"
            [actions]="getProductActions(produit)">
            
            <div cardContent class="product-details">
              <div class="price-row">
                <span class="current-price" [class.promo]="produit.prixPromo">
                  {{ (produit.prixPromo || produit.prix) | number:'1.3-3' }} DT
                </span>
                <span class="original-price" *ngIf="produit.prixPromo">
                  {{ produit.prix | number:'1.3-3' }} DT
                </span>
              </div>
              <div class="stock-info">
                <i class="bi bi-box"></i>
                <span>Stock: {{ produit.stock?.quantite || 0 }} unités</span>
              </div>
            </div>
          </app-berry-card>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="produits.length === 0">
          <div class="empty-icon">
            <i class="bi bi-box-seam"></i>
          </div>
          <h4>Aucun produit trouvé</h4>
          <p *ngIf="showArchived">Aucun produit archivé pour le moment.</p>
          <p *ngIf="!showArchived">Commencez par créer votre premier produit.</p>
          <button class="btn btn-primary" (click)="navigateToCreate()" *ngIf="!showArchived">
            <i class="bi bi-plus-lg"></i>
            Créer un produit
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .produits-page {
      padding-bottom: 2rem;
    }
    
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .stat-icon.primary { background: #eff6ff; color: #3b82f6; }
    .stat-icon.success { background: #ecfdf5; color: #10b981; }
    .stat-icon.warning { background: #fffbeb; color: #f59e0b; }
    .stat-icon.danger { background: #fef2f2; color: #ef4444; }
    
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }
    
    /* Filters */
    .filters-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .filters-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .filter-group.flex-1 {
      flex: 1;
      min-width: 250px;
    }
    
    .filter-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .filter-input {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .filter-input > i:first-child {
      position: absolute;
      left: 12px;
      color: #9ca3af;
      font-size: 0.875rem;
    }
    
    .filter-input input,
    .filter-input select {
      padding: 0.625rem 0.75rem 0.625rem 2.25rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      min-width: 180px;
      background: #fff;
      transition: all 0.2s;
    }
    
    .filter-input input {
      width: 100%;
    }
    
    .filter-input input:focus,
    .filter-input select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .btn-clear {
      position: absolute;
      right: 8px;
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px;
      font-size: 0.75rem;
    }
    
    .btn-clear:hover {
      color: #6b7280;
    }
    
    .toggle-group {
      display: flex;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: #fff;
      border: none;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .toggle-btn:hover {
      background: #f9fafb;
    }
    
    .toggle-btn.active {
      background: #eff6ff;
      color: #3b82f6;
    }
    
    /* Products Section */
    .products-section {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .section-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }
    
    .count-badge {
      padding: 0.375rem 0.875rem;
      background: #f3f4f6;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    /* Product Card Content */
    .product-details {
      margin-top: 0.75rem;
    }
    
    .price-row {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .current-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
    }
    
    .current-price.promo {
      color: #ef4444;
    }
    
    .original-price {
      font-size: 0.875rem;
      color: #9ca3af;
      text-decoration: line-through;
    }
    
    .stock-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .stock-info i {
      color: #3b82f6;
    }
    
    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }
    
    .empty-icon {
      width: 80px;
      height: 80px;
      background: #f3f4f6;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }
    
    .empty-icon i {
      font-size: 2.5rem;
      color: #9ca3af;
    }
    
    .empty-state h4 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem;
    }
    
    .empty-state p {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 1.5rem;
    }
    
    /* Button Styles */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    
    .btn-primary {
      background: #3b82f6;
      color: #fff;
    }
    
    .btn-primary:hover {
      background: #2563eb;
    }
    
    /* Responsive */
    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .filters-row {
        flex-direction: column;
      }
      
      .filter-group.flex-1 {
        min-width: 100%;
      }
      
      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProduitListComponent implements OnInit {
  produits: Produit[] = [];
  allProduits: Produit[] = [];
  boutiques: Boutique[] = [];
  selectedBoutique: string = '';
  searchTerm: string = '';
  showArchived: boolean = false;
  
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Accueil', link: '/', icon: 'house' },
    { label: 'Produits' }
  ];
  
  constructor(
    private produitService: ProduitService,
    private boutiqueService: BoutiqueService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.loadBoutiques();
    this.loadProduits();
  }
  
  // Getters pour les stats
  get activeCount(): number {
    return this.allProduits.filter(p => !p.archive).length;
  }
  
  get archivedCount(): number {
    return this.allProduits.filter(p => p.archive).length;
  }
  
  get promoCount(): number {
    return this.allProduits.filter(p => p.prixPromo && !p.archive).length;
  }
  
  loadBoutiques(): void {
    this.boutiqueService.getAllBoutiques().subscribe({
      next: (boutiques) => {
        this.boutiques = boutiques;
        this.cdr.markForCheck();
      }
    });
  }
  
  loadProduits(): void {
    const boutiqueId = this.selectedBoutique ? Number(this.selectedBoutique) : undefined;
    
    this.produitService.getAllProduits(undefined, boutiqueId).subscribe({
      next: (produits) => {
        this.allProduits = [...produits];
        this.filterProduits();
        this.cdr.markForCheck();
      },
      error: () => this.notificationService.error('Erreur lors du chargement des produits')
    });
  }
  
  filterProduits(): void {
    let filtered = [...this.allProduits];
    
    // Filter by archived status
    if (this.showArchived) {
      filtered = filtered.filter(p => p.archive === true);
    } else {
      filtered = filtered.filter(p => !p.archive);
    }
    
    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => p.nom.toLowerCase().includes(term));
    }
    
    this.produits = filtered;
  }
  
  onSearch(): void {
    this.filterProduits();
  }
  
  clearSearch(): void {
    this.searchTerm = '';
    this.filterProduits();
  }
  
  onFilterChange(): void {
    this.loadProduits();
  }
  
  getBoutiqueName(boutiqueId: number): string {
    const boutique = this.boutiques.find(b => b.boutiqueId === boutiqueId);
    return boutique ? boutique.nom : 'Boutique inconnue';
  }

  getProductImageUrl(produit: Produit): string | undefined {
    if (!produit.images) return undefined;
    const images = produit.images.split(',').map(img => img.trim()).filter(img => img.length > 0);
    if (images.length === 0) return undefined;
    // Retourner la première image avec le préfixe data URI si nécessaire
    const firstImage = images[0];
    if (firstImage.startsWith('data:image/')) {
      return firstImage;
    }
    return 'data:image/jpeg;base64,' + firstImage;
  }
  
  getBadgeText(produit: Produit): string {
    if (produit.archive) return 'Archivé';
    if (produit.prixPromo) return 'Promo';
    return 'En vente';
  }
  
  getBadgeType(produit: Produit): 'success' | 'warning' | 'danger' | 'secondary' | 'info' {
    if (produit.archive) return 'secondary';
    if (produit.prixPromo) return 'danger';
    return 'success';
  }
  
  getProductStats(produit: Produit): { value: string | number; label: string }[] {
    const price = produit.prixPromo || produit.prix;
    return [
      { value: produit.stock?.quantite || 0, label: 'Stock' },
      { value: price ? price.toFixed(3) + ' DT' : '0 DT', label: 'Prix' }
    ];
  }
  
  getProductActions(produit: Produit): CardAction[] {
    const actions: CardAction[] = [
      { icon: 'eye', label: 'Détails', type: 'outline-primary', action: () => this.viewDetails(produit), show: true },
      { icon: 'pencil', label: 'Modifier', type: 'outline-secondary', action: () => this.editProduit(produit), show: true }
    ];

    if (!this.showArchived) {
      actions.push({ icon: 'archive', label: 'Archiver', type: 'outline-warning', action: () => this.archiveProduit(produit), show: true });
    } else {
      actions.push({ icon: 'arrow-counterclockwise', label: 'Restaurer', type: 'outline-success', action: () => this.unarchiveProduit(produit), show: true });
    }

    actions.push({ icon: 'trash', label: 'Supprimer', type: 'outline-danger', action: () => this.deleteProduit(produit), show: true });

    return actions;
  }
  
  navigateToCreate(): void {
    this.router.navigate(['/admin/produits/new']);
  }
  
  viewDetails(produit: Produit): void {
    this.router.navigate(['/admin/produits', produit.produitId]);
  }
  
  editProduit(produit: Produit): void {
    this.router.navigate(['/admin/produits/edit', produit.produitId]);
  }
  
  archiveProduit(produit: Produit): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer l\'archivage',
        message: `Voulez-vous vraiment archiver le produit "${produit.nom}" ?`,
        confirmText: 'Archiver',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.produitService.archiveProduit(produit.produitId).subscribe({
          next: () => {
            this.notificationService.success('Produit archivé avec succès');
            this.loadProduits();
          },
          error: (err) => {
            const message = err.error?.message || 'Erreur lors de l\'archivage';
            this.notificationService.error(message);
          }
        });
      }
    });
  }
  
  unarchiveProduit(produit: Produit): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la restauration',
        message: `Voulez-vous vraiment restaurer le produit "${produit.nom}" ?`,
        confirmText: 'Restaurer',
        cancelText: 'Annuler',
        confirmColor: 'primary'
      } as ConfirmDialogData
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.produitService.unarchiveProduit(produit.produitId).subscribe({
          next: () => {
            this.notificationService.success('Produit restauré avec succès');
            this.loadProduits();
          },
          error: (err) => {
            const message = err.error?.message || 'Erreur lors de la restauration';
            this.notificationService.error(message);
          }
        });
      }
    });
  }
  
  deleteProduit(produit: Produit): void {
    console.log('[DELETE] Clic sur supprimer pour produit:', produit.produitId, produit.nom);
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Voulez-vous vraiment supprimer définitivement le produit "${produit.nom}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });
    
    dialogRef.afterClosed().subscribe(result => {
      console.log('[DELETE] Dialog fermé, résultat:', result);
      if (result) {
        console.log('[DELETE] Appel API suppression produit:', produit.produitId);
        this.produitService.deleteProduit(produit.produitId).subscribe({
          next: () => {
            console.log('[DELETE] Suppression réussie');
            this.notificationService.success('Produit supprimé avec succès');
            this.loadProduits();
          },
          error: (err) => {
            console.error('[DELETE] Erreur suppression:', err);
            console.error('[DELETE] Status:', err.status);
            console.error('[DELETE] Response:', err.error);
            // Le backend retourne { error: "message", status: 409, timestamp: "..." }
            const message = err.error?.error || err.message || 'Erreur lors de la suppression';
            this.notificationService.error(message);
          }
        });
      } else {
        console.log('[DELETE] Suppression annulée par l\'utilisateur');
      }
    });
  }
}
