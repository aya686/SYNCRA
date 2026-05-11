import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { TacheService } from '../../services/tache.service';
import { AlerteService } from '../../services/alerte.service';
import { SessionTravail } from '../../models/session.model';
import { Tache } from '../../models/tache.model';
import { Ms2NavbarComponent } from '../../shared/navbar/ms2-navbar.component';
import { take } from 'rxjs/operators';
import { catchError, of } from 'rxjs';

interface SessionCard {
  session: SessionTravail;
  tacheTitre: string;
}

@Component({
  selector: 'app-session-travail',
  imports: [CommonModule, RouterModule, FormsModule, Ms2NavbarComponent],
  templateUrl: './session-travail.component.html',
  styleUrls: ['./session-travail.component.scss']
})
export class SessionTravailComponent implements OnInit, OnDestroy {
  readonly Math = Math;

  readonly USER_ID = 1;

  // Tâche pré-sélectionnée via queryParam
  tachePreselected?: Tache;
  tacheIdParam?: number;

  // Session active
  sessionActive?: SessionTravail;
  sessionEnCours = false;
  niveauCharge = 5;
  chronometre = '00:00:00';
  private chronoInterval?: ReturnType<typeof setInterval>;
  private debutSession?: Date;

  // Historique du jour
  sessionsJour: SessionCard[] = [];
  loadingHistorique = false;

  // Stats du jour
  totalMinutesJour = 0;
  nbSessionsJour   = 0;
  chargeMax        = 0;

  // Alertes récentes
  nbAlertes = 0;

  constructor(
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private tacheService: TacheService,
    private alerteService: AlerteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const tacheId = this.route.snapshot.queryParamMap.get('tacheId');
    if (tacheId) {
      this.tacheIdParam = +tacheId;
      this.chargerTache(this.tacheIdParam);
    }
    this.chargerHistorique();
    this.chargerAlertes();
  }

  ngOnDestroy(): void {
    this.stopChrono();
  }

  chargerTache(id: number): void {
    this.tacheService.getById(id).pipe(take(1)).subscribe({
      next: (t) => { this.tachePreselected = t; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  chargerHistorique(): void {
    this.loadingHistorique = true;
    this.sessionService.getByUtilisateur(this.USER_ID).pipe(
      take(1), catchError(() => of([]))
    ).subscribe({
      next: (sessions) => {
        const aujourd = new Date().toDateString();
        const sessionsDuJour = sessions.filter(s =>
          s.debut && new Date(s.debut).toDateString() === aujourd
        );

        this.sessionsJour = sessionsDuJour.map(s => ({
          session: s,
          tacheTitre: `Tâche #${s.tacheId}`
        }));

        this.totalMinutesJour = sessionsDuJour.reduce((acc, s) => acc + (s.dureeMinutes ?? 0), 0);
        this.nbSessionsJour   = sessionsDuJour.length;
        this.chargeMax        = sessionsDuJour.reduce((max, s) => Math.max(max, s.niveauCharge ?? 0), 0);

        this.loadingHistorique = false;
        this.cdr.detectChanges();
      }
    });
  }

  chargerAlertes(): void {
    this.alerteService.getNonTraitees(this.USER_ID).pipe(
      take(1), catchError(() => of([]))
    ).subscribe({
      next: (a) => { this.nbAlertes = a.length; this.cdr.detectChanges(); }
    });
  }

  // ── SESSION ──
  demarrerSession(): void {
    if (!this.tacheIdParam) return;
    this.sessionService.demarrer(this.tacheIdParam, this.USER_ID, this.niveauCharge)
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
          this.sessionActive  = undefined;
          this.sessionEnCours = false;
          this.stopChrono();
          this.chargerHistorique();
          this.chargerAlertes();
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
    if (this.chronoInterval) clearInterval(this.chronoInterval);
    this.chronometre  = '00:00:00';
    this.debutSession = undefined;
  }

  // ── HELPERS ──
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

  dureeLabel(min?: number): string {
    if (!min) return '0min';
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m}min`;
    return m > 0 ? `${h}h${m}min` : `${h}h`;
  }

  get totalHeuresJour(): string {
    return this.dureeLabel(this.totalMinutesJour);
  }

  chargeColor(n?: number): string {
    if (!n) return '#9ab3cc';
    if (n <= 3) return '#00c2d4';
    if (n <= 6) return '#0a6ebd';
    if (n <= 8) return '#c47a00';
    return '#dc2626';
  }

  chargeLabel(n?: number): string {
    if (!n) return '—';
    if (n <= 3) return 'Faible';
    if (n <= 6) return 'Modéré';
    if (n <= 8) return 'Élevé';
    return 'Critique';
  }
}