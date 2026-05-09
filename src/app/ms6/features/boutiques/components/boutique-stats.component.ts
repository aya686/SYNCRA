import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Boutique, StatsBoutique, BoutiqueService } from '../../boutiques';
import { NotificationService } from '../../../core';

@Component({
  selector: 'app-boutique-stats',
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex align-items-center mb-4">
        <button class="btn btn-outline-secondary btn-sm me-3" (click)="goBack()">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div>
          <h1 class="h3 mb-1">Statistiques</h1>
          <p class="text-muted mb-0" *ngIf="boutique">{{ boutique.nom }}</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="row g-4" *ngIf="stats">
        <div class="col-xl-3 col-md-6">
          <div class="card h-100 border-start border-4 border-primary shadow-sm">
            <div class="card-body d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-primary bg-opacity-10 rounded-3 p-3">
                  <i class="bi bi-graph-up-arrow fs-2 text-primary"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <h3 class="mb-1">{{ stats.totalVentes | currency:'EUR' }}</h3>
                <p class="text-muted mb-0">Total des ventes</p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="card h-100 border-start border-4 border-success shadow-sm">
            <div class="card-body d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-success bg-opacity-10 rounded-3 p-3">
                  <i class="bi bi-cart fs-2 text-success"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <h3 class="mb-1">{{ stats.totalCommandes }}</h3>
                <p class="text-muted mb-0">Total commandes</p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="card h-100 border-start border-4 border-warning shadow-sm">
            <div class="card-body d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-warning bg-opacity-10 rounded-3 p-3">
                  <i class="bi bi-star-fill fs-2 text-warning"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <h3 class="mb-1">{{ stats.noteMoyenne | number:'1.1-1' }}/5</h3>
                <p class="text-muted mb-0">Note moyenne</p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="card h-100 border-start border-4 border-info shadow-sm">
            <div class="card-body d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-info bg-opacity-10 rounded-3 p-3">
                  <i class="bi bi-calendar-check fs-2 text-info"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <h3 class="mb-1">{{ stats.dateCalcul | date:'dd/MM/yyyy' }}</h3>
                <p class="text-muted mb-0">Dernière mise à jour</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="card shadow-sm" *ngIf="!stats && !loading">
        <div class="card-body text-center py-5">
          <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
            <i class="bi bi-graph-down fs-1 text-muted"></i>
          </div>
          <h5 class="text-muted">Aucune statistique disponible</h5>
          <p class="text-muted mb-0">Les statistiques de cette boutique n'ont pas encore été générées.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: all 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-3px);
      box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
    }
    
    .bg-opacity-10 {
      --bs-bg-opacity: 0.1;
    }
    
    .border-4 {
      border-width: 4px !important;
    }
    
    h3 {
      font-size: 1.75rem;
      font-weight: 700;
    }
  `],
  standalone: false
})
export class BoutiqueStatsComponent implements OnInit {
  boutique?: Boutique;
  stats?: StatsBoutique;
  loading = false;
  boutiqueId?: number;

  constructor(
    private boutiqueService: BoutiqueService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    // Check if id is a valid number (not "new" or undefined)
    this.boutiqueId = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;
    if (this.boutiqueId) {
      this.loadData();
    } else {
      this.notificationService.error('ID de boutique manquant ou invalide');
      this.router.navigate(['/admin/boutiques']);
    }
  }

  loadData(): void {
    this.loading = true;
    
    this.boutiqueService.getBoutiqueById(this.boutiqueId!).subscribe({
      next: (boutique) => {
        this.boutique = boutique;
        this.cdr.markForCheck();  // Force update UI
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement de la boutique');
      }
    });

    this.boutiqueService.getBoutiqueStats(this.boutiqueId!).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
        this.cdr.markForCheck();  // Force update UI
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/boutiques']);
  }
}
