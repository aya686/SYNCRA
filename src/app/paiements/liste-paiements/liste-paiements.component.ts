import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaiementService } from '../../services/paiement.service';
import { Paiement, StatutPaiement } from '../../models/paiement.model';

@Component({
  selector: 'app-liste-paiements',
  imports: [CommonModule, RouterModule],
  templateUrl: './liste-paiements.component.html',
  styleUrls: ['./liste-paiements.component.scss']
})
export class ListePaiementsComponent implements OnInit {
  currentUserId: number = 1; // À remplacer par l'ID de l'utilisateur connecté
  paiements: Paiement[] = [];
  loading = true;
  error: string | null = null;

  constructor(private paiementService: PaiementService) {}

  ngOnInit(): void {
    this.loadPaiements();
  }

  loadPaiements(): void {
    this.loading = true;
    this.paiementService.getMesPaiements(this.currentUserId).subscribe({
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

  getPaiementsEnAttente(): Paiement[] {
    return this.paiements.filter(p => p.statut === StatutPaiement.EN_ATTENTE);
  }

  getPaiementsPayes(): Paiement[] {
    return this.paiements.filter(p => p.statut === StatutPaiement.PAYE);
  }

  get totalPaye(): number {
    return this.paiements.reduce((sum, p) => sum + p.montantPaye, 0);
  }

  get totalRestant(): number {
    return this.paiements.reduce((sum, p) => sum + p.montantRestant, 0);
  }
}
