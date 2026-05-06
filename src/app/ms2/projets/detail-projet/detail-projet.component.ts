import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjetService } from '../../services/projet.service';
import { TacheService } from '../../services/tache.service';
import { SprintService } from '../../services/sprint.service';
import { JalonService } from '../../services/jalon.service';
import { ObjectifService } from '../../services/objectif.service';
import { AvancementService } from '../../services/avancement.service';
import { ModeGuidage, Projet, StatutProjet } from '../../models/projet.model';
import { Tache, StatutTache } from '../../models/tache.model';
import { Sprint } from '../../models/sprint.model';
import { Jalon } from '../../models/jalon.model';
import { Objectif } from '../../models/objectif.model';
import { Avancement } from '../../models/avancement.model';
import { Ms2NavbarComponent } from '../../shared/navbar/ms2-navbar.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { take } from 'rxjs/operators'; // ← Ajoute en haut
import { AlerteService } from '../../services/alerte.service';
import { Alerte } from '../../models/alerte.model';


type OngletId = 'infos' | 'taches' | 'sprints' | 'jalons' | 'avancement';

interface OngletDef {
  id: OngletId;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-detail-projet',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Ms2NavbarComponent],
  templateUrl: './detail-projet.component.html',
  styleUrls: ['./detail-projet.component.scss']
})
export class DetailProjetComponent implements OnInit, OnDestroy {

  projetId!: number;
  projet?: Projet;
  taches: Tache[] = [];
  sprints: Sprint[] = [];
  jalons: Jalon[] = [];
  objectifs: Objectif[] = [];
  avancement?: Avancement;

  loading = true;
  error = '';
  ongletActif: OngletId = 'infos';
alertes: Alerte[] = [];

  updatingTacheId: number | null = null;
  updatingJalonId: number | null = null;
  updatingObjectifId: number | null = null;

  statutsProjet = Object.values(StatutProjet);
  statutsTache = Object.values(StatutTache);

  readonly onglets: OngletDef[] = [
    { id: 'infos',      label: 'Infos générales', icon: 'ti-info-circle' },
    { id: 'taches',     label: 'Tâches',          icon: 'ti-checklist' },
    { id: 'sprints',    label: 'Sprints',          icon: 'ti-activity' },
    { id: 'jalons',     label: 'Jalons',           icon: 'ti-flag' },
    { id: 'avancement', label: 'Avancement',       icon: 'ti-chart-bar' },
  ];

  private scrollObserver?: IntersectionObserver;

