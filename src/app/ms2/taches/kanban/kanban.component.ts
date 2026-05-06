import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TacheService } from '../../services/tache.service';
import { ProjetService } from '../../services/projet.service';
import { Tache, StatutTache, PrioriteTache } from '../../models/tache.model';
import { Projet } from '../../models/projet.model';
import { Ms2NavbarComponent } from '../../shared/navbar/ms2-navbar.component';
import { take } from 'rxjs/operators';

interface Colonne {
  id: StatutTache;
  label: string;
  icon: string;
  color: string;
  taches: Tache[];
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule, Ms2NavbarComponent],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})
export class KanbanComponent implements OnInit {

  projetId!: number;
  projet?: Projet;
  loading = true;
  error = '';
  tacheSelectionnee?: Tache;
  panneauOuvert = false;
  updatingId: number | null = null;

  colonnes: Colonne[] = [
    { id: StatutTache.A_FAIRE,  label: 'À faire',   icon: 'ti-circle',              color: '#607a96', taches: [] },
    { id: StatutTache.EN_COURS, label: 'En cours',  icon: 'ti-player-play',         color: '#0a6ebd', taches: [] },
    { id: StatutTache.EN_REVUE, label: 'En revue',  icon: 'ti-eye',                 color: '#c47a00', taches: [] },
    { id: StatutTache.BLOQUE,   label: 'Bloqué',    icon: 'ti-circle-x',            color: '#dc2626', taches: [] },
    { id: StatutTache.TERMINE,  label: 'Terminé',   icon: 'ti-circle-check-filled', color: '#00c2d4', taches: [] },
  ];

  get colonneIds(): string[] {
    return this.colonnes.map(c => c.id);
  }

  constructor(
    private route: ActivatedRoute,
    private tacheService: TacheService,
    private projetService: ProjetService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('projetId');
    if (!id) { this.error = 'ID projet manquant.'; this.loading = false; return; }
    this.projetId = +id;
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.projetService.getById(this.projetId).pipe(take(1)).subscribe({
      next: (p) => {
        this.projet = p;
        this.chargerTaches();
      },
      error: () => { this.error = 'Projet introuvable.'; this.loading = false; }
    });
  }

  chargerTaches(): void {
    this.tacheService.getByProjet(this.projetId).pipe(take(1)).subscribe({
      next: (taches) => {
        this.colonnes.forEach(c => c.taches = []);
        taches.forEach(t => {
          const col = this.colonnes.find(c => c.id === t.statut);
          if (col) col.taches.push(t);
          else this.colonnes[0].taches.push(t);
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erreur chargement tâches.'; this.loading = false; }
    });
  }

  drop(event: CdkDragDrop<Tache[]>, colonneTarget: Colonne): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const tache = event.previousContainer.data[event.previousIndex];
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    this.updatingId = tache.id!;
    this.tacheService.updateStatut(tache.id!, colonneTarget.id).pipe(take(1)).subscribe({
      next: (t) => {
        tache.statut = t.statut;
        this.updatingId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        // Rollback
        transferArrayItem(
          event.container.data,
          event.previousContainer.data,
          event.currentIndex,
          event.previousIndex
        );
        this.updatingId = null;
        alert('Erreur lors du changement de statut.');
      }
    });
  }

  ouvrirPanneau(tache: Tache): void {
    this.tacheSelectionnee = tache;
    this.panneauOuvert = true;
  }

  fermerPanneau(): void {
    this.panneauOuvert = false;
    this.tacheSelectionnee = undefined;
  }

  badgePriorite(p?: string): string {
    const map: Record<string, string> = {
      HAUTE:    'prio-haute',
      MOYENNE:  'prio-moyenne',
      BASSE:    'prio-basse',
      CRITIQUE: 'prio-critique'
    };
    return map[p ?? ''] ?? '';
  }

  labelPriorite(p?: string): string {
    const map: Record<string, string> = {
      HAUTE: 'Haute', MOYENNE: 'Moyenne', BASSE: 'Basse', CRITIQUE: 'Critique'
    };
    return map[p ?? ''] ?? p ?? '';
  }

  joursLabel(deadline?: string): string {
    if (!deadline) return '';
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    if (diff < 0) return `${Math.abs(diff)}j retard`;
    if (diff === 0) return 'Aujourd\'hui';
    return `${diff}j`;
  }

  joursClass(deadline?: string): string {
    if (!deadline) return '';
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    if (diff < 0) return 'retard';
    if (diff <= 3) return 'urgent';
    return '';
  }

  totalTaches(): number {
    return this.colonnes.reduce((s, c) => s + c.taches.length, 0);
  }

  tachesTerminees(): number {
    return this.colonnes.find(c => c.id === StatutTache.TERMINE)?.taches.length ?? 0;
  }

  avancement(): number {
    const total = this.totalTaches();
    return total === 0 ? 0 : Math.round((this.tachesTerminees() / total) * 100);
  }
}