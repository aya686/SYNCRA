import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlerteService } from '../../ms2/services/alerte.service';
import { Alerte, AnalyseIA, TypeAlerte } from '../../ms2/models/alerte.model';
import { Ms2NavbarComponent } from '../../ms2/shared/navbar/ms2-navbar.component';
import { take } from 'rxjs/operators';
import { catchError, of } from 'rxjs';

interface AlerteCard {
  alerte: Alerte;
  analyse?: AnalyseIA;
  analyseLoading?: boolean;
  expanded?: boolean;
}

@Component({
  selector: 'app-mes-alertes',
  standalone: true,
  imports: [CommonModule, RouterModule, Ms2NavbarComponent],
  templateUrl: './mes-alertes.component.html',
  styleUrls: ['./mes-alertes.component.scss']
})
export class MesAlertesComponent implements OnInit {

  readonly USER_ID = 1;

  cards: AlerteCard[] = [];
  loading = true;
  error = '';
  filtreActif = 'TOUTES';
  filtres = ['TOUTES', ...Object.values(TypeAlerte)];

  // Alerte bloquante
  alerteBloquante?: Alerte;
  analyseBloquante?: AnalyseIA;
  analyseBloquanteLoading = false;
  modaleVisible = false;

  stats = { total: 0, nonTraitees: 0, critiques: 0 };

  constructor(
    private alerteService: AlerteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.charger();
    this.verifierAlerteBloquante();
  }

  charger(): void {
    this.loading = true;
    this.alerteService.getByUtilisateur(this.USER_ID)
      .pipe(take(1), catchError(() => of([])))
      .subscribe({
        next: (alertes) => {
          this.cards = alertes.map(a => ({ alerte: a }));
          this.calculerStats();
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  verifierAlerteBloquante(): void {
    this.alerteService.getAlerteBloquante(this.USER_ID)
      .pipe(take(1), catchError(() => of(undefined as any)))
      .subscribe({
        next: (alerte) => {
          if (alerte?.id) {
            this.alerteBloquante = alerte;
            this.modaleVisible = true;
            this.lancerAnalyseBloquante(alerte);
            this.cdr.detectChanges();
          }
        }
      });
  }

  lancerAnalyseBloquante(alerte: Alerte): void {
    this.analyseBloquanteLoading = true;
    this.alerteService.analyserIA(alerte.id!)
      .pipe(take(1), catchError(() => of(undefined as any)))
      .subscribe({
        next: (analyse) => {
          this.analyseBloquante = analyse;
          this.analyseBloquanteLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  accepterEtFermer(): void {
    if (this.alerteBloquante?.id) {
      this.alerteService.marquerTraitee(this.alerteBloquante.id)
        .pipe(take(1)).subscribe({
          next: () => {
            this.modaleVisible = false;
            this.alerteBloquante = undefined;
            this.analyseBloquante = undefined;
            this.charger();
            this.cdr.detectChanges();
          }
        });
    } else {
      this.modaleVisible = false;
    }
  }

  analyserAlerte(card: AlerteCard): void {
    if (card.analyse) { card.expanded = !card.expanded; return; }
    card.analyseLoading = true;
    this.alerteService.analyserIA(card.alerte.id!)
      .pipe(take(1), catchError(() => of(undefined as any)))
      .subscribe({
        next: (analyse) => {
          card.analyse = analyse;
          card.analyseLoading = false;
          card.expanded = true;
          this.cdr.detectChanges();
        }
      });
  }

  marquerTraitee(card: AlerteCard): void {
    this.alerteService.marquerTraitee(card.alerte.id!)
      .pipe(take(1)).subscribe({
        next: () => {
          card.alerte.traitee = true;
          this.calculerStats();
          this.cdr.detectChanges();
        }
      });
  }

  supprimerAlerte(card: AlerteCard): void {
    if (!confirm('Supprimer cette alerte ?')) return;
    this.alerteService.delete(card.alerte.id!)
      .pipe(take(1)).subscribe({
        next: () => {
          this.cards = this.cards.filter(c => c.alerte.id !== card.alerte.id);
          this.calculerStats();
          this.cdr.detectChanges();
        }
      });
  }

  filtrer(f: string): void {
    this.filtreActif = f;
  }

  get filteredCards(): AlerteCard[] {
    if (this.filtreActif === 'TOUTES') return this.cards;
    return this.cards.filter(c => c.alerte.type === this.filtreActif);
  }

  private calculerStats(): void {
    this.stats.total      = this.cards.length;
    this.stats.nonTraitees = this.cards.filter(c => !c.alerte.traitee).length;
    this.stats.critiques   = this.cards.filter(c =>
      c.alerte.type === TypeAlerte.BURNOUT ||
      c.alerte.type === TypeAlerte.SURCHARGE
    ).length;
  }

  // ── HELPERS ──
  labelType(t?: string): string {
    const m: Record<string,string> = {
      SURCHARGE:'Surcharge', DEADLINE:'Deadline', BLOCAGE:'Blocage',
      STAGNATION:'Stagnation', RETARD:'Retard', BUDGET:'Budget', BURNOUT:'Burnout'
    };
    return m[t ?? ''] ?? t ?? '';
  }

  iconType(t?: string): string {
    const m: Record<string,string> = {
      SURCHARGE:'ti-bolt', DEADLINE:'ti-calendar-due',
      BLOCAGE:'ti-lock', STAGNATION:'ti-chart-line',
      RETARD:'ti-clock-x', BUDGET:'ti-coin',
      BURNOUT:'ti-flame'
    };
    return m[t ?? ''] ?? 'ti-bell';
  }

  colorType(t?: string): string {
    const m: Record<string,string> = {
      SURCHARGE:'#c47a00', DEADLINE:'#0a6ebd',
      BLOCAGE:'#dc2626', STAGNATION:'#607a96',
      RETARD:'#c47a00', BUDGET:'#7c3aed',
      BURNOUT:'#dc2626'
    };
    return m[t ?? ''] ?? '#607a96';
  }

  bgType(t?: string): string {
    const m: Record<string,string> = {
      SURCHARGE:'rgba(196,122,0,0.08)', DEADLINE:'rgba(10,110,189,0.08)',
      BLOCAGE:'rgba(220,38,38,0.08)', STAGNATION:'rgba(96,122,150,0.08)',
      RETARD:'rgba(196,122,0,0.08)', BUDGET:'rgba(124,58,237,0.08)',
      BURNOUT:'rgba(220,38,38,0.08)'
    };
    return m[t ?? ''] ?? 'rgba(96,122,150,0.08)';
  }

  scoreColor(s?: number): string {
    if (!s) return '#607a96';
    if (s >= 8) return '#dc2626';
    if (s >= 6) return '#c47a00';
    return '#0a6ebd';
  }

  isCritique(t?: string): boolean {
    return t === TypeAlerte.BURNOUT || t === TypeAlerte.SURCHARGE;
  }
}