import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjetService } from '../../services/projet.service';
import { Projet, StatutProjet, Avancement } from '../../models/projet.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Ms2NavbarComponent } from '../../shared/navbar/ms2-navbar.component';
import { take } from 'rxjs/operators';  // à ajouter en haut


interface ProjetCard {
  projet: Projet;
  avancement: number;
  joursRestants: number;
}

@Component({
  selector: 'app-dashboard-projets',
  imports: [CommonModule, RouterModule, Ms2NavbarComponent],
  templateUrl: './dashboard-projets.component.html',
  styleUrls: ['./dashboard-projets.component.scss']
})
export class DashboardProjetsComponent implements OnInit {

  readonly PORTEUR_ID = 1;

  cards: ProjetCard[] = [];
  filteredCards: ProjetCard[] = [];
  loading = true;
  error = '';
  filtreActif: string = 'TOUS';

  statuts = ['TOUS', ...Object.values(StatutProjet)];

  stats = { total: 0, enCours: 0, termines: 0, enAttente: 0 };

  private scrollObserver?: IntersectionObserver;

  constructor(
    private projetService: ProjetService,
    private route: ActivatedRoute,
        private cdr: ChangeDetectorRef  // ← AJOUTÉ

  ) {}

  ngOnInit(): void {
    this.chargerProjets();
  }

  chargerProjets(): void {
  this.loading = true;
  console.log('1 - début');

  this.projetService.getByPorteur(this.PORTEUR_ID)
    .pipe(take(1))
    .subscribe({
      next: (projets) => {
        console.log('2 - projets reçus:', projets?.length);
        if (!projets?.length) {
          this.cards = [];
          this.filteredCards = [];
          this.loading = false;
          this.cdr.detectChanges();  // ← AJOUTE À CHAQUE ENDROIT OÙ loading = false

          return;
        }

        const avancements$ = projets.map(p =>
          this.projetService.getAvancement(p.id!).pipe(
            take(1),  // ← AJOUTE CE take(1)
            catchError(() => of({ pourcentage: 0 } as Avancement))
          )
        );

     forkJoin(avancements$).pipe(take(1)).subscribe({
  next: (avancements) => {
    console.log('5 - avancements reçus', avancements);
    console.log('projets:', projets);
    console.log('projets[0]:', projets[0]);
    console.log('projets[0].id:', projets[0]?.id);
    
    this.cards = projets.map((p, i) => ({
      projet: p,
      avancement: avancements[i]?.pourcentage ?? 0,
      joursRestants: this.calculerJoursRestants(p.dateFin)
    }));
    
    console.log('cards après mapping:', this.cards);
    console.log('cards.length:', this.cards.length);
    
    this.filteredCards = [...this.cards];
    console.log('filteredCards.length:', this.filteredCards.length);
    
    this.calculerStats();
    this.loading = false;
    console.log('loading = false');
        setTimeout(() => this.initScrollAnimations(), 100);

  }
});
      },
      error: (err) => {
        console.error('getByPorteur error:', err);
        this.loading = false;
      }
    });
}

initScrollAnimations(): void {
  console.log('initScrollAnimations appelée');
  setTimeout(() => {
    const elements = document.querySelectorAll('.reveal');
    console.log('éléments .reveal trouvés:', elements.length);
    elements.forEach(el => {
      el.classList.add('visible');
    });
  }, 50);
}

filtrer(statut: string): void {
  this.filtreActif = statut;
  if (statut === 'TOUS') {
    this.filteredCards = [...this.cards];
  } else {
    this.filteredCards = this.cards.filter(c => c.projet.statut === statut);
  }
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
  }, 50);
}

  supprimerProjet(id: number): void {
    if (!confirm('Supprimer ce projet et toutes ses données ?')) return;
    this.projetService.delete(id).subscribe({
      next: () => this.chargerProjets(),
      error: () => alert('Erreur lors de la suppression.')
    });
  }

  private calculerJoursRestants(dateFin?: string): number {
    if (!dateFin) return 0;
    const fin = new Date(dateFin);
    const aujourd = new Date();
    const diff = Math.ceil((fin.getTime() - aujourd.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  private calculerStats(): void {
    this.stats.total = this.cards.length;
    this.stats.enCours = this.cards.filter(c => c.projet.statut === StatutProjet.EN_COURS).length;
    this.stats.termines = this.cards.filter(c => c.projet.statut === StatutProjet.TERMINE).length;
    this.stats.enAttente = this.cards.filter(c => c.projet.statut === StatutProjet.EN_ATTENTE).length;
  }

  badgeStatut(statut?: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'badge bg-warning text-dark',
      EN_COURS:   'badge bg-primary',
      TERMINE:    'badge bg-success',
      ARCHIVE:    'badge bg-secondary',
      ANNULE:     'badge bg-danger'
    };
    return map[statut ?? ''] ?? 'badge bg-secondary';
  }

  getBadgeClass(statut?: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'en-attente',
      EN_COURS:   'en-cours',
      TERMINE:    'termine',
      ARCHIVE:    'archive',
      ANNULE:     'annule'
    };
    return map[statut ?? ''] ?? '';
  }

  labelStatut(statut?: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'En attente',
      EN_COURS:   'En cours',
      TERMINE:    'Terminé',
      ARCHIVE:    'Archivé',
      ANNULE:     'Annulé'
    };
    return map[statut ?? ''] ?? statut ?? '';
  }

  couleurAvancement(pct: number): string {
    if (pct >= 80) return '#00c2d4';
    if (pct >= 50) return '#0a6ebd';
    if (pct >= 25) return '#c47a00';
    return '#dc2626';
  }

  joursLabel(jours: number): string {
    if (jours < 0) return `${Math.abs(jours)}j de retard`;
    if (jours === 0) return 'Deadline aujourd\'hui';
    return `${jours}j restants`;
  }

  joursClass(jours: number): string {
    if (jours < 0) return 'text-danger fw-bold';
    if (jours <= 7) return 'text-warning fw-bold';
    return 'text-muted';
  }
}