import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, AppNotification } from '../../../../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  unreadCount = 0;
  showPanel = false;
  loading = false;
 
  private unreadSub?: Subscription;
 
  constructor(
    private notifService: NotificationService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    const userId = this.getCurrentUserId();
 
    // S'abonner au compteur (mis à jour par polling)
    this.unreadSub = this.notifService.unreadCount.subscribe(
      count => this.unreadCount = count
    );
 
    // Démarrer le polling
    this.notifService.startPolling(userId);
  }
 
  ngOnDestroy(): void {
    this.unreadSub?.unsubscribe();
  }
 
  /** Fermer le panel si clic en dehors */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-bell-wrapper')) {
      this.showPanel = false;
    }
  }
 
  togglePanel(): void {
    this.showPanel = !this.showPanel;
    if (this.showPanel) {
      this.loadNotifications();
    }
  }
 
  loadNotifications(): void {
    this.loading = true;
    const userId = this.getCurrentUserId();
 
    this.notifService.getByUser(userId).subscribe({
      next: (data) => {
        this.notifications = data.slice(0, 15); // Max 15 dans le dropdown
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
 
  markAsRead(notif: AppNotification, event: Event): void {
    event.stopPropagation();
    if (notif.isRead) return;
 
    this.notifService.markAsRead(notif.id).subscribe({
      next: () => {
        notif.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }
 
  markAllAsRead(): void {
    const userId = this.getCurrentUserId();
    this.notifService.markAllAsRead(userId).subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
      }
    });
  }
 
  deleteNotif(notif: AppNotification, event: Event): void {
    event.stopPropagation();
    this.notifService.delete(notif.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
        if (!notif.isRead) this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }
 
  navigateTo(notif: AppNotification): void {
    if (!notif.isRead) {
      this.notifService.markAsRead(notif.id).subscribe(() => {
        notif.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      });
    }
    if (notif.actionUrl) {
      this.router.navigateByUrl(notif.actionUrl);
    }
    this.showPanel = false;
  }
 
  getIcon(type: string): string  { return this.notifService.getIcon(type); }
  getAccent(type: string): string { return this.notifService.getAccentColor(type); }
  timeAgo(date: Date): string    { return this.notifService.timeAgo(date); }
 
  private getCurrentUserId(): number {
    return parseInt(localStorage.getItem('userId') || '1', 10);
  }
}