import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaiementService } from '../../services/paiement.service';
import { Paiement, StatutPaiement } from '../../models/paiement.model';

@Component({
  selector: 'app-dashboard-admin-paiements',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-admin-paiements.component.html',
  styleUrls: ['./dashboard-admin-paiements.component.scss']
})
export class DashboardAdminPaiementsComponent implements OnInit {
  paiements: Paiement[] = [];
  loading = true;
  error: string | null = null;

  // Filtres
  selectedStatut: string | null = null;
  stats = {
    totalPaye: 0,
    totalCommissions: 0,
    totalEnAttente: 0,
    totalPayes: 0
  };

  constructor(private paiementService: PaiementService) {}

  ngOnInit(): void {
    this.loadPaiements();
    this.loadStats();
  }

  loadPaiements(): void {
    this.loading = true;
    this.paiementService.getAllPaiements().subscribe({
      next: (data) => {
        this.paiements = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des paiements:', err);
        this.error = 'Erreur lors du chargement des paiements';
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.paiementService.getPaiementsStats().subscribe({
      next: (data) => {
        this.stats = {
          totalPaye: data.totalPaye,
          totalCommissions: data.totalCommissions,
          totalEnAttente: this.paiements.filter(p => p.statut === StatutPaiement.EN_ATTENTE).length,
          totalPayes: this.paiements.filter(p => p.statut === StatutPaiement.PAYE).length
        };
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
      }
    });
  }

  filterByStatut(statut: string | null): void {
    this.selectedStatut = statut;
  }

  getFilteredPaiements(): Paiement[] {
    if (this.selectedStatut) {
      return this.paiements.filter(p => p.statut === this.selectedStatut);
    }
    return this.paiements;
  }

  getStatutLabel(statut: StatutPaiement): string {
    const labels: Record<StatutPaiement, string> = {
      EN_ATTENTE: '⏳ En attente',
      PARTIELLEMENT_PAYE: '🔄 Partiellement payé',
      PAYE: '✅ Payé',
      EN_RETARD: '⚠️ En retard',
      REMBOURSE: '💰 Remboursé',
      ANNULE: '🚫 Annulé',
      BLOQUE: '🔒 Bloqué'
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: StatutPaiement): string {
    const classes: Record<StatutPaiement, string> = {
      EN_ATTENTE: 'badge bg-warning',
      PARTIELLEMENT_PAYE: 'badge bg-info',
      PAYE: 'badge bg-success',
      EN_RETARD: 'badge bg-danger',
      REMBOURSE: 'badge bg-secondary',
      ANNULE: 'badge bg-dark',
      BLOQUE: 'badge bg-danger'
    };
    return classes[statut] || 'badge bg-light';
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      maximumFractionDigits: 2
    }).format(montant);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  bloquerPaiement(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir bloquer ce paiement ?')) {
      this.paiementService.bloquerPaiement(id).subscribe({
        next: () => {
          this.loadPaiements();
        },
        error: (err) => {
          console.error('Erreur lors du blocage:', err);
        }
      });
    }
  }

  debloquerPaiement(id: number): void {
    this.paiementService.debloquerPaiement(id).subscribe({
      next: () => {
        this.loadPaiements();
      },
      error: (err) => {
        console.error('Erreur lors du déblocage:', err);
      }
    });
  }
}
