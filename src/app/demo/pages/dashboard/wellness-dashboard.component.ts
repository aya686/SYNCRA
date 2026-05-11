import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from 'src/app/theme/shared/shared.module';

interface StatCard {
  icon: string;
  iconColor: string;
  bgColor: string;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
}

interface UserRisque {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  niveauRisque: number;
  derniereAlerte: string;
  seancePlanifiee: boolean;
}

interface AlerteSemaine {
  jour: string;
  count: number;
}

interface PrevisionAdmin {
  tendanceGlobale: 'hausse' | 'baisse' | 'stable';
  utilisateursARisque: number;
  recommandationRH: string;
  prioriteAction: string;
  scoreGlobalBienEtre: number;
}

@Component({
  selector: 'app-wellness-dashboard',
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './wellness-dashboard.component.html',
  styleUrls: ['./wellness-dashboard.component.scss']
})
export class WellnessDashboardComponent implements OnInit {

  // ── Stats ──────────────────────────────────────────────────────────
  statCards: StatCard[] = [];
  usersRisqueCritique: UserRisque[] = [];
  alertesParSemaine: AlerteSemaine[] = [];
  previsionIA: PrevisionAdmin | null = null;
  previsionLoading = false;
  loading = true;

  // Données agrégées
  totalAlertes = 0;
  alertesCritiques = 0;
  seancesSemaine = 0;
  tauxCompletionProgrammes = 0;
  totalUtilisateurs = 0;

  private readonly API = 'http://localhost:8082/api';
  private readonly GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly GROQ_KEY = '';
  private readonly GROQ_MODEL = 'llama-3.3-70b-versatile';

  maxAlertesVal = 1;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialise avec demo data immédiatement pour éviter NG0100
    this.applyStats(this.getDemoStats());
    this.usersRisqueCritique = this.getDemoUsersRisque();
    this.loading = false;
    this.cdr.detectChanges();

    // Puis tente le vrai backend
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.http.get<any>(`${this.API}/admin/wellness-stats`).subscribe({
      next: (data) => {
        this.applyStats(data);
        this.cdr.detectChanges();
        this.loadPrevisionIA();
      },
      error: () => {
        // Déjà chargé en demo, on lance juste l'IA
        this.loadPrevisionIA();
      }
    });

