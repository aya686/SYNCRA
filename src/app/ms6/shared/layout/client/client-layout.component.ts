import { Component, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-client-layout',
  imports: [RouterModule],
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.scss']
})
export class ClientLayoutComponent implements AfterViewInit {
  @ViewChild('cursorGlow') cursorGlowRef!: ElementRef<HTMLDivElement>;
  
  navScrolled = false;
  mobileMenuOpen = false;

  constructor(public router: Router) {}

  ngAfterViewInit(): void {
    this.initCursorGlow();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.navScrolled = window.scrollY > 40;
  }

  private initCursorGlow(): void {
    const glow = this.cursorGlowRef?.nativeElement;
    if (!glow) return;
    
    // Vérifier si on est sur mobile
    if (window.matchMedia('(pointer: coarse)').matches) {
      glow.style.display = 'none';
      return;
    }
    
    document.addEventListener('mousemove', (e: MouseEvent) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
