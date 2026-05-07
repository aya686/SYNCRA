import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Boutique, BoutiqueService } from '../../../features/boutiques';
import { NotificationService } from '../../../core';

@Component({
  selector: 'app-client-boutique-list',
  template: `
    <div class="client-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Nos Boutiques</h1>
          <p class="page-subtitle">Découvrez nos partenaires commerçants</p>
        </div>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <i class="bi bi-search"></i>
        <input 
          type="text" 
          [(ngModel)]="searchTerm" 
          (input)="onSearch()"
          placeholder="Rechercher une boutique..."
        >
        <button *ngIf="searchTerm" (click)="clearSearch()" class="clear-btn">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Boutiques Grid -->
      <div class="boutiques-grid" *ngIf="filteredBoutiques.length > 0">
        <div class="boutique-card" *ngFor="let boutique of filteredBoutiques" (click)="viewDetails(boutique)">
          <div class="boutique-header">
            <div class="boutique-icon">
              <img *ngIf="boutique.logo" [src]="boutique.logo" alt="{{ boutique.nom }}" class="logo-img">
              <i *ngIf="!boutique.logo" class="bi bi-shop"></i>
            </div>
            <span class="status-badge" [class.active]="boutique.statut === 'ACTIF'">
              {{ boutique.statut === 'ACTIF' ? 'Active' : 'En pause' }}
            </span>
          </div>
          <h3 class="boutique-name">{{ boutique.nom }}</h3>
          <p class="boutique-desc">{{ boutique.description || 'Boutique de qualité' }}</p>
          <div class="boutique-footer">
            <span class="date">
              <i class="bi bi-calendar3"></i>
              Depuis {{ boutique.dateCreation | date:'MM/yyyy' }}
            </span>
            <button class="btn-view">
              Voir <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredBoutiques.length === 0">
        <div class="empty-icon">
          <i class="bi bi-shop"></i>
        </div>
        <h3>Aucune boutique trouvée</h3>
        <p>Essayez une autre recherche</p>
        <button class="btn-reset" (click)="clearSearch()">
          <i class="bi bi-arrow-counterclockwise"></i>
          Réinitialiser
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./client-boutique-list.component.scss'],
  standalone: false
})
export class ClientBoutiqueListComponent implements OnInit {
  boutiques: Boutique[] = [];
  filteredBoutiques: Boutique[] = [];
  searchTerm = '';

  constructor(
    private boutiqueService: BoutiqueService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBoutiques();
  }

  loadBoutiques(): void {
    this.boutiqueService.getAllBoutiques().subscribe({
      next: (boutiques) => {
        // Show all non-suspended boutiques for clients
        this.boutiques = boutiques.filter(b => {
          const statut = (b.statut || '').toUpperCase();
          return statut !== 'SUSPENDU' && statut !== 'SUSPENDED' && statut !== 'INACTIF' && statut !== 'INACTIVE';
        });
        this.filteredBoutiques = [...this.boutiques];
        console.log('Client boutiques loaded:', this.boutiques.length);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading boutiques:', err);
        this.notificationService.error('Erreur lors du chargement des boutiques');
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm) {
      this.filteredBoutiques = [...this.boutiques];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredBoutiques = this.boutiques.filter(b =>
      b.nom.toLowerCase().includes(term) ||
      (b.description && b.description.toLowerCase().includes(term))
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredBoutiques = [...this.boutiques];
  }

  viewDetails(boutique: Boutique): void {
    this.router.navigate(['/boutiques', boutique.boutiqueId]);
  }
}