    this.http.get<UserRisque[]>(`${this.API}/admin/users-risque-critique`).subscribe({
      next: (d) => {
        this.usersRisqueCritique = d;
        this.cdr.detectChanges();
      },
      error: () => {
        // Déjà chargé en demo
      }
    });
  }

  applyStats(data: any): void {
    this.totalAlertes = data.totalAlertes || 0;
    this.alertesCritiques = data.alertesCritiques || 0;
    this.seancesSemaine = data.seancesSemaine || 0;
    this.tauxCompletionProgrammes = data.tauxCompletionProgrammes || 0;
    this.totalUtilisateurs = data.totalUtilisateurs || 0;
    this.alertesParSemaine = data.alertesParSemaine || this.getDemoAlertesSemaine();
    this.maxAlertesVal = Math.max(...this.alertesParSemaine.map((a: AlerteSemaine) => a.count), 1);
    this.buildStatCards();
  }

  buildStatCards(): void {
    this.statCards = [
      { icon: 'ti ti-bell-ringing', iconColor: 'text-danger', bgColor: 'bg-light-danger', label: 'Alertes totales', value: this.totalAlertes, trend: 12, trendLabel: 'vs semaine dernière' },
      { icon: 'ti ti-alert-triangle', iconColor: 'text-warning', bgColor: 'bg-light-warning', label: 'Alertes critiques', value: this.alertesCritiques, trend: -5, trendLabel: 'vs semaine dernière' },
      { icon: 'ti ti-calendar-check', iconColor: 'text-success', bgColor: 'bg-light-success', label: 'Séances cette semaine', value: this.seancesSemaine, trend: 8, trendLabel: 'vs semaine dernière' },
      { icon: 'ti ti-trophy', iconColor: 'text-primary', bgColor: 'bg-light-primary', label: 'Complétion programmes', value: this.tauxCompletionProgrammes + '%', trend: 3, trendLabel: 'vs mois dernier' }
    ];
  }

  // ── IA PRÉVISION ADMIN ─────────────────────────────────────────────
  loadPrevisionIA(): void {
    this.previsionLoading = true;
    this.cdr.detectChanges();

    const prompt = `Tu es un expert RH et psychologue du travail analysant des données agrégées d'une plateforme bien-être.
Génère une prévision JSON UNIQUEMENT (sans texte autour, sans backticks) :

Données plateforme :
- Total alertes burnout : ${this.totalAlertes}
- Alertes critiques : ${this.alertesCritiques}
- Utilisateurs en risque critique : ${this.usersRisqueCritique.length}
- Séances cette semaine : ${this.seancesSemaine}
- Taux complétion programmes : ${this.tauxCompletionProgrammes}%
- Total utilisateurs : ${this.totalUtilisateurs}

Réponds UNIQUEMENT avec ce JSON :
{
  "tendanceGlobale": "<hausse|baisse|stable>",
  "utilisateursARisque": <nombre>,
  "recommandationRH": "<recommandation concrète pour l'équipe RH, 2 phrases max en français>",
  "prioriteAction": "<action prioritaire à faire cette semaine, 1 phrase en français>",
  "scoreGlobalBienEtre": <score 0-100>
}`;

    fetch(this.GROQ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.GROQ_KEY}`
      },
      body: JSON.stringify({
        model: this.GROQ_MODEL,
        max_tokens: 400,
        messages: [
          { role: 'system', content: 'Expert RH. Réponds UNIQUEMENT en JSON valide.' },
          { role: 'user', content: prompt }
        ]
      })
    })
    .then(r => r.json())
    .then(data => {
      try {
        const text = data?.choices?.[0]?.message?.content || '';
        this.previsionIA = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch {
        this.previsionIA = this.getFallbackPrevision();
      }
      this.previsionLoading = false;
      this.cdr.detectChanges();
    })
    .catch(() => {
      this.previsionIA = this.getFallbackPrevision();
      this.previsionLoading = false;
      this.cdr.detectChanges();
    });
  }

  refreshIA(): void {
    this.previsionIA = null;
    this.loadPrevisionIA();
  }

  // ── HELPERS ───────────────────────────────────────────────────────
  getRisqueClass(niveau: number): string {
    if (niveau >= 8) return 'badge bg-light-danger text-danger';
    if (niveau >= 5) return 'badge bg-light-warning text-warning';
    return 'badge bg-light-success text-success';
  }

  getRisqueLabel(niveau: number): string {
    if (niveau >= 8) return 'Critique';
    if (niveau >= 5) return 'Élevé';
    return 'Modéré';
  }

  getRisqueBarColor(niveau: number): string {
    if (niveau >= 8) return '#ef4444';
    if (niveau >= 5) return '#f59e0b';
    return '#10b981';
  }

  getInitiales(u: UserRisque): string {
    return `${u.prenom?.[0] || ''}${u.nom?.[0] || ''}`.toUpperCase();
  }

  getInitialesBg(u: UserRisque): string {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9'];
    const idx = (u.id || 0) % colors.length;
    return colors[idx];
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  getBarHeight(count: number): number {
    return Math.round((count / this.maxAlertesVal) * 100);
  }

  getBarColor(count: number): string {
    const pct = count / this.maxAlertesVal;
    if (pct >= 0.8) return '#ef4444';
    if (pct >= 0.5) return '#f59e0b';
    return '#6366f1';
  }

  getTendanceIcon(t: string): string {
    return t === 'hausse' ? 'ti ti-trending-up' : t === 'baisse' ? 'ti ti-trending-down' : 'ti ti-minus';
  }

  getTendanceColor(t: string): string {
    return t === 'hausse' ? 'text-danger' : t === 'baisse' ? 'text-success' : 'text-warning';
  }

  getTendanceBg(t: string): string {
    return t === 'hausse' ? 'bg-light-danger' : t === 'baisse' ? 'bg-light-success' : 'bg-light-warning';
  }

  getTendanceLabel(t: string): string {
    return t === 'hausse' ? 'En hausse' : t === 'baisse' ? 'En baisse' : 'Stable';
  }

  getScoreColor(s: number): string {
    return s >= 70 ? 'text-success' : s >= 40 ? 'text-warning' : 'text-danger';
  }

  getScoreBg(s: number): string {
    return s >= 70 ? 'bg-success' : s >= 40 ? 'bg-warning' : 'bg-danger';
  }

  getScoreHex(s: number): string {
    return s >= 70 ? '#10b981' : s >= 40 ? '#f59e0b' : '#ef4444';
  }

  getScoreLabel(s: number): string {
    return s >= 70 ? 'Bon' : s >= 40 ? 'Modéré' : 'Critique';
  }

  getSansSeance(): number {
    return this.usersRisqueCritique.filter(u => !u.seancePlanifiee).length;
  }

  clamp(val: number, max = 100): number {
    return Math.min(Math.max(val, 0), max);
  }

  getCouverturePct(): number {
    return this.totalUtilisateurs > 0
      ? Math.round((this.seancesSemaine / this.totalUtilisateurs) * 100)
      : 0;
  }

  getScoreDasharray(s: number): string {
    const pct = s / 100;
    const circumference = 2 * Math.PI * 42;
    return `${pct * circumference} ${circumference}`;
  }

  // ── DEMO DATA ──────────────────────────────────────────────────────
  private getDemoStats() {
    return {
      totalAlertes: 47,
      alertesCritiques: 8,
      seancesSemaine: 14,
      tauxCompletionProgrammes: 68,
      totalUtilisateurs: 120,
      alertesParSemaine: this.getDemoAlertesSemaine()
    };
  }

  private getDemoAlertesSemaine(): AlerteSemaine[] {
    return [
      { jour: 'Lun', count: 5 },
      { jour: 'Mar', count: 9 },
      { jour: 'Mer', count: 7 },
      { jour: 'Jeu', count: 12 },
      { jour: 'Ven', count: 8 },
      { jour: 'Sam', count: 3 },
      { jour: 'Dim', count: 3 }
    ];
  }

  private getDemoUsersRisque(): UserRisque[] {
    return [
      { id: 1, nom: 'Benali',   prenom: 'Ahmed',   email: 'ahmed.benali@company.tn',   niveauRisque: 9, derniereAlerte: '2025-04-24', seancePlanifiee: false },
      { id: 2, nom: 'Gharbi',   prenom: 'Sonia',   email: 'sonia.gharbi@company.tn',   niveauRisque: 8, derniereAlerte: '2025-04-23', seancePlanifiee: true  },
      { id: 3, nom: 'Trabelsi', prenom: 'Karim',   email: 'karim.trabelsi@company.tn', niveauRisque: 8, derniereAlerte: '2025-04-22', seancePlanifiee: false },
      { id: 4, nom: 'Mrad',     prenom: 'Lina',    email: 'lina.mrad@company.tn',      niveauRisque: 7, derniereAlerte: '2025-04-21', seancePlanifiee: true  },
      { id: 5, nom: 'Jrad',     prenom: 'Mohamed', email: 'mohamed.jrad@company.tn',   niveauRisque: 7, derniereAlerte: '2025-04-20', seancePlanifiee: false },
    ];
  }

  private getFallbackPrevision(): PrevisionAdmin {
    return {
      tendanceGlobale: this.alertesCritiques > 5 ? 'hausse' : 'stable',
      utilisateursARisque: this.usersRisqueCritique.length,
      recommandationRH: `${this.alertesCritiques} employés présentent un risque critique — une intervention RH immédiate est recommandée. Organisez des séances de groupe cette semaine.`,
      prioriteAction: `Contacter les ${this.usersRisqueCritique.filter(u => !u.seancePlanifiee).length} employés sans séance planifiée dès aujourd'hui.`,
      scoreGlobalBienEtre: Math.max(20, Math.round(100 - (this.alertesCritiques * 8) - (this.totalAlertes * 0.5)))
    };
  }
}