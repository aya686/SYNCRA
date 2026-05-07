import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { BoutiqueService } from '../../features/boutiques';
import { CommandeService, Commande } from '../../features/commandes';
import { ProduitService, Produit } from '../../features/produits';

interface DashboardStats {
  totalBoutiques: number;
  totalProduits: number;
  totalCommandes: number;
  commandesEnCours: number;
}

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">
            <i class="bi bi-speedometer2 me-2 text-primary"></i>Tableau de bord
          </h1>
          <p class="dashboard-subtitle">Vue d'ensemble de votre activité commerciale</p>
        </div>
        <button class="btn btn-refresh" (click)="refreshData()">
          <i class="bi bi-arrow-clockwise"></i>
          <span>Actualiser</span>
        </button>
      </div>
      
      <!-- Stats Cards - Berry Design -->
      <div class="stats-grid">
        <div class="stat-card boutiques">
          <div class="stat-icon">
            <i class="bi bi-shop"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ stats.totalBoutiques }}</h3>
            <p class="stat-label">Boutiques</p>
          </div>
          <div class="stat-trend" *ngIf="stats.totalBoutiques > 0">
            <i class="bi bi-arrow-up-right"></i>
          </div>
        </div>

        <div class="stat-card produits">
          <div class="stat-icon">
            <i class="bi bi-box-seam"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ stats.totalProduits }}</h3>
            <p class="stat-label">Produits</p>
          </div>
          <div class="stat-trend" *ngIf="stats.totalProduits > 0">
            <i class="bi bi-arrow-up-right"></i>
          </div>
        </div>

        <div class="stat-card commandes">
          <div class="stat-icon">
            <i class="bi bi-cart"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ stats.totalCommandes }}</h3>
            <p class="stat-label">Commandes totales</p>
          </div>
          <div class="stat-trend" *ngIf="stats.totalCommandes > 0">
            <i class="bi bi-arrow-up-right"></i>
          </div>
        </div>

        <div class="stat-card encours">
          <div class="stat-icon">
            <i class="bi bi-hourglass-split"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ stats.commandesEnCours }}</h3>
            <p class="stat-label">Commandes en cours</p>
          </div>
          <div class="stat-badge" *ngIf="stats.commandesEnCours > 0">
            {{ stats.commandesEnCours }}
          </div>
        </div>
      </div>

      <!-- Quick Actions - Berry Design -->
      <div class="actions-section">
        <h5 class="section-title">
          <i class="bi bi-lightning-charge text-warning"></i>
          Actions rapides
        </h5>
        <div class="actions-grid">
          <button class="action-card primary" (click)="navigateTo('/admin/boutiques/new')">
            <div class="action-icon">
              <i class="bi bi-plus-lg"></i>
            </div>
            <span>Nouvelle boutique</span>
          </button>
          <button class="action-card success" (click)="navigateTo('/admin/produits/new')">
            <div class="action-icon">
              <i class="bi bi-plus-lg"></i>
            </div>
            <span>Nouveau produit</span>
          </button>
          <button class="action-card info" (click)="navigateTo('/admin/commandes/new')">
            <div class="action-icon">
              <i class="bi bi-plus-lg"></i>
            </div>
            <span>Nouvelle commande</span>
          </button>
          <button class="action-card secondary" (click)="navigateTo('/admin/livraisons')">
            <div class="action-icon">
              <i class="bi bi-truck"></i>
            </div>
            <span>Gérer livraisons</span>
          </button>
          <button class="action-card warning" (click)="navigateTo('/admin/stock-alerts')">
            <div class="action-icon">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <span>Alertes stock</span>
          </button>
          <button class="action-card dark" (click)="navigateTo('/admin/promotions')">
            <div class="action-icon">
              <i class="bi bi-tag"></i>
            </div>
            <span>Promotions</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Dashboard Container */
    .dashboard-container {
      padding: 1.5rem;
      background: #f8fafc;
      min-height: calc(100vh - 70px);
    }

    /* Header */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .dashboard-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .dashboard-subtitle {
      color: #64748b;
      margin: 0.25rem 0 0 0;
      font-size: 0.95rem;
    }

    .btn-refresh {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      color: #475569;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-refresh:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #1e293b;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 576px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Stat Cards */
    .stat-card {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .stat-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
    }

    .stat-card.boutiques::before { background: #3b82f6; }
    .stat-card.produits::before { background: #10b981; }
    .stat-card.commandes::before { background: #06b6d4; }
    .stat-card.encours::before { background: #f59e0b; }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-right: 1rem;
    }

    .boutiques .stat-icon { background: #eff6ff; color: #3b82f6; }
    .produits .stat-icon { background: #ecfdf5; color: #10b981; }
    .commandes .stat-icon { background: #ecfeff; color: #06b6d4; }
    .encours .stat-icon { background: #fffbeb; color: #f59e0b; }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      line-height: 1.2;
    }

    .stat-label {
      color: #64748b;
      margin: 0.25rem 0 0 0;
      font-size: 0.875rem;
    }

    .stat-trend {
      color: #10b981;
      font-size: 1.25rem;
    }

    .stat-badge {
      background: #f59e0b;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 20px;
    }

    /* Actions Section */
    .actions-section {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }

    .section-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1.25rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1rem;
    }

    @media (max-width: 1400px) {
      .actions-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .actions-grid {
        grid-template-columns: 1fr;
      }
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .action-card.primary:hover { background: #eff6ff; border-color: #3b82f6; }
    .action-card.success:hover { background: #ecfdf5; border-color: #10b981; }
    .action-card.info:hover { background: #ecfeff; border-color: #06b6d4; }
    .action-card.secondary:hover { background: #f1f5f9; border-color: #64748b; }
    .action-card.warning:hover { background: #fffbeb; border-color: #f59e0b; }
    .action-card.dark:hover { background: #f1f5f9; border-color: #1e293b; }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .action-card.primary .action-icon { background: #3b82f6; color: #fff; }
    .action-card.success .action-icon { background: #10b981; color: #fff; }
    .action-card.info .action-icon { background: #06b6d4; color: #fff; }
    .action-card.secondary .action-icon { background: #64748b; color: #fff; }
    .action-card.warning .action-icon { background: #f59e0b; color: #fff; }
    .action-card.dark .action-icon { background: #1e293b; color: #fff; }

    .action-card span {
      font-size: 0.875rem;
      font-weight: 500;
      color: #475569;
      text-align: center;
    }
  `],
  standalone: false
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalBoutiques: 0,
    totalProduits: 0,
    totalCommandes: 0,
    commandesEnCours: 0
  };

  constructor(
    private boutiqueService: BoutiqueService,
    private produitService: ProduitService,
    private commandeService: CommandeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.boutiqueService.getAllBoutiques().subscribe((boutiques: any[]) => {
      this.stats.totalBoutiques = boutiques.length;
      this.cdr.markForCheck();
    });

    this.produitService.getAllProduits().subscribe((produits: Produit[]) => {
      this.stats.totalProduits = produits.length;
      this.cdr.markForCheck();
    });

    this.commandeService.getAllCommandes().subscribe((commandes: Commande[]) => {
      this.stats.totalCommandes = commandes.length;
      this.stats.commandesEnCours = commandes.filter((c: Commande) =>
        c.statut === 'EN_ATTENTE' || c.statut === 'CONFIRMEE' || c.statut === 'EN_COURS'
      ).length;
      this.cdr.markForCheck();
    });
  }

  refreshData(): void {
    this.loadStats();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
