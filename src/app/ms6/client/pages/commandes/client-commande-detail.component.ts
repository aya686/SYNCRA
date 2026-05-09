import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Commande, CommandeService } from '../../../features/commandes';
import { NotificationService } from '../../../core';

@Component({
  selector: 'app-client-commande-detail',
  template: `
    <div class="client-page">
      <!-- Back Button -->
      <button class="btn-back" (click)="goBack()">
        <i class="bi bi-arrow-left"></i>
        Retour aux commandes
      </button>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <!-- Commande Detail -->
      <div class="commande-detail" *ngIf="!loading && commande">
        <!-- Header -->
        <div class="detail-header">
          <div class="header-title">
            <i class="bi bi-cart"></i>
            <div>
              <h1>Votre Commande</h1>
              <span class="date">{{ commande.date | date:'dd MMMM yyyy à HH:mm' }}</span>
            </div>
          </div>
          <span class="status-badge" [ngClass]="getStatusClass(commande.statut)">
            {{ getStatusLabel(commande.statut) }}
          </span>
        </div>

        <!-- Progress -->
        <div class="progress-section">
          <div class="progress-steps">
            <div class="step" [class.active]="isStepActive('EN_ATTENTE')" [class.current]="commande.statut === 'EN_ATTENTE'">
              <i class="bi bi-clock"></i>
              <span>En attente</span>
            </div>
            <div class="step-line"></div>
            <div class="step" [class.active]="isStepActive('CONFIRMEE')" [class.current]="commande.statut === 'CONFIRMEE'">
              <i class="bi bi-check-circle"></i>
              <span>Confirmée</span>
            </div>
            <div class="step-line"></div>
            <div class="step" [class.active]="isStepActive('EN_COURS')" [class.current]="commande.statut === 'EN_COURS'">
              <i class="bi bi-truck"></i>
              <span>En cours</span>
            </div>
            <div class="step-line"></div>
            <div class="step" [class.active]="isStepActive('LIVREE')" [class.current]="commande.statut === 'LIVREE'">
              <i class="bi bi-box-seam"></i>
              <span>Livrée</span>
            </div>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="detail-grid">
          <!-- Articles -->
          <div class="detail-section articles-section">
            <h3><i class="bi bi-box-seam"></i> Articles commandés</h3>
            <div class="articles-list">
              <div class="article-item" *ngFor="let ligne of commande.lignes">
                <div class="article-info">
                  <span class="article-name">{{ ligne.nomProduit || 'Produit' }}</span>
                  <span class="article-qty">x{{ ligne.quantite }}</span>
                </div>
                <span class="article-price">{{ (ligne.prixUnitaire * ligne.quantite) | currency:'EUR' }}</span>
              </div>
            </div>
            <div class="total-section">
              <span class="total-label">Total</span>
              <span class="total-value">{{ commande.montantTotal | currency:'EUR' }}</span>
            </div>
          </div>

          <!-- Info -->
          <div class="info-section">
            <div class="detail-section">
              <h3><i class="bi bi-info-circle"></i> Informations</h3>
              <div class="info-list">
                <div class="info-item">
                  <span class="label">Date</span>
                  <span class="value">{{ commande.date | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Statut</span>
                  <span class="value">{{ getStatusLabel(commande.statut) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Nombre d'articles</span>
                  <span class="value">{{ commande.lignes.length || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Livraison Info -->
            <div class="detail-section" *ngIf="hasLivraison(commande)">
              <h3><i class="bi bi-truck"></i> Livraison</h3>
              <p class="livraison-link" (click)="viewLivraison()">
                <i class="bi bi-arrow-right-circle"></i>
                Suivre ma livraison
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="detail-actions" *ngIf="canCancel()">
          <button class="btn-cancel" (click)="cancelCommande()">
            <i class="bi bi-x-circle"></i>
            Annuler la commande
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="!loading && !commande">
        <i class="bi bi-exclamation-triangle"></i>
        <h3>Commande non trouvée</h3>
        <button class="btn-primary" (click)="goBack()">
          Retour aux commandes
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

    /* Commande Detail */
    .commande-detail {
      animation: fadeIn 0.5s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-title > i {
      font-size: 2.5rem;
      color: #6366f1;
    }

    .header-title h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .date {
      color: #6b7280;
    }

    .status-badge {
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      font-weight: 600;
    }

    .status-en_attente { background: rgba(234, 179, 8, 0.2); color: #eab308; }
    .status-confirme { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .status-en_cours { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
    .status-livree { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .status-annulee { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

    /* Progress */
    .progress-section {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      overflow-x: auto;
    }

    .progress-steps {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 400px;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: #9ca3af;
      transition: all 0.3s;
    }

    .step i {
      width: 48px;
      height: 48px;
      background: #f3f4f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      transition: all 0.3s;
    }

    .step span {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .step.active i {
      background: rgba(99, 102, 241, 0.3);
      color: #6366f1;
    }

    .step.current i {
      background: #6366f1;
      color: #374151;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
    }

    .step.active span, .step.current span {
      color: #374151;
    }

    .step-line {
      flex: 1;
      height: 2px;
      background: #f3f4f6;
      margin: 0 0.5rem;
      margin-bottom: 1.5rem;
    }

    /* Detail Grid */
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
    }

    /* Sections */
    .detail-section {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 1.5rem;
    }

    .detail-section h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1f2937;
    }

    .detail-section h3 i {
      color: #6366f1;
    }

    /* Articles */
    .articles-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .article-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #fff;
      border-radius: 12px;
    }

    .article-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .article-name {
      font-weight: 600;
    }

    .article-qty {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .article-price {
      font-weight: 700;
      color: #6366f1;
      font-size: 1.125rem;
    }

    .total-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 2px solid rgba(255, 255, 255, 0.1);
    }

    .total-label {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .total-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #6366f1;
    }

    /* Info Section */
    .info-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .info-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .info-item .label {
      color: #6b7280;
    }

    .info-item .value {
      font-weight: 600;
    }

    .livraison-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #6366f1;
      cursor: pointer;
      font-weight: 600;
      transition: color 0.3s;
    }

    .livraison-link:hover {
      color: #8b5cf6;
    }

    /* Actions */
    .detail-actions {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
    }

    .btn-cancel {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid #ef4444;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-cancel:hover {
      background: #ef4444;
      color: #374151;
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

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #374151;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    @media (max-width: 968px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }

      .progress-steps {
        min-width: 100%;
      }

      .step span {
        font-size: 0.75rem;
      }
    }

    @media (max-width: 768px) {
      .detail-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .progress-section {
        padding: 1rem;
      }

      .step i {
        width: 36px;
        height: 36px;
        font-size: 1rem;
      }
    }
  `],
  standalone: false
})
export class ClientCommandeDetailComponent implements OnInit {
  commande: Commande | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    // Check if id is a valid number (not "new" or undefined)
    const id = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;
    if (id) {
      this.loadCommande(id);
    } else {
      this.loading = false;
      if (idParam && idParam !== 'new') {
        this.notificationService.error('ID de commande invalide');
      }
    }
  }

  loadCommande(id: number): void {
    this.commandeService.getCommandeById(id).subscribe({
      next: (commande) => {
        this.commande = commande;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Commande non trouvée');
        this.cdr.markForCheck();
      }
    });
  }

  isStepActive(step: string): boolean {
    if (!this.commande) return false;
    const steps = ['EN_ATTENTE', 'CONFIRMEE', 'EN_COURS', 'LIVREE'];
    const currentIndex = steps.indexOf(this.commande.statut);
    const stepIndex = steps.indexOf(step);
    return stepIndex <= currentIndex;
  }

  canCancel(): boolean {
    return this.commande?.statut === 'EN_ATTENTE' || this.commande?.statut === 'CONFIRMEE';
  }

  cancelCommande(): void {
    if (!this.commande) return;
    
    if (confirm('Voulez-vous vraiment annuler cette commande ?')) {
      this.commandeService.cancelCommande(this.commande.commandeId).subscribe({
        next: () => {
          this.notificationService.success('Commande annulée avec succès');
          this.loadCommande(this.commande!.commandeId);
        },
        error: () => {
          this.notificationService.error('Erreur lors de l\'annulation');
        }
      });
    }
  }

  hasLivraison(commande: Commande): boolean {
    // Check if commande has any property that might indicate a livraison
    return commande.statut === 'EN_COURS' || commande.statut === 'LIVREE';
  }

  viewLivraison(): void {
    // Navigate to livraisons list for now since we don't have livraisonId
    this.router.navigate(['/livraisons']);
  }

  goBack(): void {
    this.router.navigate(['/commandes']);
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
      case 'EN_COURS': return 'En cours de livraison';
      case 'LIVREE': return 'Livrée';
      case 'ANNULEE': return 'Annulée';
      default: return statut;
    }
  }
}
