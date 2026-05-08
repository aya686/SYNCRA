// Angular import
import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Third party
import { SharedModule } from 'src/app/theme/shared/shared.module';

// ============================================================
// AJOUT GESUSERS — Interface Notification SSE
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
  selector: 'app-nav-right',
  imports: [RouterModule, SharedModule, CommonModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit {

  // ============================================================
  // AJOUT GESUSERS — Propriétés profil admin
  // ============================================================
  adminName = 'Administrateur';
  adminInitials = 'A';
  adminId: number = 0;
  // ============================================================
  // FIN AJOUT GESUSERS — Propriétés profil
  // ============================================================

  // ============================================================
  // AJOUT GESUSERS — Propriétés notifications SSE
  // ============================================================
  notifications: Notification[] = [];
  unreadCount = 0;
  // ============================================================
  // FIN AJOUT GESUSERS — Propriétés notifications
  // ============================================================

  constructor(private router: Router) {}

  ngOnInit(): void {
    // ============================================================
    // AJOUT GESUSERS — Chargement infos admin depuis localStorage
    // ============================================================
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      const prenom = user.prenom || '';
      const nom    = user.nom    || '';
      this.adminName     = `${prenom} ${nom}`.trim() || 'Administrateur';
      this.adminInitials = `${prenom[0] || ''}${nom[0] || ''}`.toUpperCase() || 'A';
      this.adminId       = user.id || 0;
    }
    // ============================================================
    // FIN AJOUT GESUSERS — Chargement infos admin
    // ============================================================

    // ============================================================
    // AJOUT GESUSERS — Connexion SSE pour notifications temps réel
    // ============================================================
    this.connectToSSE();
    // ============================================================
    // FIN AJOUT GESUSERS — Connexion SSE
    // ============================================================
  }

  // ============================================================
  // AJOUT GESUSERS — Méthodes notifications SSE
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
      console.error('Erreur SSE nav-right:', error);
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
    this.unreadCount = 0;
  }

  clearNotifications(): void {
    this.notifications = [];
    this.unreadCount = 0;
  }

  // ============================================================
  // FIN AJOUT GESUSERS — Méthodes notifications SSE
  // ============================================================

  // ============================================================
  // AJOUT GESUSERS — Logout
  // ============================================================
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/my-login']);
  }
  // ============================================================
  // FIN AJOUT GESUSERS — Logout
  // ============================================================

}