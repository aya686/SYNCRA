<<<<<<< HEAD
<<<<<<< HEAD
// Angular import
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// project import
import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, SpinnerComponent]
})
export class AppComponent {
  title = 'Berry Angular Free Version';
}
=======
// src/app/app.component.ts
// ✅ Ajout du solde de points fidélité dans la navbar

import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from './services/cart.service';
import { NotificationService } from './services/notification.service';
import { LoyaltyService } from './services/loyalty.service';
import { NotificationBellComponent } from './modules/cart/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationBellComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title          = 'Plateforme Écosystème';
  cartItemCount  = 0;
  navbarVisible  = true;
  loyaltyPoints  = 0;        // ✅ Affiché dans le badge navbar

  private lastScrollTop = 0;

  constructor(
    private cartService:     CartService,
    private notifService:    NotificationService,
    private loyaltyService:  LoyaltyService       // ✅ NOUVEAU
  ) {}

  ngOnInit(): void {
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', '1');
      localStorage.setItem('userName', 'Utilisateur Test');
    }

    this.loadCartItemCount();

    const userId = this.getCurrentUserId();

    // Polling notifications
    this.notifService.startPolling(userId);

    // ✅ Abonnement au solde de points (mis à jour en temps réel depuis LoyaltyService)
    this.loyaltyService.account.subscribe(acc => {
      if (acc) this.loyaltyPoints = acc.points;
    });

    // Charger le compte fidélité au démarrage
    this.loyaltyService.getAccount(userId).subscribe({
      error: () =>
        this.loyaltyService.initAccount(userId, this.getCurrentUserName())
            .subscribe()
    });

    window.addEventListener('cartUpdated', () => this.loadCartItemCount());
  }

  loadCartItemCount(): void {
    const userId = this.getCurrentUserId();
    this.cartService.getCart(userId).subscribe({
      next: cart => {
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
    const current = window.pageYOffset || document.documentElement.scrollTop;
    this.navbarVisible = current <= this.lastScrollTop;
    this.lastScrollTop = current <= 0 ? 0 : current;
  }

  onImageError(): void { console.log('Image non trouvée'); }

  private getCurrentUserId():   number { return parseInt(localStorage.getItem('userId')  || '1', 10); }
  private getCurrentUserName(): string { return localStorage.getItem('userName') || 'Utilisateur'; }
}
>>>>>>> e-commerce
=======
import { Component } from '@angular/core';
import { NotificationService } from './modules/shared/services/notification.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  title = 'event-formation-platform';

  constructor(public notificationService: NotificationService) {}

  closeNotification(id: number): void {
    // Méthode pour fermer manuellement une notification
    // La suppression se fait automatiquement après la durée définie
  }
  
}
>>>>>>> events
