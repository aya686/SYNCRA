import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Notification {
  type: 'blocked' | 'reactivated';
  message: string;
  time: Date;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  isSidebarCollapsed = false;
  adminName = 'Admin';
  pageTitle = 'Tableau de bord';
  
  notifications: Notification[] = [];
  showNotifications = false;
  unreadCount = 0;

  constructor(private router: Router) {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.adminName = (userData.prenom || '') + ' ' + (userData.nom || '') || 'Administrateur';
    }
    
    this.connectToSSE();
  }

  connectToSSE(): void {
    const eventSource = new EventSource('http://localhost:8082/api/admin/stream', { withCredentials: true });
    
    eventSource.addEventListener('blocked', (event) => {
      const data = JSON.parse(event.data);
      this.addNotification({
        type: 'blocked',
        message: `${data.email} a été bloqué - ${data.reason}`,
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
      console.error('❌ Erreur SSE:', error);
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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-icon') && !target.closest('.notification-dropdown')) {
      this.showNotifications = false;
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/my-login']);
  }

  goToProfile(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.router.navigate(['/gesusers/profile', userData.id]);
    }
  }
}