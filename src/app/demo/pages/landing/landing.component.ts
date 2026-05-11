import {
  Component, OnInit, OnDestroy, signal,
  HostListener, ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
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
    { name: 'Monitoring Dashboard', icon: '📡', slug: 'monitoring', link: '#' },
    { name: 'Topology Mapper',      icon: '🗺️', slug: 'topology',   link: '#' },
    { name: 'Alert Manager',        icon: '🔔', slug: 'alerts',     link: '#' },
    { name: 'Analytics Engine',     icon: '📊', slug: 'analytics',  link: '#' },
    { name: 'Security Console',     icon: '🔐', slug: 'security',   link: '#' },
    { name: 'Automation Studio',    icon: '⚙️', slug: 'automation', link: '#' },
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
      icon: '📡',
      title: 'Real-Time Monitoring',
      desc: 'Sub-second dashboards with AI-powered anomaly detection. Know before your users do.'
    },
    {
      icon: '🗺️',
      title: 'Topology Mapping',
      desc: 'Auto-discover and visualize your entire infrastructure — from edge nodes to core.'
    },
    {
      icon: '⚡',
      title: 'Intelligent Automation',
      desc: 'Define policies once. SYNCRA enforces them everywhere, automatically.'
    },
    {
      icon: '📈',
      title: 'Predictive Analytics',
      desc: 'ML models trained on your traffic to predict congestion and capacity needs.'
    },
    {
      icon: '🔐',
      title: 'Zero-Trust Security',
      desc: 'Micro-segmentation, continuous verification, and encrypted tunnels built-in.'
    },
    {
      icon: '🔌',
      title: 'Unified API',
      desc: 'One REST API + WebSocket interface. Integrates with your entire existing toolchain.'
    },
  ];

  // ── TESTIMONIAL DATA ─────────────────────────────────────
  testimonials = [
    {
      name: 'Kevin L.',
      handle: '@Head of Infra, Axion Corp',
      text: 'We cut MTTR by 68% in the first month. Detection caught three critical failures before our NOC noticed.',
      avatar: 'KL',
      color: '#0a6ebd'
    },
    {
      name: 'Sarah M.',
      handle: '@Network Architect, TeleSphere',
      text: 'The topology view alone was worth the switch. First time our team shares one true source of truth about network state.',
      avatar: 'SM',
      color: '#00a8c6'
    },
    {
      name: 'Dillon R.',
      handle: '@DevOps Lead, CloudNine',
      text: 'Deployment took half a day. Live dashboards by end of week. ROI conversation with leadership was the easiest ever.',
      avatar: 'DR',
      color: '#006494'
    },
    {
      name: 'Bente K.',
      handle: '@CTO, NordFlow',
      text: 'Exceptional support team. Even outside business hours they responded within minutes. Truly enterprise-grade service.',
      avatar: 'BK',
      color: '#007f5f'
    },
    {
      name: 'Besart A.',
      handle: '@Platform Engineer',
      text: 'Well-structured, very customizable. The automation engine saved us 40 hours of manual work per week immediately.',
      avatar: 'BA',
      color: '#0077b6'
    },
    {
      name: 'Jean-P.',
      handle: '@VP Engineering, Eurotec',
      text: 'We use SYNCRA as the backbone of our entire observability stack. Nothing else comes close for multi-vendor support.',
      avatar: 'JP',
      color: '#023e8a'
    },
  ];

  // ── REASONS DATA ─────────────────────────────────────────
  reasons = [
    'Real-Time Intelligence',
    'Zero-Touch Automation',
    'Enterprise Security',
    'Multi-Vendor Support',
    'Infinite Scalability',
    'World-Class Support',
  ];

  // ── STATS DATA ───────────────────────────────────────────
  stats = [
    { number: '2.4B+',  label: 'Events Processed / Day', color: 'cyan',  icon: '◈' },
    { number: '500+',   label: 'Enterprise Clients',      color: 'blue',  icon: '⊟' },
    { number: '99.99%', label: 'Uptime SLA Guaranteed',   color: 'navy',  icon: '◆' },
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