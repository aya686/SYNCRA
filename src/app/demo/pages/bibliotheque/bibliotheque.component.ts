import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, SlicePipe, DecimalPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface RessourceBienetre {
  ressourceId: number; titre: string; type: string; description: string;
  url?: string; gratuit: boolean; niveau: string; ajouteProgramme?: boolean;
  dureeEstimee?: number; vues?: number;
}
interface NotifToast { id: number; message: string; type: 'success' | 'warning' | 'danger'; visible: boolean; }

@Component({
  selector: 'app-bibliotheque',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SlicePipe, DecimalPipe],
  templateUrl: './bibliotheque.component.html',
  styleUrls: ['./bibliotheque.component.scss']
})
export class BibliothequeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('particleCanvas') particleCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorGlow') cursorGlowRef!: ElementRef<HTMLDivElement>;

  loading = true; navScrolled = false; userId = 1;
  ressources: RessourceBienetre[] = [];
  ressourcesFiltrees: RessourceBienetre[] = [];

  searchQuery = '';
  filtreType = 'tous'; filtreNiveau = 'tous'; filtreAcces = 'tous'; sortBy = 'recent';

  toasts: NotifToast[] = []; toastCounter = 0;
  private animId!: number; private particles: any[] = []; private ctx!: CanvasRenderingContext2D;
  private readonly API = 'http://localhost:8082/api';

  get totalRessources() { return this.ressources.length; }

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void { this.loadRessources(); }
  ngAfterViewInit(): void { this.initParticles(); }
  ngOnDestroy(): void { cancelAnimationFrame(this.animId); }

  @HostListener('window:scroll') onScroll(): void { this.navScrolled = window.scrollY > 20; }
  @HostListener('mousemove', ['$event']) onMouseMove(e: MouseEvent): void {
    if (this.cursorGlowRef?.nativeElement) {
      this.cursorGlowRef.nativeElement.style.left = e.clientX + 'px';
      this.cursorGlowRef.nativeElement.style.top = e.clientY + 'px';
    }
  }

  loadRessources(): void {
    this.http.get<RessourceBienetre[]>(`${this.API}/ressources-bienetre`)
      .subscribe({
        next: (d) => { this.ressources = d; this.applyFilters(); this.loading = false; },
        error: () => { this.ressources = this.getDemoRessources(); this.applyFilters(); this.loading = false; }
      });
  }

  setType(type: string): void { this.filtreType = type; this.applyFilters(); }

  applyFilters(): void {
    let r = [...this.ressources];
    if (this.searchQuery.trim()) r = r.filter(x => (x.titre + x.description).toLowerCase().includes(this.searchQuery.toLowerCase()));
    if (this.filtreType !== 'tous') r = r.filter(x => x.type?.toLowerCase() === this.filtreType);
    if (this.filtreNiveau !== 'tous') r = r.filter(x => x.niveau?.toLowerCase() === this.filtreNiveau);
    if (this.filtreAcces === 'gratuit') r = r.filter(x => x.gratuit);
    if (this.filtreAcces === 'premium') r = r.filter(x => !x.gratuit);
    if (this.sortBy === 'niveau') r.sort((a, b) => this.getNiveauOrder(a.niveau) - this.getNiveauOrder(b.niveau));
    if (this.sortBy === 'type') r.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
    this.ressourcesFiltrees = r;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.filtreType = 'tous';
    this.filtreNiveau = 'tous';
    this.filtreAcces = 'tous';
    this.sortBy = 'recent';
    this.applyFilters();
  }

  voirRessource(r: RessourceBienetre): void { this.router.navigate(['/ressource', r.ressourceId]); }

  ajouterAuProgramme(r: RessourceBienetre, e: Event): void {
    e.stopPropagation();
    if (r.ajouteProgramme) return;
    r.ajouteProgramme = true;
    this.showToast(`✓ "${r.titre}" ajouté à votre programme !`, 'success');
    this.http.post(`${this.API}/programmes-prevention/1/ressource/${r.ressourceId}`, {}).subscribe({ error: () => {} });
  }

  ajouterFeatured(): void {
    const featured = this.ressources.find(r => r.ressourceId === 5);
    if (featured) {
      this.ajouterAuProgramme(featured, new Event('click'));
    } else {
      this.showToast('✓ Cohérence Cardiaque 5-5 ajoutée à votre programme !', 'success');
    }
  }

  getCountByType(type: string): number {
    return this.ressources.filter(r => r.type?.toLowerCase() === type).length;
  }

  getTypeIcon(type: string): string {
    const m: Record<string, string> = { 'exercice': '💪', 'article': '📖', 'video': '🎬', 'meditation': '🧘', 'autre': '✨' };
    return m[type?.toLowerCase()] || '✨';
  }

  getTypeLabel(type: string): string {
    const m: Record<string, string> = { 'exercice': 'Exercice', 'article': 'Article', 'video': 'Vidéo', 'meditation': 'Méditation', 'autre': 'Autre' };
    return m[type?.toLowerCase()] || type || '';
  }

  getNiveauLabel(n: string): string {
    const m: Record<string, string> = { 'debutant': '🟢 Débutant', 'intermediaire': '🟡 Intermédiaire', 'avance': '🔴 Avancé' };
    return m[n?.toLowerCase()] || n || '';
  }

  getPopularityPct(vues: number): number {
    const max = Math.max(...this.ressources.map(r => r.vues || 0));
    return max > 0 ? Math.round((vues / max) * 100) : 0;
  }

  private getNiveauOrder(n: string): number {
    return n?.toLowerCase() === 'debutant' ? 1 : n?.toLowerCase() === 'intermediaire' ? 2 : 3;
  }

  showToast(message: string, type: NotifToast['type'] = 'success'): void {
    const id = ++this.toastCounter;
    this.toasts.push({ id, message, type, visible: true });
    setTimeout(() => {
      const t = this.toasts.find(t => t.id === id);
      if (t) { t.visible = false; setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 400); }
    }, 3500);
  }

  dismissToast(id: number): void {
    const t = this.toasts.find(t => t.id === id);
    if (t) { t.visible = false; setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 400); }
  }

  private getDemoRessources(): RessourceBienetre[] {
    return [
      { ressourceId: 1, titre: 'Respiration 4-7-8 Anti-Stress', type: 'exercice', description: 'Technique de respiration scientifiquement prouvée pour activer le système nerveux parasympathique en moins de 2 minutes.', gratuit: true, niveau: 'debutant', dureeEstimee: 10, vues: 2847 },
      { ressourceId: 2, titre: 'Méditation Pleine Conscience pour Débutants', type: 'meditation', description: 'Programme de 8 semaines basé sur la MBSR (Mindfulness-Based Stress Reduction). Réduction du cortisol de 30% prouvée cliniquement.', gratuit: true, niveau: 'debutant', dureeEstimee: 20, vues: 4521 },
      { ressourceId: 3, titre: 'Comprendre et Prévenir le Burnout', type: 'article', description: 'Guide complet sur les mécanismes neurobiologiques du burnout, les signaux d\'alarme précoces et les stratégies de prévention evidence-based.', gratuit: true, niveau: 'intermediaire', dureeEstimee: 15, vues: 6234 },
      { ressourceId: 4, titre: 'Yoga du Matin pour Travailleurs', type: 'video', description: 'Séquence de 20 minutes spécialement conçue pour réduire les tensions liées au travail sédentaire. Focalisation sur les épaules, le dos et la nuque.', gratuit: false, niveau: 'debutant', dureeEstimee: 20, vues: 3156 },
      { ressourceId: 5, titre: 'Cohérence Cardiaque 5-5', type: 'exercice', description: 'Technique de régulation cardiaque par la respiration synchronisée. Pratiquée 3 fois par jour, elle réduit significativement l\'anxiété et améliore la concentration.', gratuit: true, niveau: 'debutant', dureeEstimee: 5, vues: 8901 },
      { ressourceId: 6, titre: 'Neurosciences du Stress au Travail', type: 'article', description: 'Analyse approfondie des mécanismes cérébraux impliqués dans le stress chronique. Comprendre pour mieux agir sur les leviers neurobiologiques de la résilience.', gratuit: false, niveau: 'avance', dureeEstimee: 25, vues: 1876 },
      { ressourceId: 7, titre: 'Scan Corporel Anti-Tension', type: 'meditation', description: 'Méditation guidée de relaxation progressive. Identification et relâchement de chaque groupe musculaire. Idéale avant le coucher pour améliorer la qualité du sommeil.', gratuit: true, niveau: 'intermediaire', dureeEstimee: 30, vues: 5432 },
      { ressourceId: 8, titre: 'Étirements de Bureau : 7 minutes', type: 'exercice', description: 'Programme d\'étirements réalisables depuis son bureau. 7 exercices ciblant les zones de tension les plus fréquentes chez les professionnels en télétravail.', gratuit: true, niveau: 'debutant', dureeEstimee: 7, vues: 12450 },
      { ressourceId: 9, titre: 'Journal Thérapeutique : Méthode CBT', type: 'article', description: 'Utilisation du journaling basé sur les Thérapies Cognitives et Comportementales pour identifier et modifier les schémas de pensées négatives liées au burnout.', gratuit: false, niveau: 'intermediaire', dureeEstimee: 20, vues: 2341 },
    ];
  }

  private initParticles(): void {
    const canvas = this.particleCanvasRef?.nativeElement; if (!canvas) return;
    this.ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 40; i++) this.particles.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 2 + 1, o: Math.random() * 0.4 + 0.1 });
    const draw = () => {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of this.particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(10,110,189,${p.o})`; this.ctx.fill();
      }
      this.animId = requestAnimationFrame(draw);
    };
    draw();
  }
}