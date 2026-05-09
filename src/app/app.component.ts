import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Project imports
import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';
import { NotificationBellComponent } from './modules/cart/components/notification-bell/notification-bell.component';

// Services
import { CartService } from './services/cart.service';
import { NotificationService } from './modules/shared/services/notification.service';
import { LoyaltyService } from './services/loyalty.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    SpinnerComponent,
    NotificationBellComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'Plateforme Écosystème';

  cartItemCount = 0;
  navbarVisible = true;
  loyaltyPoints = 0;

  private lastScrollTop = 0;

  constructor(
    private cartService: CartService,
    public notificationService: NotificationService,
    private loyaltyService: LoyaltyService
  ) {}

  ngOnInit(): void {

    // Initialisation utilisateur test
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', '1');
      localStorage.setItem('userName', 'Utilisateur Test');
    }

    this.loadCartItemCount();

    const userId = this.getCurrentUserId();

    // Notifications polling
// Vérifie si la méthode existe avant appel
if ((this.notificationService as any).startPolling) {
  (this.notificationService as any).startPolling(userId);
}
    // Mise à jour des points fidélité
    this.loyaltyService.account.subscribe(account => {
      if (account) {
        this.loyaltyPoints = account.points;
      }
    });

    // Chargement compte fidélité
    this.loyaltyService.getAccount(userId).subscribe({
      error: () => {
        this.loyaltyService
          .initAccount(userId, this.getCurrentUserName())
          .subscribe();
      }
    });

    // Mise à jour panier
    window.addEventListener('cartUpdated', () => {
      this.loadCartItemCount();
    });
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
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;

    this.navbarVisible = currentScroll <= this.lastScrollTop;

    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }

  closeNotification(id: number): void {
    console.log('Notification fermée:', id);
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