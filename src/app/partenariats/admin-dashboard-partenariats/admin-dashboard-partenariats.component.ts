import { Component, OnInit } from '@angular/core';
import { DemandePartenariatService } from '../../services/demande-partenariat.service';
import { DemandePartenariat, PartenariatEntreprise, StatutDemandePartenariat } from '../../models/partenariat.model';

@Component({
  selector: 'app-admin-dashboard-partenariats',
  templateUrl: './admin-dashboard-partenariats.component.html',
  styleUrls: ['./admin-dashboard-partenariats.component.scss'],
  standalone: false
})
export class AdminDashboardPartenariatsComponent implements OnInit {
  demandes: DemandePartenariat[] = [];
  partenariats: PartenariatEntreprise[] = [];
  loading = false;
  error = '';
  showPartenariats = false;
  stats = {
    totalDemandes: 0,
    demandesEnAttente: 0,
    demandesApprouvees: 0,
    demandesRefusees: 0,
    totalPartenariats: 0
  };

  constructor(private demandePartenariatService: DemandePartenariatService) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.error = '';

    this.demandePartenariatService.getAllDemandes().subscribe({
      next: (data) => {
        this.demandes = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur lors du chargement des demandes de partenariat.';
        console.error('Erreur:', err);
      }
    });
  }

  loadPartenariats(): void {
    this.loading = true;
    this.error = '';
    this.showPartenariats = true;

    this.demandePartenariatService.getAllPartenariats().subscribe({
      next: (data) => {
        this.partenariats = data;
        this.stats.totalPartenariats = data.length;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur lors du chargement des partenariats.';
        console.error('Erreur:', err);
      }
    });
  }

  showDemandes(): void {
    this.showPartenariats = false;
    this.loadDemandes();
  }

  calculateStats(): void {
    this.stats.totalDemandes = this.demandes.length;
    this.stats.demandesEnAttente = this.demandes.filter(d => d.statut === StatutDemandePartenariat.EN_ATTENTE).length;
    this.stats.demandesApprouvees = this.demandes.filter(d => d.statut === StatutDemandePartenariat.APPROUVEE).length;
    this.stats.demandesRefusees = this.demandes.filter(d => d.statut === StatutDemandePartenariat.REFUSEE).length;
  }

  approuverDemande(id: number): void {
    const demande = this.demandes.find(d => d.id === id);
    if (demande) {
      demande.statut = StatutDemandePartenariat.APPROUVEE;
      this.demandePartenariatService.updateDemande(id, demande).subscribe({
        next: () => {
          this.loadDemandes();
        },
        error: (err) => {
          console.error('Erreur lors de l\'approbation:', err);
        }
      });
    }
  }

  refuserDemande(id: number): void {
    const demande = this.demandes.find(d => d.id === id);
    if (demande) {
      demande.statut = StatutDemandePartenariat.REFUSEE;
      this.demandePartenariatService.updateDemande(id, demande).subscribe({
        next: () => {
          this.loadDemandes();
        },
        error: (err) => {
          console.error('Erreur lors du refus:', err);
        }
      });
    }
  }

  supprimerDemande(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande de partenariat ?')) {
      this.demandePartenariatService.deleteDemande(id).subscribe({
        next: () => {
          this.loadDemandes();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
    }
  }

  supprimerPartenariat(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce partenariat ?')) {
      this.demandePartenariatService.deletePartenariat(id).subscribe({
        next: () => {
          this.loadPartenariats();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
    }
  }

  getStatutClass(statut: StatutDemandePartenariat): string {
    switch (statut) {
      case StatutDemandePartenariat.APPROUVEE:
        return 'statut-approuve';
      case StatutDemandePartenariat.REFUSEE:
        return 'statut-refuse';
      default:
        return 'statut-attente';
    }
  }

  getStatutLabel(statut: StatutDemandePartenariat): string {
    switch (statut) {
      case StatutDemandePartenariat.APPROUVEE:
        return 'Approuvée';
      case StatutDemandePartenariat.REFUSEE:
        return 'Refusée';
      default:
        return 'En attente';
    }
  }
}
