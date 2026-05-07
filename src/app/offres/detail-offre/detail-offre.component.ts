import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Offre, StatutOffre } from '../../models/offre.model';
import { OffreService } from '../../services/offre.service';

@Component({
  selector: 'app-detail-offre',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-offre.component.html',
  styleUrls: ['./detail-offre.component.scss']
})
export class DetailOffreComponent implements OnInit {
  offre: Offre | null = null;
  loading = false;
  error = '';
  
  // Utilisateur connecté (simulé)
  currentUserId = 1;
  
  // Vérifier si l'utilisateur est le publieur
  isPublieur = false;
  
  // Vérifier si l'utilisateur est un freelance
  isFreelance = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offreService: OffreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOffre(+id);
    } else {
      this.error = 'ID de l\'offre non spécifié';
    }
  }

  loadOffre(id: number): void {
    this.loading = true;
    this.error = '';
    this.offre = null;
    
    console.log('Chargement offre ID:', id);
    console.log('URL appelée:', `http://localhost:8085/api/offres/${id}`);
    
    this.offreService.getOffreById(id).subscribe({
      next: (data) => {
        console.log('Offre reçue avec succès:', data);
        if (data && data.id) {
          this.offre = data;
          this.isPublieur = data.publieurId === this.currentUserId;
        } else {
          this.error = 'Réponse invalide du serveur';
        }
        this.loading = false;
        this.cdr.detectChanges(); // Force Angular to update the view
      },
      error: (err) => {
        console.error('Erreur détaillée:', err);
        if (err.status === 404) {
          this.error = 'Offre non trouvée (ID: ' + id + ')';
        } else if (err.status === 0) {
          this.error = 'Connexion refusée. Vérifiez que Spring Boot est démarré sur le port 8085 et que CORS est configuré.';
        } else if (err.status === 500) {
          this.error = 'Erreur serveur (500). Vérifiez les logs Spring Boot.';
        } else {
          this.error = 'Erreur ' + err.status + ': ' + (err.error?.message || err.message || 'Erreur inconnue');
        }
        this.loading = false;
      }
    });
    
    // Timeout de sécurité
    setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = 'Timeout: Le serveur ne répond pas après 10 secondes';
      }
    }, 10000);
  }

  postuler(): void {
    if (this.offre?.id) {
      this.router.navigate(['/candidatures/postuler', this.offre.id]);
    }
  }

  modifierOffre(): void {
    // Redirection vers la page de modification
    if (this.offre?.id) {
      this.router.navigate(['/offres/modifier', this.offre.id]);
    }
  }

  cloturerOffre(): void {
    if (confirm('Êtes-vous sûr de vouloir clôturer cette offre ?')) {
      if (this.offre?.id) {
        this.offreService.cloturerOffre(this.offre.id).subscribe({
          next: () => {
            this.loadOffre(this.offre!.id!);
          },
          error: (err) => {
            this.error = err.error?.message || 'Erreur lors de la clôture';
          }
        });
      }
    }
  }

  retourMarketplace(): void {
    this.router.navigate(['/offres/marketplace']);
  }

  getStatutLabel(statut: StatutOffre | undefined): string {
    return statut ? this.offreService.getStatutLabel(statut) : '';
  }

  getStatutBadgeClass(statut: StatutOffre | undefined): string {
    return statut ? this.offreService.getStatutBadgeClass(statut) : 'badge bg-light';
  }

  formatBudget(budgetMin: number | undefined, budgetMax: number | undefined): string {
    if (budgetMin === undefined) return 'Non spécifié';
    if (budgetMax) {
      return `${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()} TND`;
    }
    return `À partir de ${budgetMin.toLocaleString()} TND`;
  }

  calculerJoursRestants(deadline: string | undefined): number {
    if (!deadline) return 0;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  getCategorieNom(offre: Offre | null): string {
    if (!offre) return 'Non catégorisé';
    // Spring Boot retourne categorie.nom
    if (offre.categorie?.nom) return offre.categorie.nom;
    // Fallback sur categorieNom si disponible
    if (offre.categorieNom) return offre.categorieNom;
    return 'Non catégorisé';
  }
}