  constructor(
    private route: ActivatedRoute,
    private projetService: ProjetService,
    private tacheService: TacheService,
    private sprintService: SprintService,
    private jalonService: JalonService,
    private objectifService: ObjectifService,
    private avancementService: AvancementService,
    private alerteService: AlerteService,
      private cdr: ChangeDetectorRef  // ← AJOUTÉ
      

  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'Identifiant de projet manquant.'; this.loading = false; return; }
    this.projetId = +id;
    this.charger();
  }

  ngOnDestroy(): void {
    this.scrollObserver?.disconnect();
  }

  charger(): void {
  this.loading = true;
  this.cdr.detectChanges();
  
  forkJoin({
    projet:    this.projetService.getById(this.projetId).pipe(take(1)),
    taches:    this.tacheService.getByProjet(this.projetId).pipe(take(1), catchError(() => of([]))),
    sprints:   this.sprintService.getByProjet(this.projetId).pipe(take(1), catchError(() => of([]))),
    jalons:    this.jalonService.getByProjet(this.projetId).pipe(take(1), catchError(() => of([]))),
    objectifs: this.objectifService.getByProjet(this.projetId).pipe(take(1), catchError(() => of([]))),
    avancement: this.avancementService.getByProjet(this.projetId).pipe(take(1), catchError(() => of(undefined))),
    
  }).subscribe({
    next: (data) => {
      this.projet = data.projet;
      this.taches = data.taches;
      this.sprints = data.sprints;
      this.jalons = data.jalons;
      this.objectifs = data.objectifs;
      this.avancement = data.avancement;
      this.loading = false;
      this.cdr.detectChanges();  // ← FORCE L'AFFICHAGE
       if (this.projet?.modeGuidage === ModeGuidage.IA) {
        this.genererSuggestionIA();
      }
      this.alerteService.getByProjet(this.projetId)
  .pipe(take(1), catchError(() => of([])))
  .subscribe(data => { this.alertes = data; this.cdr.detectChanges(); });
      setTimeout(() => this.initReveal(), 120);
    },
    error: () => {
      this.error = 'Impossible de charger le projet.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
  
}

  // ── ONGLET ──
  allerOnglet(id: OngletId): void {
    this.ongletActif = id;
    setTimeout(() => this.initReveal(), 80);
  }

  // ── STATUT PROJET ──
changerStatutProjet(statut: string): void {
  if (!this.projet) return;
  this.projetService.update(this.projetId, { ...this.projet, statut: statut as StatutProjet })
    .pipe(take(1))
    .subscribe({
      next: (p) => { 
        this.projet = p;
        this.cdr.detectChanges();
      },
      error: () => alert('Erreur lors du changement de statut.')
    });
}

  // ── STATUT TÂCHE ──
changerStatutTache(tache: Tache, statut: string): void {
  this.updatingTacheId = tache.id!;
  this.tacheService.updateStatut(tache.id!, statut as StatutTache)
    .pipe(take(1))
    .subscribe({
      next: (t) => {
        const idx = this.taches.findIndex(x => x.id === t.id);
        if (idx > -1) this.taches[idx] = t;
        this.recalculerAvancement();
        this.updatingTacheId = null;
      },
      error: () => { alert('Erreur statut tâche.'); this.updatingTacheId = null; }
    });
}


 toggleJalon(jalon: Jalon): void {
  this.updatingJalonId = jalon.id!;
  this.jalonService.updateAtteint(jalon.id!, !jalon.atteint)
    .pipe(take(1))
    .subscribe({
      next: (j) => {
        const idx = this.jalons.findIndex(x => x.id === j.id);
        if (idx > -1) this.jalons[idx] = j;
        this.updatingJalonId = null;
      },
      error: () => { alert('Erreur jalon.'); this.updatingJalonId = null; }
    });
}

toggleObjectif(obj: Objectif): void {
  this.updatingObjectifId = obj.id!;
  this.objectifService.updateAtteint(obj.id!, !obj.atteint)
    .pipe(take(1))
    .subscribe({
      next: (o) => {
        const idx = this.objectifs.findIndex(x => x.id === o.id);
        if (idx > -1) this.objectifs[idx] = o;
        this.updatingObjectifId = null;
      },
      error: () => { alert('Erreur objectif.'); this.updatingObjectifId = null; }
    });
}

private recalculerAvancement(): void {
  this.avancementService.recalculer(this.projetId)
    .pipe(take(1))
    .subscribe({
      next: (a) => { this.avancement = a; }
    });
}


  // ── HELPERS ──
  labelStatut(statut?: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'En attente', EN_COURS: 'En cours', TERMINE: 'Terminé',
      ARCHIVE: 'Archivé', ANNULE: 'Annulé'
    };
    return map[statut ?? ''] ?? statut ?? '';
  }

  labelStatutTache(statut?: string): string {
    const map: Record<string, string> = {
      A_FAIRE: 'À faire', EN_COURS: 'En cours', TERMINE: 'Terminé',
      EN_REVUE: 'En revue', BLOQUE: 'Bloqué'
    };
    return map[statut ?? ''] ?? statut ?? '';
  }

  getBadgeProjet(statut?: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'en-attente', EN_COURS: 'en-cours', TERMINE: 'termine',
      ARCHIVE: 'archive', ANNULE: 'annule'
    };
    return map[statut ?? ''] ?? '';
  }

  getBadgeTache(statut?: string): string {
    const map: Record<string, string> = {
      A_FAIRE: 'a-faire', EN_COURS: 'en-cours', TERMINE: 'termine',
      EN_REVUE: 'en-revue', BLOQUE: 'bloque'
    };
    return map[statut ?? ''] ?? '';
  }

  getBadgePriorite(p?: string): string {
    const map: Record<string, string> = {
      HAUTE: 'prio-haute', MOYENNE: 'prio-moyenne', BASSE: 'prio-basse'
    };
    return map[p ?? ''] ?? '';
  }

  labelPriorite(p?: string): string {
    const map: Record<string, string> = { HAUTE: 'Haute', MOYENNE: 'Moyenne', BASSE: 'Basse' };
    return map[p ?? ''] ?? p ?? '';
  }

  couleurAvancement(pct: number): string {
    if (pct >= 80) return '#00c2d4';
    if (pct >= 50) return '#0a6ebd';
    if (pct >= 25) return '#c47a00';
    return '#dc2626';
  }

  joursLabel(dateFin?: string): string {
    if (!dateFin) return '';
    const diff = Math.ceil((new Date(dateFin).getTime() - Date.now()) / 86400000);
    if (diff < 0) return `${Math.abs(diff)}j de retard`;
    if (diff === 0) return 'Deadline aujourd\'hui';
    return `${diff}j restants`;
  }

  joursClass(dateFin?: string): string {
    if (!dateFin) return '';
    const diff = Math.ceil((new Date(dateFin).getTime() - Date.now()) / 86400000);
    if (diff < 0) return 'danger';
    if (diff <= 7) return 'warning';
    return '';
  }

  tachesParStatut(statut: string): Tache[] {
    return this.taches.filter(t => t.statut === statut);
  }

  sprintStatutLabel(s?: string): string {
    const map: Record<string, string> = { PLANIFIE: 'Planifié', EN_COURS: 'En cours', TERMINE: 'Terminé' };
    return map[s ?? ''] ?? s ?? '';
  }

  sprintBadge(s?: string): string {
    const map: Record<string, string> = { PLANIFIE: 'sprint-planifie', EN_COURS: 'sprint-en-cours', TERMINE: 'sprint-termine' };
    return map[s ?? ''] ?? '';
  }

  get avancementPct(): number {
    return this.avancement?.pourcentage ?? 0;
  }

  get tachesTerminees(): number {
    return this.taches.filter(t => t.statut === 'TERMINE').length;
  }

  get jalonAtteints(): number {
    return this.jalons.filter(j => j.atteint).length;
  }

  get objectifsAtteints(): number {
    return this.objectifs.filter(o => o.atteint).length;
  }

  private initReveal(): void {
    this.scrollObserver?.disconnect();
    this.scrollObserver = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.04 }
    );
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.remove('visible');
      this.scrollObserver!.observe(el);
    });
  }
  iaSuggestion = '';

