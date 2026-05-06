import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TacheService } from '../../services/tache.service';
import { SessionService } from '../../services/session.service';
import { Tache, StatutTache, SousTache } from '../../models/tache.model';
import { SessionTravail } from '../../models/session.model';
import { Ms2NavbarComponent } from '../../shared/navbar/ms2-navbar.component';
import { take } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-detail-tache',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Ms2NavbarComponent],
  templateUrl: './detail-tache.component.html',
  styleUrls: ['./detail-tache.component.scss']
})
export class DetailTacheComponent implements OnInit {

  tacheId!: number;
  tache?: Tache;
  sousTaches: SousTache[] = [];
  sessions: SessionTravail[] = [];

  loading = true;
  error = '';

  sessionActive?: SessionTravail;
  sessionEnCours = false;
  niveauCharge = 5;
  chronometre = '00:00:00';
  private chronoInterval?: ReturnType<typeof setInterval>;
  private debutSession?: Date;

  readonly USER_ID = 1;

  statutsTache = Object.values(StatutTache);
  updatingSousTache: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private tacheService: TacheService,
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'ID tâche manquant.'; this.loading = false; return; }
    this.tacheId = +id;
    this.charger();
  }

  ngOnDestroy(): void {
    if (this.chronoInterval) clearInterval(this.chronoInterval);
  }

  charger(): void {
    this.loading = true;
    forkJoin({
      tache:     this.tacheService.getById(this.tacheId).pipe(take(1)),
      sousTaches: this.tacheService.getSousTaches(this.tacheId).pipe(
                    take(1), catchError(() => of([]))),
      sessions:  this.sessionService.getByTache(this.tacheId).pipe(
                    take(1), catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        this.tache      = data.tache;
        this.sousTaches = data.sousTaches;
        this.sessions   = data.sessions;
        this.loading    = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error   = 'Impossible de charger la tâche.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── STATUT TÂCHE ──
  changerStatut(statut: string): void {
    this.tacheService.updateStatut(this.tacheId, statut as StatutTache)
      .pipe(take(1)).subscribe({
        next: (t) => { this.tache = t; this.cdr.detectChanges(); },
        error: () => alert('Erreur changement statut.')
      });
  }

  // ── SOUS-TÂCHES ──
  toggleSousTache(st: SousTache): void {
    this.updatingSousTache = st.id!;
    const nouveauStatut = st.statut === StatutTache.TERMINE
      ? StatutTache.A_FAIRE
      : StatutTache.TERMINE;

    this.tacheService.updateStatutSousTache(st.id!, nouveauStatut)
      .pipe(take(1)).subscribe({
        next: (updated) => {
          const idx = this.sousTaches.findIndex(s => s.id === updated.id);
          if (idx > -1) this.sousTaches[idx] = updated;
          this.updatingSousTache = null;
          this.cdr.detectChanges();
        },
        error: () => { alert('Erreur sous-tâche.'); this.updatingSousTache = null; }
      });
  }

  // ── SESSION ──
  demarrerSession(): void {
    this.sessionService.demarrer(this.tacheId, this.USER_ID, this.niveauCharge)
      .pipe(take(1)).subscribe({
        next: (s) => {
          this.sessionActive  = s;
          this.sessionEnCours = true;
          this.debutSession   = new Date();
          this.startChrono();
          this.cdr.detectChanges();
        },
        error: () => alert('Erreur démarrage session.')
      });
  }

  terminerSession(): void {
    if (!this.sessionActive?.id) return;
    this.sessionService.terminer(this.sessionActive.id)
      .pipe(take(1)).subscribe({
        next: (s) => {
          this.sessions.unshift(s);
          this.sessionActive  = undefined;
          this.sessionEnCours = false;
          this.stopChrono();
          this.cdr.detectChanges();
        },
        error: () => alert('Erreur terminaison session.')
      });
  }

  private startChrono(): void {
    this.chronoInterval = setInterval(() => {
      if (!this.debutSession) return;
      const diff = Math.floor((Date.now() - this.debutSession.getTime()) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      this.chronometre =
        `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      this.cdr.detectChanges();
    }, 1000);
  }

  private stopChrono(): void {
    if (this.chronoInterval) { clearInterval(this.chronoInterval); }
    this.chronometre = '00:00:00';
    this.debutSession = undefined;
  }


  labelStatut(s?: string): string {
    const m: Record<string,string> = {
      A_FAIRE:'À faire', EN_COURS:'En cours', TERMINE:'Terminé',
      EN_REVUE:'En revue', BLOQUE:'Bloqué'
    };
    return m[s ?? ''] ?? s ?? '';
  }

  badgePriorite(p?: string): string {
    const m: Record<string,string> = {
      HAUTE:'prio-haute', MOYENNE:'prio-moyenne',
      BASSE:'prio-basse', CRITIQUE:'prio-critique'
    };
    return m[p ?? ''] ?? '';
  }

  labelPriorite(p?: string): string {
    const m: Record<string,string> = {
      HAUTE:'Haute', MOYENNE:'Moyenne', BASSE:'Basse', CRITIQUE:'Critique'
    };
    return m[p ?? ''] ?? p ?? '';
  }

  badgeStatut(s?: string): string {
    const m: Record<string,string> = {
      A_FAIRE:'st-afaire', EN_COURS:'st-encours', TERMINE:'st-termine',
      EN_REVUE:'st-enrevue', BLOQUE:'st-bloque'
    };
    return m[s ?? ''] ?? '';
  }

  joursLabel(d?: string): string {
    if (!d) return '';
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    if (diff < 0) return `${Math.abs(diff)}j de retard`;
    if (diff === 0) return 'Aujourd\'hui';
    return `${diff}j restants`;
  }

  joursClass(d?: string): string {
    if (!d) return '';
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    if (diff < 0) return 'danger';
    if (diff <= 3) return 'warning';
    return '';
  }

  dureeLabel(min?: number): string {
    if (!min) return '0min';
    if (min < 60) return `${min}min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h${m}min` : `${h}h`;
  }

  get sousTachesTerminees(): number {
    return this.sousTaches.filter(s => s.statut === StatutTache.TERMINE).length;
  }

  get niveauChargeLabel(): string {
    if (this.niveauCharge <= 3) return 'Faible';
    if (this.niveauCharge <= 6) return 'Modéré';
    if (this.niveauCharge <= 8) return 'Élevé';
    return 'Critique';
  }

  get niveauChargeColor(): string {
    if (this.niveauCharge <= 3) return '#00c2d4';
    if (this.niveauCharge <= 6) return '#0a6ebd';
    if (this.niveauCharge <= 8) return '#c47a00';
    return '#dc2626';
  }
}