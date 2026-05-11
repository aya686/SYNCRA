import {
  Component, OnInit, OnDestroy, signal,
  HostListener, ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// ── INTERFACES ────────────────────────────────────────────
interface AlerteBurnout {
  id: number;
  utilisateurId: number;
  niveauRisque: string;
  declencheur: string;
  date: string;
  traitee: boolean;
  source: string;
}

interface Consultation {
  id: number;
  date: string;
  heure: string;
  motif: string;
  medecin?: {
    nom: string;
    prenom: string;
    specialite: string;
  };
}

interface ProgrammePrevention {
  id: number;
  nom: string;
  objectif: string;
  dureesemaines: number;
  progression: number;
  actif: boolean;
}

interface WeeklyLoad {
  day: string;
  hours: number;
  load: number;
}

@Component({
  selector: 'app-dashboard-bienetre',
  imports: [RouterModule, CommonModule, DatePipe, DecimalPipe, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardBienetreComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorGlow')     cursorGlowRef!: ElementRef<HTMLDivElement>;

  // ── USER ─────────────────────────────────────────────────
  userName     = 'Utilisateur';
  userInitials = 'US';
  userId       = 1; // À remplacer par l'auth service

  // ── NAV ──────────────────────────────────────────────────
  navScrolled    = false;
  mobileMenuOpen = false;
  hasUnreadAlerts = false;

  // ── DATE ─────────────────────────────────────────────────
  todayDay  = '';
  todayFull = '';

  // ── BURNOUT ──────────────────────────────────────────────
  burnoutScore = 0;
  riskLevel    = '—';
  activeAlerts = 0;
  lastAlert: AlerteBurnout | null = null;
  recentAlerts: AlerteBurnout[] = [];

  // ── SEANCES ──────────────────────────────────────────────
  nextSeance: Consultation | null = null;
  nextSeanceDate: string | null = null;

  // ── PROGRAMME ────────────────────────────────────────────
  activeProgramme: ProgrammePrevention | null = null;

  // ── WORKLOAD (simulé MS2) ─────────────────────────────────
  weeklyLoad: WeeklyLoad[] = [
    { day: 'Lun', hours: 8, load: 8 },
    { day: 'Mar', hours: 10, load: 10 },
    { day: 'Mer', hours: 7, load: 7 },
    { day: 'Jeu', hours: 11, load: 11 },
    { day: 'Ven', hours: 6, load: 6 },
    { day: 'Sam', hours: 2, load: 2 },
    { day: 'Dim', hours: 0, load: 0 },
  ];

  get totalHours(): number { return this.weeklyLoad.reduce((s, d) => s + d.hours, 0); }
  get avgHours(): string { return (this.totalHours / 5).toFixed(1); }
  get peakHours(): number { return Math.max(...this.weeklyLoad.map(d => d.hours)); }

  // ── AI RECO ──────────────────────────────────────────────
  aiRecommendation = '';
  recoTags: string[] = [];
  loadingReco = false;

  // ── NOTIF ────────────────────────────────────────────────
  showNotif  = false;
  notifIcon  = '💡';
  notifTitle = '';
  notifSub   = '';

  // ── PRIVATE ──────────────────────────────────────────────
  private animationFrameId: number | null = null;
  private scrollObserver: IntersectionObserver | null = null;
  private readonly API = 'http://localhost:8082/api';

  // ── Anthropic API key (configurée via environment) ────────
  // Dans un vrai projet: environment.anthropicApiKey
  private readonly ANTHROPIC_KEY = ''; // Remplir dans environment.ts

  constructor(private http: HttpClient) {}

  // ── LIFECYCLE ─────────────────────────────────────────────
  ngOnInit(): void {
    this.initDate();
    this.loadDashboardData();
    this.initScrollAnimations();
  }

  ngAfterViewInit(): void {
    this.initParticleCanvas();
    this.initCursorGlow();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.scrollObserver) this.scrollObserver.disconnect();
  }

  // ── SCROLL ───────────────────────────────────────────────
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.navScrolled = window.scrollY > 40;
  }

  // ── DATE INIT ─────────────────────────────────────────────
  private initDate(): void {
    const now = new Date();
    this.todayDay  = now.getDate().toString().padStart(2, '0');
    this.todayFull = now.toLocaleDateString('fr-FR', {
      weekday: 'long', month: 'long', year: 'numeric'
    });
  }

  // ── LOAD DATA ─────────────────────────────────────────────
  private loadDashboardData(): void {
    forkJoin({
      alertes:    this.http.get<AlerteBurnout[]>(`${this.API}/alertes-burnout/utilisateur/${this.userId}`).pipe(catchError(() => of([]))),
      dossier:    this.http.get<any>(`${this.API}/dossier-sante/utilisateur/${this.userId}`).pipe(catchError(() => of(null))),
      programme:  this.http.get<ProgrammePrevention[]>(`${this.API}/programmes-prevention/utilisateur/${this.userId}`).pipe(catchError(() => of([]))),
    }).subscribe(({ alertes, dossier, programme }) => {

      // -- Alertes
      const alertesList = alertes as AlerteBurnout[];
      const sorted = [...alertesList].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      this.recentAlerts = sorted.slice(0, 5);
      this.lastAlert    = sorted[0] ?? null;
      this.activeAlerts = alertesList.filter(a => !a.traitee).length;
      this.hasUnreadAlerts = this.activeAlerts > 0;
      this.burnoutScore = this.computeBurnoutScore(alertesList);
      this.riskLevel    = this.computeRiskLevel(this.burnoutScore);

      // -- Programme actif
      const programmes = programme as ProgrammePrevention[];
      this.activeProgramme = programmes.find(p => p.actif) ?? null;

      // -- Prochaine consultation (via dossier)
      if (dossier?.consultations?.length) {
        const future = dossier.consultations.filter((c: Consultation) =>
          new Date(c.date) >= new Date()
        ).sort((a: Consultation, b: Consultation) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        this.nextSeance = future[0] ?? null;
        this.nextSeanceDate = this.nextSeance
          ? new Date(this.nextSeance.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
          : null;
      }

      // -- Générer recommandation IA au chargement
      this.generateRecommendation();

      // -- Notification de bienvenue
      setTimeout(() => this.showWelcomeNotif(), 1200);
    });
  }

  // ── BURNOUT SCORE ─────────────────────────────────────────
  private computeBurnoutScore(alertes: AlerteBurnout[]): number {
    if (!alertes.length) return 1;
    const recent = alertes.slice(-7); // 7 dernières alertes
    const scores: Record<string, number> = {
      'FAIBLE': 2, 'MODÉRÉ': 5, 'MODERE': 5, 'ÉLEVÉ': 7, 'ELEVE': 7, 'CRITIQUE': 9
    };
    const total = recent.reduce((sum, a) =>
      sum + (scores[a.niveauRisque?.toUpperCase()] ?? 3), 0
    );
    return Math.min(10, Math.round(total / recent.length));
  }

  // ── RISK LEVEL ────────────────────────────────────────────
  private computeRiskLevel(score: number): string {
    if (score <= 3) return 'Faible';
    if (score <= 6) return 'Modéré';
    return 'Critique';
  }

  getRiskClass(): string {
    if (this.burnoutScore <= 3) return 'risk-low';
    if (this.burnoutScore <= 6) return 'risk-medium';
    return 'risk-high';
  }

  getRiskBadgeClass(): string {
    if (this.burnoutScore <= 3) return 'green';
    if (this.burnoutScore <= 6) return 'orange';
    return 'red';
  }

  getAlertBadge(niveau: string): string {
    const n = niveau?.toUpperCase() ?? '';
    if (n.includes('FAIBLE'))   return 'green';
    if (n.includes('MODR') || n.includes('MODÉRÉ')) return 'orange';
    return 'red';
  }

  getBarClass(load: number): string {
    if (load >= 9)  return 'high';
    if (load >= 7)  return 'medium';
    return 'low';
  }

  getCompletedWeeks(): number {
    if (!this.activeProgramme) return 0;
    return Math.floor(
      (this.activeProgramme.progression / 100) * this.activeProgramme.dureesemaines
    );
  }

  // ── GAUGE MATH ────────────────────────────────────────────
  getGaugeColor(): string {
    if (this.burnoutScore <= 3) return '#16a34a';
    if (this.burnoutScore <= 6) return '#d97706';
    return '#dc2626';
  }

  getGaugeDash(): string {
    // Arc total ≈ 251 (semi-circle path length)
    const total = 251;
    const filled = (this.burnoutScore / 10) * total;
    return `${filled} ${total}`;
  }

  getNeedleX(): number {
    const angle = -180 + (this.burnoutScore / 10) * 180;
    const rad = angle * (Math.PI / 180);
    return 100 + 70 * Math.cos(rad);
  }

  getNeedleY(): number {
    const angle = -180 + (this.burnoutScore / 10) * 180;
    const rad = angle * (Math.PI / 180);
    return 100 + 70 * Math.sin(rad);
  }

  // ── AI RECOMMENDATION via Claude API ─────────────────────
  async generateRecommendation(): Promise<void> {
    this.loadingReco = true;
    this.aiRecommendation = '';
    this.recoTags = [];

    // Contexte pour l'IA
    const context = {
      burnoutScore: this.burnoutScore,
      riskLevel: this.riskLevel,
      totalHoursWeek: this.totalHours,
      avgHoursDay: this.avgHours,
      peakHours: this.peakHours,
      hasActiveProgramme: !!this.activeProgramme,
      lastAlertType: this.lastAlert?.declencheur ?? 'aucune'
    };

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Tu es un conseiller en bien-être au travail. 
Voici la situation d'un employé aujourd'hui :
- Score de risque burnout: ${context.burnoutScore}/10 (${context.riskLevel})
- Heures de travail cette semaine: ${context.totalHoursWeek}h (moy: ${context.avgHoursDay}h/j, pic: ${context.peakHours}h)
- Programme bien-être actif: ${context.hasActiveProgramme ? 'Oui' : 'Non'}
- Dernier déclencheur d'alerte: ${context.lastAlertType}

Génère UNE recommandation personnalisée, bienveillante, pratique et concrète pour aujourd'hui.
Réponds UNIQUEMENT en JSON avec ce format exact (sans backticks, sans markdown):
{
  "recommandation": "texte de la recommandation (2-3 phrases max, bienveillant et actionnable)",
  "tags": ["tag1", "tag2", "tag3"]
}
Les tags doivent être courts (1-2 mots) et correspondre au thème de la recommandation.`
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.[0]?.text ?? '{}';

      try {
        const parsed = JSON.parse(text.trim());
        this.aiRecommendation = parsed.recommandation ?? 'Prenez une pause de 10 minutes, respirez profondément et hydratez-vous. Votre bien-être est notre priorité.';
        this.recoTags = parsed.tags ?? ['Bien-être', 'Équilibre'];
      } catch {
        this.aiRecommendation = 'Prenez le temps de faire une pause active : 5 minutes de marche peuvent réduire significativement le stress. Votre productivité s\'en trouvera améliorée.';
        this.recoTags = ['Pause active', 'Gestion stress'];
      }

    } catch (error) {
      // Fallback si l'API n'est pas disponible
      this.setFallbackRecommendation();
    }

    this.loadingReco = false;
  }

  private setFallbackRecommendation(): void {
    const fallbacks = [
      {
        text: 'Commencez par 5 minutes de respiration abdominale profonde. Cette technique simple réduit le cortisol et améliore la concentration durablement.',
        tags: ['Respiration', 'Concentration', 'Anti-stress']
      },
      {
        text: 'Planifiez 3 micro-pauses de 5 minutes dans votre journée. Levez-vous, étirez-vous et hydratez-vous. Votre cerveau vous remerciera.',
        tags: ['Micro-pauses', 'Mouvement', 'Hydratation']
      },
      {
        text: 'Priorisez une tâche importante et ignorez le reste pendant 90 minutes. La focalisation intentionnelle est votre meilleur allié contre la surcharge.',
        tags: ['Focus', 'Priorisation', 'Productivité']
      }
    ];
    const pick = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    this.aiRecommendation = pick.text;
    this.recoTags = pick.tags;
  }

  // ── WELCOME NOTIF ─────────────────────────────────────────
  private showWelcomeNotif(): void {
    if (this.activeAlerts > 0) {
      this.notifIcon  = '⚡';
      this.notifTitle = `${this.activeAlerts} alerte(s) non traitée(s)`;
      this.notifSub   = 'Consultez vos alertes burnout';
    } else {
      this.notifIcon  = '✅';
      this.notifTitle = 'Bien-être sous contrôle';
      this.notifSub   = 'Aucune alerte critique aujourd\'hui';
    }
    this.showNotif = true;
    setTimeout(() => this.showNotif = false, 4000);
  }

  // ── PARTICLE CANVAS ───────────────────────────────────────
  private initParticleCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle { x: number; y: number; vx: number; vy: number; r: number; }
    const N = 45;
    const particles: Particle[] = Array.from({ length: N }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.5 + 0.6,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(233,30,140,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(10,110,189,0.25)';
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }
      this.animationFrameId = requestAnimationFrame(draw);
    };
    draw();
  }

  // ── CURSOR GLOW ───────────────────────────────────────────
  private initCursorGlow(): void {
    const glow = this.cursorGlowRef?.nativeElement;
    if (!glow) return;
    document.addEventListener('mousemove', (e: MouseEvent) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });
  }

  // ── SCROLL REVEAL ─────────────────────────────────────────
  private initScrollAnimations(): void {
    this.scrollObserver = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        this.scrollObserver!.observe(el);
      });
    }, 120);
  }
}