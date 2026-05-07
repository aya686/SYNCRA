import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InvestisseurService } from '../../services/investisseur.service';
import { MiseFondsService } from '../../services/mise-fonds.service';
import { ConventionService } from '../../services/convention.service';
import { Investisseur, MiseFonds, Convention, StatutMiseFonds, StatutConvention } from '../../models/investissement.model';

@Component({
  selector: 'app-dashboard-admin-investissements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard-admin-investissements.component.html',
  styleUrl: './dashboard-admin-investissements.component.scss'
})
export class DashboardAdminInvestissementsComponent implements OnInit {
  investisseurs: Investisseur[] = [];
  misesFonds: MiseFonds[] = [];
  conventions: Convention[] = [];
  loading = true;
  error: string | null = null;

  // Filters
  filters = {
    investisseur: '',
    statutMiseFonds: '',
    statutConvention: '',
    dateDebut: '',
    dateFin: ''
  };

  // Statistics
  stats = {
    totalInvestisseurs: 0,
    totalMisesFonds: 0,
    misesFondsEnAttente: 0,
    misesFondsValidees: 0,
    totalConventions: 0,
    conventionsActives: 0,
    montantTotalInvesti: 0
  };

  // Tabs
  activeTab: string = 'mises-fonds';

  constructor(
    private investisseurService: InvestisseurService,
    private miseFondsService: MiseFondsService,
    private conventionService: ConventionService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    // Load all data in parallel
    this.investisseurService.getAllInvestisseurs().subscribe({
      next: (data) => {
        this.investisseurs = data;
        this.updateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des investisseurs:', err);
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
      }
    });

    this.miseFondsService.getAllMisesFonds().subscribe({
      next: (data) => {
        this.misesFonds = data;
        this.updateStats();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des mises de fonds:', err);
      }
    });

    this.conventionService.getAllConventions().subscribe({
      next: (data) => {
        this.conventions = data;
        this.updateStats();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des conventions:', err);
      }
    });
  }

  updateStats(): void {
    this.stats.totalInvestisseurs = this.investisseurs.length;
    this.stats.totalMisesFonds = this.misesFonds.length;
    this.stats.misesFondsEnAttente = this.misesFonds.filter(mf => mf.statut === StatutMiseFonds.EN_ATTENTE).length;
    this.stats.misesFondsValidees = this.misesFonds.filter(mf => mf.statut === StatutMiseFonds.VALIDEE).length;
    this.stats.totalConventions = this.conventions.length;
    this.stats.conventionsActives = this.conventions.filter(c => c.statut === StatutConvention.ACTIVE).length;
    this.stats.montantTotalInvesti = this.misesFonds
      .filter(mf => mf.statut === StatutMiseFonds.VALIDEE)
      .reduce((sum, mf) => sum + (mf.montant || 0), 0);
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  validerMiseFonds(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir valider cette mise de fonds ?')) {
      this.miseFondsService.validerMiseFonds(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error('Erreur lors de la validation:', err);
          this.error = 'Erreur lors de la validation';
        }
      });
    }
  }

  refuserMiseFonds(id: number): void {
    const motif = prompt('Motif du refus :');
    if (motif) {
      this.miseFondsService.refuserMiseFonds(id, motif).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error('Erreur lors du refus:', err);
          this.error = 'Erreur lors du refus';
        }
      });
    }
  }

  verifierInvestisseur(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir vérifier cet investisseur ?')) {
      this.investisseurService.verifierInvestisseur(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error('Erreur lors de la vérification:', err);
          this.error = 'Erreur lors de la vérification';
        }
      });
    }
  }

  resilierConvention(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir résilier cette convention ?')) {
      this.conventionService.resilierConvention(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error('Erreur lors de la résiliation:', err);
          this.error = 'Erreur lors de la résiliation';
        }
      });
    }
  }

  getStatutMiseFondsLabel(statut: StatutMiseFonds): string {
    const labels: Record<StatutMiseFonds, string> = {
      EN_ATTENTE: '⏳ En attente',
      EN_REVISION: '🔄 En révision',
      VALIDEE: '✅ Validée',
      REFUSEE: '❌ Refusée',
      ANNULEE: '🚫 Annulée'
    };
    return labels[statut] || statut;
  }

  getStatutConventionLabel(statut: StatutConvention): string {
    const labels: Record<StatutConvention, string> = {
      EN_COURS_SIGNATURE: '🔄 En cours',
      ACTIVE: '✅ Active',
      EXPIREE: '⏰ Expirée',
      RESILIEE: '🚫 Résiliée',
      SUSPENDUE: '⏸️ Suspendue'
    };
    return labels[statut] || statut;
  }

  formatMontant(montant: number): string {
    if (!montant) return '-';
    return new Intl.NumberFormat('fr-TN', { 
      style: 'currency', 
      currency: 'TND',
      maximumFractionDigits: 0 
    }).format(montant);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  getFilteredMisesFonds(): MiseFonds[] {
    let filtered = this.misesFonds;
    
    if (this.filters.statutMiseFonds) {
      filtered = filtered.filter(mf => mf.statut === this.filters.statutMiseFonds);
    }
    
    return filtered;
  }

  getFilteredConventions(): Convention[] {
    let filtered = this.conventions;
    
    if (this.filters.statutConvention) {
      filtered = filtered.filter(c => c.statut === this.filters.statutConvention);
    }
    
    return filtered;
  }
}
