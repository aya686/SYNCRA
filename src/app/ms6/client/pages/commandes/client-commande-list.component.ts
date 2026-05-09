import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Commande, CommandeService } from '../../../features/commandes';
import { NotificationService } from '../../../core';

@Component({
  selector: 'app-client-commande-list',
  template: `
    <div class="client-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Mes Commandes</h1>
          <p class="page-subtitle">Consultez l'historique de vos commandes</p>
        </div>
        <button class="btn-new" (click)="createCommande()">
          <i class="bi bi-plus-lg"></i>
          Nouvelle commande
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="filter-group">
          <i class="bi bi-funnel"></i>
          <select [(ngModel)]="selectedStatut" (change)="onFilterChange()">
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRMEE">Confirmée</option>
            <option value="EN_COURS">En cours</option>
            <option value="LIVREE">Livrée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>
        <button class="btn-reset" (click)="resetFilters()" *ngIf="selectedStatut">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Commandes List -->
      <div class="commandes-list" *ngIf="commandes.length > 0">
        <div class="commande-card" *ngFor="let cmd of commandes">
          <div class="commande-header">
            <div class="commande-id">
              <i class="bi bi-cart"></i>
              <span>Votre Commande</span>
            </div>
            <span class="status-badge" [ngClass]="getStatusClass(cmd.statut)">
              {{ getStatusLabel(cmd.statut) }}
            </span>
          </div>
          
          <div class="commande-info">
            <div class="info-row">
              <span class="label">Date</span>
              <span class="value">{{ cmd.date | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Articles</span>
              <span class="value">{{ cmd.lignes.length || 0 }} produit(s)</span>
            </div>
            <div class="info-row total">
              <span class="label">Total</span>
              <span class="value">{{ cmd.montantTotal | currency:'EUR' }}</span>
            </div>
          </div>

          <div class="commande-actions">
            <button class="btn-view" (click)="viewDetails(cmd)">
              <i class="bi bi-eye"></i>
              Voir détails
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="commandes.length === 0">
        <div class="empty-icon">
          <i class="bi bi-cart-x"></i>
        </div>
        <h3>Aucune commande</h3>
        <p>Vous n'avez pas encore passé de commande</p>
        <button class="btn-new" (click)="createCommande()">
          <i class="bi bi-cart-plus"></i>
          Passer ma première commande
        </button>
      </div>
    </div>
  `,
  styles: [`
    .client-page {
      padding: 1rem 0;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
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

    .btn-new {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-new:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
    }

    /* Filters */
    .filters-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: center;
    }

    .filter-group {
      position: relative;
      min-width: 200px;
    }

    .filter-group i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
    }

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

    .filter-group select:focus {
      outline: none;
      border-color: #6366f1;
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

    /* Commandes List */
    .commandes-list {
      display: grid;
      gap: 1.5rem;
    }

    .commande-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 1.5rem;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .commande-card:hover {
      background: #fff;
      border-color: #3b82f6;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .commande-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .commande-id {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .commande-id i {
      color: #6366f1;
      font-size: 1.25rem;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .status-en_attente { background: rgba(234, 179, 8, 0.2); color: #eab308; }
    .status-confirme { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .status-en_cours { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
    .status-livree { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .status-annulee { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

    .commande-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .info-row {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-row .label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .info-row .value {
      font-weight: 600;
    }

    .info-row.total .value {
      color: #6366f1;
      font-size: 1.25rem;
    }

    .commande-actions {
      display: flex;
      justify-content: flex-end;
    }

    .btn-view {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: rgba(99, 102, 241, 0.2);
      color: #6366f1;
      border: 1px solid #6366f1;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-view:hover {
      background: #6366f1;
      color: #fff;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed rgba(255, 255, 255, 0.2);
      border-radius: 24px;
    }

    .empty-icon {
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2.5rem;
      color: rgba(255, 255, 255, 0.3);
    }

    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .commande-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .commande-info {
        grid-template-columns: 1fr;
      }

      .commande-actions {
        justify-content: stretch;
      }

      .btn-view {
        width: 100%;
        justify-content: center;
      }
    }
  `],
  standalone: false
})
export class ClientCommandeListComponent implements OnInit {
  commandes: Commande[] = [];
  selectedStatut = '';

  constructor(
    private commandeService: CommandeService,
    private notificationService: NotificationService,
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
      error: () => {
        this.notificationService.error('Erreur lors du chargement des commandes');
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

  viewDetails(commande: Commande): void {
    this.router.navigate(['/commandes', commande.commandeId]);
  }

  createCommande(): void {
    this.router.navigate(['/commandes/new']);
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'status-en_attente';
      case 'CONFIRMEE': return 'status-confirme';
      case 'EN_COURS': return 'status-en_cours';
      case 'LIVREE': return 'status-livree';
      case 'ANNULEE': return 'status-annulee';
      default: return '';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'CONFIRMEE': return 'Confirmée';
      case 'EN_COURS': return 'En cours';
      case 'LIVREE': return 'Livrée';
      case 'ANNULEE': return 'Annulée';
      default: return statut;
    }
  }
}
