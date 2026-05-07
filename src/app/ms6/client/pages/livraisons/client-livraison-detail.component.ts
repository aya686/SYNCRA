import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Livraison, LivraisonService } from '../../../features/livraisons';
import { NotificationService } from '../../../core';

@Component({
  selector: 'app-client-livraison-detail',
  template: `
    <div class="client-page">
      <!-- Back Button -->
      <button class="btn-back" (click)="goBack()">
        <i class="bi bi-arrow-left"></i>
        Retour aux livraisons
      </button>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <!-- Livraison Detail -->
      <div class="livraison-detail" *ngIf="!loading && livraison">
        <!-- Header -->
        <div class="detail-header">
          <div class="header-title">
            <i class="bi bi-truck"></i>
            <div>
              <h1>Votre Livraison</h1>
              <span class="subtitle">Suivi de colis</span>
            </div>
          </div>
          <span class="status-badge" [ngClass]="getStatusClass(livraison.statut)">
            {{ getStatusLabel(livraison.statut) }}
          </span>
        </div>

        <!-- Progress Timeline -->
        <div class="timeline-section">
          <div class="timeline">
            <div class="timeline-item" [class.active]="isStepActive('EN_ATTENTE')" [class.current]="livraison.statut === 'EN_ATTENTE'">
              <div class="timeline-icon">
                <i class="bi bi-clock"></i>
              </div>
              <div class="timeline-content">
                <span class="title">En attente</span>
                <span class="desc">Commande en préparation</span>
              </div>
            </div>
            <div class="timeline-connector" [class.active]="isStepActive('EXPEDIEE')"></div>
            <div class="timeline-item" [class.active]="isStepActive('EXPEDIEE')" [class.current]="livraison.statut === 'EXPEDIEE'">
              <div class="timeline-icon">
                <i class="bi bi-box-seam"></i>
              </div>
              <div class="timeline-content">
                <span class="title">Expédiée</span>
                <span class="desc">Colis chez le transporteur</span>
              </div>
            </div>
            <div class="timeline-connector" [class.active]="isStepActive('EN_COURS')"></div>
            <div class="timeline-item" [class.active]="isStepActive('EN_COURS')" [class.current]="livraison.statut === 'EN_COURS'">
              <div class="timeline-icon">
                <i class="bi bi-truck"></i>
              </div>
              <div class="timeline-content">
                <span class="title">En cours</span>
                <span class="desc">Livraison en progression</span>
              </div>
            </div>
            <div class="timeline-connector" [class.active]="isStepActive('LIVREE')"></div>
            <div class="timeline-item" [class.active]="isStepActive('LIVREE')" [class.current]="livraison.statut === 'LIVREE'">
              <div class="timeline-icon">
                <i class="bi bi-check-circle"></i>
              </div>
              <div class="timeline-content">
                <span class="title">Livrée</span>
                <span class="desc">Colis reçu</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="detail-grid">
          <!-- Info Card -->
          <div class="detail-section info-section">
            <h3><i class="bi bi-info-circle"></i> Informations</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="label">Statut</span>
                <span class="value">{{ getStatusLabel(livraison.statut) }}</span>
              </div>
              <div class="info-row" *ngIf="livraison.dateExp">
                <span class="label">Date d'envoi</span>
                <span class="value">{{ livraison.dateExp | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-row" *ngIf="livraison.dateLiv">
                <span class="label">Date de livraison</span>
                <span class="value success">{{ livraison.dateLiv | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
          </div>

          <!-- Transporteur Card -->
          <div class="detail-section transporteur-section" *ngIf="livraison.transporteur">
            <h3><i class="bi bi-building"></i> Transporteur</h3>
            <div class="transporteur-info">
              <div class="transporteur-icon">
                <i class="bi bi-truck-front"></i>
              </div>
              <div class="transporteur-details">
                <span class="name">{{ livraison.transporteur }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="detail-actions">
          <button class="btn-primary" (click)="viewCommande()">
            <i class="bi bi-cart"></i>
            Voir la commande
          </button>
          <button class="btn-secondary" (click)="goBack()">
            <i class="bi bi-arrow-left"></i>
            Retour
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="!loading && !livraison">
        <i class="bi bi-exclamation-triangle"></i>
        <h3>Livraison non trouvée</h3>
        <button class="btn-primary" (click)="goBack()">
          Retour aux livraisons
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

    /* Livraison Detail */
    .livraison-detail {
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
      border: 1px solid #e5e7eb;
      flex-wrap: wrap;
      gap: 1rem;
      color: #374151;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #374151;
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

    .subtitle {
      color: #6b7280;
    }

    .status-badge {
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      font-weight: 600;
    }

    .status-en_attente { background: rgba(234, 179, 8, 0.2); color: #eab308; }
    .status-expediee { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .status-en_cours { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
    .status-livree { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .status-annulee { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

    /* Timeline */
    .timeline-section {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      overflow-x: auto;
    }

    .timeline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 600px;
    }

    .timeline-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      text-align: center;
      color: #9ca3af;
      transition: all 0.3s;
    }

    .timeline-icon {
      width: 56px;
      height: 56px;
      background: #f3f4f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      transition: all 0.3s;
    }

    .timeline-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .timeline-content .title {
      font-weight: 600;
      font-size: 0.875rem;
    }

    .timeline-content .desc {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .timeline-item.active {
      color: #6366f1;
    }

    .timeline-item.active .timeline-icon {
      background: rgba(99, 102, 241, 0.3);
      color: #6366f1;
    }

    .timeline-item.current .timeline-icon {
      background: #6366f1;
      color: #374151;
      box-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.5); }
      50% { box-shadow: 0 0 50px rgba(99, 102, 241, 0.8); }
    }

    .timeline-connector {
      flex: 1;
      height: 3px;
      background: #f3f4f6;
      margin: 0 0.5rem;
      margin-bottom: 2rem;
      border-radius: 2px;
      transition: all 0.3s;
    }

    .timeline-connector.active {
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
    }

    /* Detail Grid */
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

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
      color: #374151;
    }

    .detail-section h3 i {
      color: #6366f1;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.75rem;
      border: 1px solid #e5e7eb;
    }

    .info-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .info-row .label {
      color: #6b7280;
    }

    .info-row .value {
      font-weight: 600;
    }

    .info-row .value.highlight {
      color: #6366f1;
    }

    .info-row .value.success {
      color: #22c55e;
    }

    /* Transporteur */
    .transporteur-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .transporteur-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      color: #374151;
    }

    .transporteur-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .transporteur-details .name {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .transporteur-details .tracking {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .tracking-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      border: 1px dashed rgba(99, 102, 241, 0.5);
    }

    .tracking-box i {
      color: #6366f1;
      font-size: 1.25rem;
    }

    .tracking-box span {
      flex: 1;
      font-family: monospace;
      font-size: 1rem;
      letter-spacing: 1px;
    }

    .btn-copy {
      padding: 0.5rem;
      background: rgba(99, 102, 241, 0.2);
      color: #6366f1;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-copy:hover {
      background: #6366f1;
      color: #374151;
    }

    /* Actions */
    .detail-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-primary, .btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
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
      color: #374151;
      margin-bottom: 1rem;
    }

    .error-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 968px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .detail-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .timeline-section {
        padding: 1.5rem 1rem;
      }

      .detail-actions {
        flex-direction: column;
      }
    }
  `],
  standalone: false
})
export class ClientLivraisonDetailComponent implements OnInit {
  livraison: Livraison | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private livraisonService: LivraisonService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    // Check if id is a valid number (not "new" or undefined)
    const id = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;
    if (id) {
      this.loadLivraison(id);
    } else {
      this.loading = false;
      if (idParam && idParam !== 'new') {
        this.notificationService.error('ID de livraison invalide');
      }
    }
  }

  loadLivraison(id: number): void {
    this.livraisonService.getLivraisonById(id).subscribe({
      next: (livraison) => {
        this.livraison = livraison;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Livraison non trouvée');
        this.cdr.markForCheck();
      }
    });
  }

  isStepActive(step: string): boolean {
    if (!this.livraison) return false;
    const steps = ['EN_ATTENTE', 'EXPEDIEE', 'EN_COURS', 'LIVREE'];
    const currentIndex = steps.indexOf(this.livraison.statut);
    const stepIndex = steps.indexOf(step);
    return stepIndex <= currentIndex;
  }

  viewCommande(): void {
    if (this.livraison?.commandeId) {
      this.router.navigate(['/commandes', this.livraison.commandeId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/livraisons']);
  }

  getStatusClass(statut: string): string {
    return `status-${statut.toLowerCase()}`;
  }

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EXPEDIEE': 'Expédiée',
      'EN_COURS': 'En cours',
      'LIVREE': 'Livrée',
      'ANNULEE': 'Annulée'
    };
    return labels[statut] || statut;
  }
}
