import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PartenaireService } from '../../services/partenaire.service';
import { Partenaire, TypePartenaire } from '../../models/investissement.model';

@Component({
  selector: 'app-investisseurs-partenaires',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './investisseurs-partenaires.component.html',
  styleUrl: './investisseurs-partenaires.component.scss'
})
export class InvestisseursPartenairesComponent implements OnInit {
  partenaires: Partenaire[] = [];
  loading = true;
  error: string | null = null;

  // Statistics
  stats = {
    projetsOuverts: 24,
    financesCetteAnnee: 12,
    investisseursActifs: 45,
    totalInvesti: 2400000
  };

  // Filters
  filters = {
    recherche: '',
    secteur: '',
    montantMin: '',
    montantMax: '',
    statut: ''
  };

  constructor(private partenaireService: PartenaireService) {}

  ngOnInit(): void {
    this.loadPartenaires();
  }

  loadPartenaires(): void {
    this.loading = true;
    this.partenaireService.getAllPartenaires().subscribe({
      next: (data) => {
        this.partenaires = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des partenaires:', err);
        this.error = 'Erreur lors du chargement des partenaires';
        this.loading = false;
      }
    });
  }

  getTypePartenaireLabel(type: TypePartenaire): string {
    const labels: Record<TypePartenaire, string> = {
      BANQUE: 'Banque',
      ORGANISME_ETAT: 'Organisme d\'État',
      FONDS_INVESTISSEMENT: 'Fonds d\'Investissement',
      INCUBATEUR: 'Incubateur',
      AUTRE: 'Autre'
    };
    return labels[type] || type;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  }

  formatMontant(montant: number): string {
    if (!montant) return '-';
    return new Intl.NumberFormat('fr-TN', { 
      style: 'currency', 
      currency: 'TND',
      maximumFractionDigits: 0 
    }).format(montant);
  }

  getStatutClass(actif: boolean): string {
    return actif ? 'text-success' : 'text-warning';
  }

  getStatutLabel(actif: boolean): string {
    return actif ? 'Convention active' : 'En négociation';
  }
}
