// Angular import
import { Component, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

// Project import
import { BerryConfig } from 'src/app/app-config';
import { NavLeftComponent } from './nav-left/nav-left.component';
import { NavLogoComponent } from './nav-logo/nav-logo.component';
import { NavRightComponent } from './nav-right/nav-right.component';

// ============================================================
// AJOUT GESUSERS — Interface Notification (SSE)
// ============================================================
interface Notification {
  type: 'blocked' | 'reactivated';
  message: string;
  time: Date;
}
// ============================================================
// FIN AJOUT GESUSERS — Interface
// ============================================================

@Component({
  selector: 'app-nav-bar',
  imports: [
    CommonModule,       // AJOUT GESUSERS — requis pour *ngIf, *ngFor, date pipe
    NavLogoComponent,
    NavLeftComponent,
    NavRightComponent
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {

  // ── Propriétés originales du template ───────────────────
  NavCollapse = output();
  NavCollapsedMob = output();
  navCollapsed: boolean;
  windowWidth: number;
  navCollapsedMob: boolean;

  constructor() {
    this.windowWidth = window.innerWidth;
    this.navCollapsed = this.windowWidth >= 1025 ? BerryConfig.isCollapse_menu : false;
    this.navCollapsedMob = false;

    // ============================================================
    // AJOUT GESUSERS — Connexion SSE au démarrage
    // ============================================================
    this.connectToSSE();
    // ============================================================
    // FIN AJOUT GESUSERS — Connexion SSE
    // ============================================================
  }

  // Méthodes originales du template
  navCollapse() {
    if (this.windowWidth >= 1025) {
      this.navCollapsed = !this.navCollapsed;
      this.NavCollapse.emit();
    }
  }

  navCollapseMob() {
    if (this.windowWidth < 1025) {
      this.NavCollapsedMob.emit();
    }
  }

  // ============================================================
  // AJOUT GESUSERS — Propriétés notifications
  // ============================================================
  notifications: Notification[] = [];
  showNotifications = false;
  unreadCount = 0;
  // ============================================================
  // FIN AJOUT GESUSERS — Propriétés notifications
  // ============================================================


  // ============================================================
  // AJOUT GESUSERS — Méthodes notifications + SSE
  // ============================================================

  connectToSSE(): void {
    const eventSource = new EventSource(
      'http://localhost:8082/api/admin/stream',
      { withCredentials: true }
    );

    eventSource.addEventListener('blocked', (event) => {
      const data = JSON.parse(event.data);
      this.addNotification({
        type: 'blocked',
        message: `${data.email} a été bloqué — ${data.reason}`,
        time: new Date()
      });
    });

    eventSource.addEventListener('reactivated', (event) => {
      const data = JSON.parse(event.data);
      this.addNotification({
        type: 'reactivated',
        message: `${data.email} a été réactivé`,
        time: new Date()
      });
    });

    eventSource.onerror = (error) => {
      console.error('Erreur SSE navbar:', error);
    };
  }

  addNotification(notification: Notification): void {
    this.notifications.unshift(notification);
    this.unreadCount++;
    if (this.notifications.length > 20) {
      this.notifications.pop();
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.unreadCount = 0;
    }
  }

  clearNotifications(): void {
    this.notifications = [];
    this.unreadCount = 0;
    this.showNotifications = false;
  }

  // Ferme le dropdown si on clique ailleurs sur la page
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.notification-icon') &&
      !target.closest('.notification-dropdown')
    ) {
      this.showNotifications = false;
    }
  }

  // ============================================================
  // FIN AJOUT GESUSERS — Méthodes notifications + SSE
  // ============================================================
}