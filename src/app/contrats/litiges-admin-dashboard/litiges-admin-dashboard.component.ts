import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Litige, StatutLitige, DecisionAdmin } from '../../models/contrat.model';
import { LitigeService } from '../../services/litige.service';

@Component({
  selector: 'app-litiges-admin-dashboard',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './litiges-admin-dashboard.component.html',
  styleUrls: ['./litiges-admin-dashboard.component.scss']
})
export class LitigesAdminDashboardComponent implements OnInit {
  litiges: Litige[] = [];
  filteredLitiges: Litige[] = [];
  loading = false;
  error = '';

  // Filters
  filterStatut: StatutLitige | null = null;

  // Statistics
  stats = {
    total: 0,
    enCours: 0,
    resolus: 0,
    urgents: 0
  };

  // Selected litige for resolution
  selectedLitige: Litige | null = null;
  showResolutionModal = false;

  // Resolution form
  resolutionForm = {
    decision: '' as DecisionAdmin | '',
    commentaire: ''
  };

  constructor(private litigeService: LitigeService) {}

  ngOnInit(): void {
    this.loadLitiges();
  }

  loadLitiges(): void {
    this.loading = true;
    this.litigeService.getAllLitiges().subscribe({
      next: (data) => {
        this.litiges = data;
        this.applyFilters();
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement litiges:', err);
        this.error = 'Erreur lors du chargement des litiges';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredLitiges = this.litiges.filter(litige => {
      if (this.filterStatut && litige.statut !== this.filterStatut) {
        return false;
      }
      return true;
    });
  }

  calculateStats(): void {
    this.stats.total = this.litiges.length;
    this.stats.enCours = this.litiges.filter(l => l.statut === StatutLitige.EN_COURS).length;
    this.stats.resolus = this.litiges.filter(l => l.statut === StatutLitige.RESOLU).length;
    this.stats.urgents = this.litiges.filter(l => l.statut === StatutLitige.OUVERT).length;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getStatutBadgeClass(statut: StatutLitige): string {
    switch (statut) {
      case StatutLitige.OUVERT:
        return 'badge-ouvert';
      case StatutLitige.EN_COURS:
        return 'badge-en-cours';
      case StatutLitige.RESOLU:
        return 'badge-resolu';
      case StatutLitige.FERME:
        return 'badge-ferme';
      default:
        return '';
    }
  }

  getStatutLabel(statut: StatutLitige): string {
    switch (statut) {
      case StatutLitige.OUVERT:
        return 'OUVERT';
      case StatutLitige.EN_COURS:
        return 'EN COURS';
      case StatutLitige.RESOLU:
        return 'RESOLU';
      case StatutLitige.FERME:
        return 'FERME';
      default:
        return '';
    }
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  openResolutionModal(litige: Litige): void {
    this.selectedLitige = litige;
    this.resolutionForm = {
      decision: '',
      commentaire: ''
    };
    this.showResolutionModal = true;
  }

  closeResolutionModal(): void {
    this.selectedLitige = null;
    this.showResolutionModal = false;
    this.resolutionForm = {
      decision: '',
      commentaire: ''
    };
  }

  prendreEnCharge(litigeId: number): void {
    const adminId = 1; // TODO: Get from auth
    this.litigeService.prendreEnCharge(litigeId, adminId).subscribe({
      next: () => {
        this.loadLitiges();
      },
      error: (err) => {
        console.error('Erreur prise en charge:', err);
      }
    });
  }

  resoudreLitige(): void {
    if (!this.selectedLitige || !this.resolutionForm.decision) return;

    this.litigeService.resoudreLitige(
      this.selectedLitige.id!,
      this.resolutionForm.decision,
      this.resolutionForm.commentaire
    ).subscribe({
      next: () => {
        this.closeResolutionModal();
        this.loadLitiges();
      },
      error: (err) => {
        console.error('Erreur résolution litige:', err);
        this.error = 'Erreur lors de la résolution du litige';
      }
    });
  }

  fermerLitige(litigeId: number): void {
    this.litigeService.fermerLitige(litigeId).subscribe({
      next: () => {
        this.loadLitiges();
      },
      error: (err) => {
        console.error('Erreur fermeture litige:', err);
      }
    });
  }
}
