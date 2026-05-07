import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Livraison, LivraisonService } from '../../../features/livraisons';
import { NotificationService } from '../../../core';

@Component({
  selector: 'app-client-livraison-list',
  template: `
    <div class="client-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Mes Livraisons</h1>
          <p class="page-subtitle">Suivez vos livraisons en temps réel</p>
        </div>
      </div>

      <!-- Livraisons List -->
      <div class="livraisons-list" *ngIf="livraisons.length > 0">
        <div class="livraison-card" *ngFor="let liv of livraisons" (click)="viewDetails(liv)">
          <div class="livraison-header">
            <div class="livraison-id">
              <i class="bi bi-truck"></i>
              <span>Votre Livraison</span>
            </div>
            <span class="status-badge" [ngClass]="getStatusClass(liv.statut)">
              {{ getStatusLabel(liv.statut) }}
            </span>
          </div>

          <div class="livraison-progress">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="getProgress(liv.statut)"></div>
            </div>
            <div class="progress-steps">
              <span [class.active]="isStepActive(liv.statut, 'EN_ATTENTE')">En attente</span>
              <span [class.active]="isStepActive(liv.statut, 'EXPEDIEE')">Expédiée</span>
              <span [class.active]="isStepActive(liv.statut, 'EN_COURS')">En cours</span>
              <span [class.active]="isStepActive(liv.statut, 'LIVREE')">Livrée</span>
            </div>
          </div>

          <div class="livraison-info">
            <div class="info-item" *ngIf="liv.dateExp">
              <i class="bi bi-calendar3"></i>
              <span>Expédiée: {{ liv.dateExp | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="info-item" *ngIf="liv.dateLiv">
              <i class="bi bi-clock"></i>
              <span>Livrée: {{ liv.dateLiv | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="info-item" *ngIf="liv.transporteur">
              <i class="bi bi-building"></i>
              <span>{{ liv.transporteur }}</span>
            </div>
          </div>

          <div class="livraison-footer">
            <span class="tracking" *ngIf="liv.tracking">
              <i class="bi bi-upc"></i>
              {{ liv.tracking }}
            </span>
            <button class="btn-view">
              <i class="bi bi-eye"></i>
              Détails
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="livraisons.length === 0">
        <div class="empty-icon">
          <i class="bi bi-truck"></i>
        </div>
        <h3>Aucune livraison</h3>
        <p>Vous n'avez pas encore de livraisons en cours</p>
        <button class="btn-primary" (click)="router.navigate(['/commandes'])">
          <i class="bi bi-cart"></i>
          Voir mes commandes
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

    /* Livraisons List */
    .livraisons-list {
      display: grid;
      gap: 1.5rem;
    }

    .livraison-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .livraison-card:hover {
      transform: translateY(-5px);
      background: #f9fafb;
      border-color: rgba(99, 102, 241, 0.3);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    .livraison-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .livraison-id {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .livraison-id i {
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
    .status-expediee { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .status-en_cours { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
    .status-livree { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .status-annulee { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

    /* Progress */
    .livraison-progress {
      margin-bottom: 1.25rem;
    }

    .progress-bar {
      height: 8px;
      background: #f9fafb;
      border-radius: 4px;
      margin-bottom: 0.75rem;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .progress-steps {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .progress-steps span.active {
      color: #6366f1;
      font-weight: 600;
    }

    /* Info */
    .livraison-info {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
    }

    .info-item i {
      color: #6366f1;
    }

    /* Footer */
    .livraison-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tracking {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #fff;
      border-radius: 8px;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
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
      background: rgba(99, 102, 241, 0.2);
      border: 1px dashed rgba(255, 255, 255, 0.2);
      border-radius: 24px;
    }

    .empty-icon {
      width: 100px;
      height: 100px;
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2.5rem;
      color: #d1d5db;
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

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
    }

    @media (max-width: 768px) {
      .livraison-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .livraison-footer {
        flex-direction: column;
        gap: 1rem;
      }

      .btn-view {
        width: 100%;
        justify-content: center;
      }

      .progress-steps {
        display: none;
      }
    }
  `],
  standalone: false
})
export class ClientLivraisonListComponent implements OnInit {
  livraisons: Livraison[] = [];

  constructor(
    private livraisonService: LivraisonService,
    private notificationService: NotificationService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLivraisons();
  }

  loadLivraisons(): void {
    this.livraisonService.getAllLivraisons().subscribe({
      next: (livraisons) => {
        this.livraisons = [...livraisons];
        this.cdr.markForCheck();
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement des livraisons');
      }
    });
  }

  viewDetails(livraison: Livraison): void {
    this.router.navigate(['/livraisons', livraison.livraisonId]);
  }

  getProgress(statut: string): number {
    const progressMap: { [key: string]: number } = {
      'EN_ATTENTE': 10,
      'EXPEDIEE': 40,
      'EN_COURS': 70,
      'LIVREE': 100,
      'ANNULEE': 0
    };
    return progressMap[statut] || 0;
  }

  isStepActive(currentStatut: string, step: string): boolean {
    const steps = ['EN_ATTENTE', 'EXPEDIEE', 'EN_COURS', 'LIVREE'];
    const currentIndex = steps.indexOf(currentStatut);
    const stepIndex = steps.indexOf(step);
    return stepIndex <= currentIndex;
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