activerModeIA(): void {
  if (!this.projet) return;
  this.projetService.update(this.projetId, {
    ...this.projet,
    modeGuidage: ModeGuidage.IA
  }).pipe(take(1)).subscribe({
    next: (p) => {
      this.projet = p;
      this.genererSuggestionIA();
      this.cdr.detectChanges();
    }
  });
}

activerModeMoniteur(): void {
  if (!this.projet) return;
  // Pour l'instant moniteurId = 2 (provisoire avant MS1)
  this.projetService.assignerMoniteur(this.projetId, 2)
    .pipe(take(1)).subscribe({
      next: (p) => { this.projet = p; this.cdr.detectChanges(); }
    });
}

desactiverGuidage(): void {
  if (!this.projet) return;
  this.projetService.update(this.projetId, {
    ...this.projet,
    modeGuidage: ModeGuidage.AUCUN
  }).pipe(take(1)).subscribe({
    next: (p) => { this.projet = p; this.cdr.detectChanges(); }
  });
}

genererSuggestionIA(): void {
  const pct = this.avancementPct;
  const retard = this.taches.filter(t =>
    t.deadline && new Date(t.deadline) < new Date() && t.statut !== 'TERMINE'
  ).length;
  const bloque = this.taches.filter(t => t.statut === 'BLOQUE').length;

  if (retard > 0) {
    this.iaSuggestion = `⚠️ ${retard} tâche(s) en retard. Je recommande de prioriser ces tâches immédiatement.`;
  } else if (bloque > 0) {
    this.iaSuggestion = `🔴 ${bloque} tâche(s) bloquée(s). Identifiez les dépendances pour débloquer.`;
  } else if (pct < 20) {
    this.iaSuggestion = `📊 Avancement faible (${pct}%). Vérifiez la charge de l'équipe et les priorités.`;
  } else if (pct >= 80) {
    this.iaSuggestion = `✅ Excellent avancement (${pct}%). Le projet est sur la bonne voie.`;
  } else {
    this.iaSuggestion = `🎯 Avancement normal (${pct}%). Continuez sur ce rythme.`;
  }
}
}