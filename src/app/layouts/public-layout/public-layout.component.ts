import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { SimpleAuthService } from '../../modules/auth/services/simple-auth.service';
import { FavoritesService } from '../../modules/shared/services/favorites.service';

@Component({
    selector: 'app-public-layout',
    templateUrl: './public-layout.component.html',
    styleUrls: ['./public-layout.component.scss'],
    standalone: false
})
export class PublicLayoutComponent {
  navScrolled = false;
  isSidebarCollapsed = false;
  mobileMenuOpen = false;
  submenuOpen = false;
  favoritesCount: number = 0;

  constructor(public authService: SimpleAuthService,private favoritesService: FavoritesService) {}

toggleSubmenu() {
  this.submenuOpen = !this.submenuOpen;
}

  @ViewChild('particleCanvas') particleCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorGlow') cursorGlow!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this.initParticles();
    this.initCursorGlow();
    this.favoritesService.favorites$.subscribe(favorites => {
      this.favoritesCount = favorites.length;
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.navScrolled = window.scrollY > 20;
  }

  logout() {
  this.authService.logout();
}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  private initParticles() {
    const canvas = this.particleCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Array<{x: number, y: number, radius: number, alpha: number}> = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        alpha: Math.random() * 0.3
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10, 110, 189, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();
  }

  private initCursorGlow() {
    const glow = this.cursorGlow?.nativeElement;
    if (!glow) return;
    document.addEventListener('mousemove', (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
  }
}