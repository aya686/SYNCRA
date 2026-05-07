import {
  Component, OnInit, OnDestroy, signal,
  HostListener, ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorGlow')     cursorGlowRef!: ElementRef<HTMLDivElement>;
  @ViewChild('dashPreview')    dashRef!: ElementRef<HTMLDivElement>;

  currentAppIndex     = signal(0);
  currentFrameworkPage = signal(0);
  navScrolled  = false;
  mobileMenuOpen = false;

  private autoSlideInterval: ReturnType<typeof setInterval> | null = null;
  private animationFrameId: number | null = null;
  private scrollObserver: IntersectionObserver | null = null;

  // ── CHART DATA ───────────────────────────────────────────
  chartBars = [
    { h: '55%', c: '#0a6ebd', d: 'M' },
    { h: '80%', c: '#1588d8', d: 'T' },
    { h: '45%', c: '#0a6ebd', d: 'W' },
    { h: '95%', c: '#00c2d4', d: 'T' },
    { h: '65%', c: '#0a6ebd', d: 'F' },
    { h: '78%', c: '#1588d8', d: 'S' },
    { h: '58%', c: '#0a6ebd', d: 'S' },
  ];

  // ── APP DATA ─────────────────────────────────────────────
  apps = [
    { name: 'Marketplace', icon: '�', slug: 'marketplace', link: '#' },
    { name: 'Candidatures', icon: '�', slug: 'candidatures', link: '#' },
    { name: 'Contrats', icon: '�', slug: 'contrats', link: '#' },
    { name: 'Investissements', icon: '�', slug: 'investissements', link: '#' },
    { name: 'Chat', icon: '�', slug: 'chat', link: '#' },
    { name: 'Analytics IA', icon: '🤖', slug: 'analytics', link: '#' },
  ];

  // ── FRAMEWORK / INTEGRATION DATA ─────────────────────────
  frameworks = [
    { name: 'Kubernetes',  icon: '☸',  color: '#326ce5', bg: '#eaf0ff' },
    { name: 'Terraform',   icon: 'TF', color: '#7b42bc', bg: '#f3eeff' },
    { name: 'Prometheus',  icon: '🔥', color: '#e6522c', bg: '#fff2ee' },
    { name: 'Grafana',     icon: 'G',  color: '#f46800', bg: '#fff4ea' },
    { name: 'PagerDuty',   icon: 'PD', color: '#06ac38', bg: '#e8ffee' },
    { name: 'Datadog',     icon: '🐕', color: '#632ca6', bg: '#f3eeff' },
    { name: 'Ansible',     icon: 'A',  color: '#c00',    bg: '#ffeeee' },
    { name: 'Docker',      icon: '🐳', color: '#2496ed', bg: '#e8f4ff' },
  ];

  // ── FEATURE DATA ─────────────────────────────────────────
  features = [
    {
      icon: '�',
      title: 'Marketplace Intelligente',
      desc: 'Trouvez les meilleures opportunités avec des recommandations IA basées sur votre profil et vos compétences.'
    },
    {
      icon: '�',
      title: 'Gestion d\'Investissement',
      desc: 'Suivez vos investissements en temps réel avec des analyses de risque et des prédictions de rendement.'
    },
    {
      icon: '📄',
      title: 'Contrats Numériques',
      desc: 'Générez et signez des contrats sécurisés avec des clauses personnalisables et une traçabilité complète.'
    },
    {
      icon: '🤖',
      title: 'IA & Analytics',
      desc: 'Des modèles ML entraînés pour prédire les budgets, détecter les fraudes et analyser les opportunités.'
    },
    {
      icon: '�',
      title: 'Chat Intégré',
      desc: 'Communiquez directement avec les porteurs de projets et les investisseurs dans un environnement sécurisé.'
    },
    {
      icon: '�',
      title: 'Sécurité Avancée',
      desc: 'Chiffrement de bout en bout, authentification multi-facteurs et conformité aux normes de sécurité.'
    },
  ];

  // ── TESTIMONIAL DATA ─────────────────────────────────────
  testimonials = [
    {
      name: 'Karim L.',
      handle: '@Investisseur, Tunis Startups',
      text: 'J\'ai trouvé 3 projets exceptionnels en une semaine. L\'analyse IA m\'a fait gagner un temps précieux dans mes décisions d\'investissement.',
      avatar: 'KL',
      color: '#0a6ebd'
    },
    {
      name: 'Sarah M.',
      handle: '@Freelance Designer',
      text: 'La marketplace est incroyable. J\'ai signé mon premier contrat important grâce aux recommandations personnalisées de BERRY.',
      avatar: 'SM',
      color: '#00a8c6'
    },
    {
      name: 'Dhouha R.',
      handle: '@Porteur de projet, TechHub',
      text: 'Les outils de gestion de contrats et le chat intégré ont simplifié toute notre collaboration avec les freelancers.',
      avatar: 'DR',
      color: '#006494'
    },
    {
      name: 'Bilel K.',
      handle: '@CTO, Innovate Tunis',
      text: 'L\'analyse de fraude et les prédictions de budget nous ont permis d\'optimiser nos offres et d\'attirer de meilleurs talents.',
      avatar: 'BK',
      color: '#007f5f'
    },
    {
      name: 'Amira A.',
      handle: '@Freelance Développeur',
      text: 'Interface intuitive, processus de candidature fluide. J\'ai décroché 5 projets en moins d\'un mois.',
      avatar: 'BA',
      color: '#0077b6'
    },
    {
      name: 'Jean-P.',
      handle: '@Angel Investor',
      text: 'BERRY est devenu mon outil principal pour identifier les opportunités d\'investissement en Tunisie et dans la région.',
      avatar: 'JP',
      color: '#023e8a'
    },
  ];

  // ── REASONS DATA ─────────────────────────────────────────
  reasons = [
    'Intelligence IA Intégrée',
    'Marketplace de Qualité',
    'Sécurité Avancée',
    'Support Multi-Rôles',
    'Scalabilité Illimitée',
    'Support Client 24/7',
  ];

  // ── STATS DATA ───────────────────────────────────────────
  stats = [
    { number: '500+',   label: 'Investisseurs Actifs',     color: 'cyan',  icon: '◈' },
    { number: '1,200+', label: 'Freelances Inscrits',    color: 'blue',  icon: '⊟' },
    { number: '98%',    label: 'Taux de Satisfaction',   color: 'navy',  icon: '◆' },
  ];

  // ── LIFECYCLE ─────────────────────────────────────────────
  ngOnInit(): void {
    this.autoSlideInterval = setInterval(() => this.nextApp(), 3800);
    this.initScrollAnimations();
  }

  ngAfterViewInit(): void {
    this.initParticleCanvas();
    this.initCursorGlow();
    this.initDashboardTilt();
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.scrollObserver) this.scrollObserver.disconnect();
  }

  // ── SCROLL HANDLER ───────────────────────────────────────
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.navScrolled = window.scrollY > 40;
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
    const N = 65;
    const particles: Particle[] = Array.from({ length: N }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r:  Math.random() * 1.8 + 0.8,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Connections
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(10,110,189,${0.09 * (1 - dist / 130)})`;
            ctx.lineWidth   = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(10,110,189,0.3)';
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
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

  // ── DASHBOARD TILT ────────────────────────────────────────
  private initDashboardTilt(): void {
    const dash = this.dashRef?.nativeElement;
    if (!dash) return;

    dash.addEventListener('mousemove', (e: MouseEvent) => {
      const rect   = dash.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const rx     = ((e.clientY - cy) / rect.height) * 10;
      const ry     = ((e.clientX - cx) / rect.width)  * -14;
      dash.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    dash.addEventListener('mouseleave', () => {
      dash.style.transform = 'perspective(1200px) rotateY(-8deg) rotateX(5deg)';
    });
  }

  // ── SCROLL REVEAL ─────────────────────────────────────────
  initScrollAnimations(): void {
    this.scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        this.scrollObserver!.observe(el);
      });
    }, 120);
  }

  // ── CAROUSELS ─────────────────────────────────────────────
  nextApp(): void {
    this.currentAppIndex.set((this.currentAppIndex() + 1) % this.apps.length);
  }
  prevApp(): void {
    this.currentAppIndex.set((this.currentAppIndex() - 1 + this.apps.length) % this.apps.length);
  }

  nextFrameworkPage(): void {
    this.currentFrameworkPage.set((this.currentFrameworkPage() + 1) % 2);
  }
  prevFrameworkPage(): void {
    this.currentFrameworkPage.set((this.currentFrameworkPage() - 1 + 2) % 2);
  }

  get visibleFrameworks() {
    const start = this.currentFrameworkPage() * 7;
    return this.frameworks.slice(start, start + 7);
  }
}