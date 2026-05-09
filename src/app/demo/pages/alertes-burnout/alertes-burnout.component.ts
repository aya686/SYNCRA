import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface SessionTravail {
  id: number;
  debut: string;
  fin: string;
  chargeScore: number;
  deadlines: number;
  pausesTotales: number;
}

interface AlerteBurnout {
  id: number;
  utilisateurId: number;
  niveauRisque: number;
  typeAlerte: 'CHARGE_ELEVEE' | 'DEADLINE_STRESS' | 'LATENCE_LONGUE' | 'SURCHARGE_CONSECUTIVE' | 'MANQUE_PAUSE';
  dateAlerte: string;
  traitee: boolean;
  sessionTravail?: SessionTravail;
  recommandation?: string;
  sourceDescription?: string;
}

interface NotificationToast {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  icon: string;
  visible: boolean;
}

interface AlerteStats {
  total: number;
  critiques: number;
  nonTraitees: number;
  tauxResolution: number;
  tendance: 'hausse' | 'baisse' | 'stable';
}

@Component({
  selector: 'app-alertes-burnout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './alertes-burnout.component.html',
  styleUrls: ['./alertes-burnout.component.scss']
})
export class AlertesBurnoutComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('particleCanvas') particleCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorGlow') cursorGlowRef!: ElementRef<HTMLDivElement>;

  // ── State ──────────────────────────────────────────────────────────
  loading = true;
  navScrolled = false;
  userId = 1;
  alertes: AlerteBurnout[] = [];
  alertesFiltrees: AlerteBurnout[] = [];
  selectedAlerte: AlerteBurnout | null = null;
  toasts: NotificationToast[] = [];
  toastCounter = 0;

  // Filtres
  filtreNiveau: string = 'tous';
  filtreType: string = 'tous';
  filtreStatut: string = 'tous';
  searchQuery: string = '';
  sortBy: string = 'date_desc';

  // Stats
  stats: AlerteStats = { total: 0, critiques: 0, nonTraitees: 0, tauxResolution: 0, tendance: 'stable' };

  // IA
  aiInsight = '';
  aiInsightLoading = false;
  aiDetailAnalyse = '';
  aiDetailLoading = false;

  // Notification temps réel simulation
  private notifInterval: any;

  // Canvas
  private ctx!: CanvasRenderingContext2D;
  private particles: any[] = [];
  private animId!: number;

  private readonly API = 'http://localhost:8082/api';
  private readonly GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly GROQ_KEY = ''; // ← remplace avec ta clé Groq gratuite
  private readonly GROQ_MODEL = 'llama-3.3-70b-versatile';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAlertes();
    this.startRealtimeNotifications();
  }

  ngAfterViewInit(): void {
    this.initParticles();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
    clearInterval(this.notifInterval);
  }

  @HostListener('window:scroll')
  onScroll(): void { this.navScrolled = window.scrollY > 20; }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (this.cursorGlowRef?.nativeElement) {
      this.cursorGlowRef.nativeElement.style.left = e.clientX + 'px';
      this.cursorGlowRef.nativeElement.style.top = e.clientY + 'px';
    }
  }

  // ── Data ───────────────────────────────────────────────────────────
  loadAlertes(): void {
    this.loading = true;
    this.http.get<AlerteBurnout[]>(`${this.API}/alertes-burnout/utilisateur/${this.userId}`)
      .subscribe({
        next: (data) => {
          this.alertes = data;
          this.computeStats();
          this.applyFilters();
          this.loading = false;
          this.loadAiInsight();
        },
        error: () => {
          this.alertes = this.getDemoAlertes();
          this.computeStats();
          this.applyFilters();
          this.loading = false;
          this.loadAiInsight();
        }
      });
  }

  computeStats(): void {
    const total = this.alertes.length;
    const critiques = this.alertes.filter(a => a.niveauRisque >= 8).length;
    const nonTraitees = this.alertes.filter(a => !a.traitee).length;
    const tauxResolution = total > 0 ? Math.round(((total - nonTraitees) / total) * 100) : 0;
    const tendance = critiques > 3 ? 'hausse' : critiques > 1 ? 'stable' : 'baisse';
    this.stats = { total, critiques, nonTraitees, tauxResolution, tendance };
  }

  applyFilters(): void {
    let result = [...this.alertes];

    if (this.filtreNiveau !== 'tous') {
      const niveau = this.filtreNiveau;
      result = result.filter(a => {
        if (niveau === 'critique') return a.niveauRisque >= 8;
        if (niveau === 'eleve') return a.niveauRisque >= 5 && a.niveauRisque < 8;
        if (niveau === 'modere') return a.niveauRisque < 5;
        return true;
      });
    }

    if (this.filtreType !== 'tous') {
      result = result.filter(a => a.typeAlerte === this.filtreType);
    }

    if (this.filtreStatut !== 'tous') {
      result = result.filter(a => this.filtreStatut === 'traite' ? a.traitee : !a.traitee);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(a =>
        a.typeAlerte.toLowerCase().includes(q) ||
        (a.recommandation || '').toLowerCase().includes(q) ||
        (a.sourceDescription || '').toLowerCase().includes(q)
      );
    }

    // Tri
    result.sort((a, b) => {
      if (this.sortBy === 'date_desc') return new Date(b.dateAlerte).getTime() - new Date(a.dateAlerte).getTime();
      if (this.sortBy === 'date_asc') return new Date(a.dateAlerte).getTime() - new Date(b.dateAlerte).getTime();
      if (this.sortBy === 'risque_desc') return b.niveauRisque - a.niveauRisque;
      if (this.sortBy === 'risque_asc') return a.niveauRisque - b.niveauRisque;
      return 0;
    });

    this.alertesFiltrees = result;
  }

  marquerTraitee(alerte: AlerteBurnout, event: Event): void {
    event.stopPropagation();
    this.http.patch(`${this.API}/alertes-burnout/${alerte.id}/traiter`, {}).subscribe({
      next: () => {},
      error: () => {}
    });
    alerte.traitee = true;
    this.computeStats();
    this.applyFilters();
    this.showToast('Alerte marquée comme traitée', 'success', '✓');
  }

  ouvrirDetail(alerte: AlerteBurnout): void {
    this.selectedAlerte = alerte;
    this.aiDetailAnalyse = '';
    this.loadAiDetailAnalyse(alerte);
  }

  fermerDetail(): void {
    this.selectedAlerte = null;
    this.aiDetailAnalyse = '';
  }

  // ── IA via Groq (gratuit) ──────────────────────────────────────────
  loadAiInsight(): void {
    if (!this.alertes.length) return;
    this.aiInsightLoading = true;

    const critiques = this.alertes.filter(a => a.niveauRisque >= 8).length;
    const nonTraitees = this.alertes.filter(a => !a.traitee).length;
    const typesFrequents = this.getMostFrequentTypes();

    const prompt = `Analyse ces données d'alertes burnout et génère un insight RH concis (2 phrases max, en français, sans titre) :
- Total alertes : ${this.alertes.length}
- Alertes critiques (risque ≥ 8) : ${critiques}
- Alertes non traitées : ${nonTraitees}
- Types les plus fréquents : ${typesFrequents}
- Taux de résolution : ${this.stats.tauxResolution}%
Génère une observation utile sur la situation et une recommandation concrète.`;

    this.callGroq(prompt).then(text => {
      this.aiInsight = text || this.getFallbackInsight();
      this.aiInsightLoading = false;
    }).catch(() => {
      this.aiInsight = this.getFallbackInsight();
      this.aiInsightLoading = false;
    });
  }

  loadAiDetailAnalyse(alerte: AlerteBurnout): void {
    this.aiDetailLoading = true;

    const prompt = `Analyse cette alerte burnout spécifique et donne des conseils personnalisés (3 phrases max, en français, pratiques et bienveillants) :
- Type : ${this.formatTypeAlerte(alerte.typeAlerte)}
- Niveau de risque : ${alerte.niveauRisque}/10
- Date : ${new Date(alerte.dateAlerte).toLocaleDateString('fr-FR')}
- Source : ${alerte.sourceDescription || 'session de travail intense'}
Explique les causes probables et propose 2 actions concrètes à faire aujourd'hui.`;

    this.callGroq(prompt).then(text => {
      this.aiDetailAnalyse = text || 'Analyse non disponible momentanément. Consultez un spécialiste pour un suivi personnalisé.';
      this.aiDetailLoading = false;
    }).catch(() => {
      this.aiDetailAnalyse = 'Analyse non disponible. Vérifiez votre connexion et réessayez.';
      this.aiDetailLoading = false;
    });
  }

  private async callGroq(prompt: string): Promise<string> {
    const response = await fetch(this.GROQ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.GROQ_KEY}`
      },
      body: JSON.stringify({
        model: this.GROQ_MODEL,
        max_tokens: 300,
        messages: [
          { role: 'system', content: 'Tu es un expert RH et psychologue du travail. Réponds toujours en français, de manière concise, pratique et bienveillante.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    const data = await response.json();
    return data?.choices?.[0]?.message?.content || '';
  }

  // ── Notifications temps réel ───────────────────────────────────────
  startRealtimeNotifications(): void {
    // Simule la réception de notifications en temps réel (remplacer par WebSocket en prod)
    setTimeout(() => {
      this.showToast('Nouvelle alerte détectée : Charge de travail élevée', 'warning', '⚡');
    }, 3000);

    this.notifInterval = setInterval(() => {
      // En prod : appel API pour vérifier nouvelles alertes
    }, 30000);
  }

  showToast(message: string, type: NotificationToast['type'], icon: string): void {
    const id = ++this.toastCounter;
    const toast: NotificationToast = { id, message, type, icon, visible: true };
    this.toasts.push(toast);
    setTimeout(() => {
      const t = this.toasts.find(t => t.id === id);
      if (t) t.visible = false;
      setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 400);
    }, 4000);
  }

  dismissToast(id: number): void {
    const t = this.toasts.find(t => t.id === id);
    if (t) { t.visible = false; setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 400); }
  }

  // ── Helpers ────────────────────────────────────────────────────────
  getNiveauLabel(niveau: number): string {
    if (niveau >= 8) return 'Critique';
    if (niveau >= 5) return 'Élevé';
    return 'Modéré';
  }

  getNiveauClass(niveau: number): string {
    if (niveau >= 8) return 'niveau-critique';
    if (niveau >= 5) return 'niveau-eleve';
    return 'niveau-modere';
  }

  getNiveauBarColor(niveau: number): string {
    if (niveau >= 8) return 'var(--syncra-red)';
    if (niveau >= 5) return 'var(--syncra-orange)';
    return 'var(--syncra-green)';
  }

  formatTypeAlerte(type: string): string {
    const map: Record<string, string> = {
      'CHARGE_ELEVEE': 'Charge élevée',
      'DEADLINE_STRESS': 'Stress deadline',
      'LATENCE_LONGUE': 'Session prolongée',
      'SURCHARGE_CONSECUTIVE': 'Surcharge consécutive',
      'MANQUE_PAUSE': 'Manque de pauses'
    };
    return map[type] || type;
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      'CHARGE_ELEVEE': '🔥',
      'DEADLINE_STRESS': '⏰',
      'LATENCE_LONGUE': '⏳',
      'SURCHARGE_CONSECUTIVE': '📈',
      'MANQUE_PAUSE': '☕'
    };
    return map[type] || '⚠️';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatHeure(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  getRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (hours < 1) return 'il y a moins d\'1h';
    if (hours < 24) return `il y a ${hours}h`;
    if (days === 1) return 'hier';
    return `il y a ${days} jours`;
  }

  private getMostFrequentTypes(): string {
    const counts: Record<string, number> = {};
    this.alertes.forEach(a => counts[a.typeAlerte] = (counts[a.typeAlerte] || 0) + 1);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type]) => this.formatTypeAlerte(type))
      .join(', ');
  }

  private getFallbackInsight(): string {
    const { critiques, nonTraitees, tauxResolution } = this.stats;
    if (critiques > 2) return `Vous avez ${critiques} alertes critiques — une attention immédiate est recommandée. Planifiez une séance avec votre spécialiste cette semaine.`;
    if (nonTraitees > 3) return `${nonTraitees} alertes restent non traitées. Prenez 10 minutes pour les examiner et marquer les plus anciennes comme résolues.`;
    return `Votre taux de résolution est de ${tauxResolution}% — bonne gestion de vos alertes. Continuez à surveiller votre charge de travail quotidienne.`;
  }

  // ── Demo Data ──────────────────────────────────────────────────────
  private getDemoAlertes(): AlerteBurnout[] {
    return [
      { id: 1, utilisateurId: 1, niveauRisque: 9, typeAlerte: 'SURCHARGE_CONSECUTIVE', dateAlerte: '2025-04-18T09:15:00', traitee: false,
        sourceDescription: '6 heures de travail consécutif sans pause détectées',
        recommandation: 'Prendre une pause de 30 minutes et planifier une consultation.',
        sessionTravail: { id: 1, debut: '2025-04-18T08:00:00', fin: '2025-04-18T14:00:00', chargeScore: 9, deadlines: 3, pausesTotales: 0 } },
      { id: 2, utilisateurId: 1, niveauRisque: 7, typeAlerte: 'DEADLINE_STRESS', dateAlerte: '2025-04-17T16:30:00', traitee: false,
        sourceDescription: '3 deadlines critiques dans la même journée',
        recommandation: 'Prioriser les tâches et déléguer si possible.',
        sessionTravail: { id: 2, debut: '2025-04-17T08:00:00', fin: '2025-04-17T19:00:00', chargeScore: 7, deadlines: 3, pausesTotales: 1 } },
      { id: 3, utilisateurId: 1, niveauRisque: 8, typeAlerte: 'CHARGE_ELEVEE', dateAlerte: '2025-04-15T11:00:00', traitee: true,
        sourceDescription: 'Score de charge de travail : 8.5/10',
        recommandation: 'Exercice de respiration recommandé.',
        sessionTravail: { id: 3, debut: '2025-04-15T07:30:00', fin: '2025-04-15T17:00:00', chargeScore: 8, deadlines: 2, pausesTotales: 1 } },
      { id: 4, utilisateurId: 1, niveauRisque: 4, typeAlerte: 'MANQUE_PAUSE', dateAlerte: '2025-04-12T14:20:00', traitee: true,
        sourceDescription: 'Aucune pause enregistrée depuis 4h',
        recommandation: 'Pause de 15 min recommandée toutes les 2 heures.' },
      { id: 5, utilisateurId: 1, niveauRisque: 6, typeAlerte: 'LATENCE_LONGUE', dateAlerte: '2025-04-10T17:45:00', traitee: true,
        sourceDescription: 'Session de travail de 9h30 détectée',
        recommandation: 'Limiter les sessions à 8h maximum.' },
    ];
  }

  // ── Particle Canvas ────────────────────────────────────────────────
  private initParticles(): void {
    const canvas = this.particleCanvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1, opacity: Math.random() * 0.4 + 0.1
      });
    }
    this.animateParticles();
  }

  private animateParticles(): void {
    const canvas = this.particleCanvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(37, 99, 235, ${p.opacity})`;
      this.ctx.fill();
    }
    this.animId = requestAnimationFrame(() => this.animateParticles());
  }
}