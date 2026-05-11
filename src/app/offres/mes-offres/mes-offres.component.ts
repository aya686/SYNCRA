import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Offre, StatutOffre } from '../../models/offre.model';
import { OffreService } from '../../services/offre.service';

@Component({
  selector: 'app-mes-offres',
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-offres.component.html',
  styleUrls: ['./mes-offres.component.scss']
})
export class MesOffresComponent implements OnInit {
  offres: Offre[] = [];
  loading = false;
  error = '';
  
  // Utilisateur connecté (simulé)
  currentUserId = 1;
  
  // Filtre par statut
  selectedStatut: StatutOffre | '' = '';
  statuts = Object.values(StatutOffre);

  constructor(
    private offreService: OffreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMesOffres();
  }

  loadMesOffres(): void {
    this.error = '';
    
    this.offreService.getOffresByPublieur(this.currentUserId).subscribe({
      next: (data) => {
        this.offres = data;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de vos offres';
        console.error(err);
      }
    });
  }

  filterByStatut(): void {
    this.loadMesOffres();
    // La filtration visuelle se fait dans le template avec pipe ou méthode
  }

  getFilteredOffres(): Offre[] {
    if (!this.selectedStatut) {
      return this.offres;
    }
    return this.offres.filter(o => o.statut === this.selectedStatut);
  }

  voirDetail(offreId: number | undefined): void {
    if (offreId) {
      this.router.navigate(['/offres/detail', offreId]);
    }
  }

  modifierOffre(offre: Offre): void {
    if (offre.statut !== StatutOffre.BROUILLON) {
      alert('Seules les offres en brouillon peuvent être modifiées');
      return;
    }
    this.router.navigate(['/offres/modifier', offre.id]);
  }

  cloturerOffre(offre: Offre): void {
    if (offre.statut !== StatutOffre.ACTIVE) {
      alert('Seules les offres actives peuvent être clôturées');
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir clôturer l'offre "${offre.titre}" ?`)) {
      this.offreService.cloturerOffre(offre.id!).subscribe({
        next: () => {
          this.loadMesOffres();
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la clôture';
        }
      });
    }
  }

  supprimerOffre(offre: Offre): void {
    if (offre.statut !== StatutOffre.BROUILLON) {
      alert('Seules les offres en brouillon peuvent être supprimées');
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'offre "${offre.titre}" ?`)) {
      this.offreService.deleteOffre(offre.id!).subscribe({
        next: () => {
          this.loadMesOffres();
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la suppression';
        }
      });
    }
  }

  getStatutLabel(statut: StatutOffre | undefined): string {
    return statut ? this.offreService.getStatutLabel(statut) : '';
  }

  getStatutBadgeClass(statut: StatutOffre | undefined): string {
    return statut ? this.offreService.getStatutBadgeClass(statut) : 'badge bg-light';
  }

  formatBudget(budgetMin: number, budgetMax: number | null): string {
    if (budgetMax) {
      return `${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()} TND`;
    }
    return `À partir de ${budgetMin.toLocaleString()} TND`;
  }

  getCategorieNom(offre: Offre): string {
    if (offre.categorie?.nom) return offre.categorie.nom;
    if (offre.categorieNom) return offre.categorieNom;
    return 'Non catégorisé';
  }

  getCandidaturesText(nombre: number | undefined): string {
    const n = nombre || 0;
    return n === 0 ? 'Aucune' : `${n} candidature${n > 1 ? 's' : ''}`;
  }
}
