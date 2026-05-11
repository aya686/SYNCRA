import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Services d'Aya (originaux)
import { CartService } from './services/cart.service';
import { NotificationService } from './services/notification.service';
import { LoyaltyService } from './services/loyalty.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'Plateforme Écosystème';
  cartItemCount = 0;
  navbarVisible = true;
  loyaltyPoints = 0;
  showAyaNav = false;

  private lastScrollTop = 0;

private ayaRoutes = [
  '/machines', '/services', '/requests',
  '/cart', '/orders', '/loyalty',
  '/marketplace', '/reviews',
  '/admin-shop'  // ← AJOUTER
];

  constructor(
    private cartService: CartService,
    private notifService: NotificationService,
    private loyaltyService: LoyaltyService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.showAyaNav = this.ayaRoutes.some(route =>
        e.urlAfterRedirects.startsWith(route)
      );
    });
  }

  ngOnInit(): void {
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', '1');
      localStorage.setItem('userName', 'Utilisateur Test');
    }

    this.loadCartItemCount();

    const userId = this.getCurrentUserId();

    // Service d'Aya — startPolling existe
    this.notifService.startPolling(userId);

    this.loyaltyService.account.subscribe(account => {
      if (account) this.loyaltyPoints = account.points;
    });

    this.loyaltyService.getAccount(userId).subscribe({
      error: () => this.loyaltyService
        .initAccount(userId, this.getCurrentUserName())
        .subscribe()
    });

    window.addEventListener('cartUpdated', () => this.loadCartItemCount());
  }

  loadCartItemCount(): void {
    const userId = this.getCurrentUserId();
    this.cartService.getCart(userId).subscribe({
      next: (cart) => {
        this.cartItemCount = cart?.items?.length || 0;
        localStorage.setItem('cartCount', this.cartItemCount.toString());
      },
      error: () => {
        const stored = localStorage.getItem('cartCount');
        this.cartItemCount = stored ? parseInt(stored, 10) : 0;
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    this.navbarVisible = currentScroll <= this.lastScrollTop;
    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }

  onImageError(): void {
    console.log('Image non trouvée');
  }

  private getCurrentUserId(): number {
    return parseInt(localStorage.getItem('userId') || '1', 10);
  }

  private getCurrentUserName(): string {
    return localStorage.getItem('userName') || 'Utilisateur';
  }
}