// src/app/services/notification.service.ts
// ✅ Ajout des icônes et couleurs pour les notifications de fidélité

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

export interface AppNotification {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  entityId?: number;
  entityType?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:8083/api/notifications';

  private unreadCount$ = new BehaviorSubject<number>(0);
  unreadCount = this.unreadCount$.asObservable();

  constructor(private http: HttpClient) {}

  startPolling(userId: number): void {
    interval(30000).pipe(
      switchMap(() => this.getUnreadCount(userId))
    ).subscribe(res => this.unreadCount$.next(res.count));
    this.getUnreadCount(userId).subscribe(res => this.unreadCount$.next(res.count));
  }

  getByUser(userId: number): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.apiUrl}/user/${userId}`);
  }

  getUnread(userId: number): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.apiUrl}/user/${userId}/unread`);
  }

  getUnreadCount(userId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/user/${userId}/count`).pipe(
      tap(res => this.unreadCount$.next(res.count))
    );
  }

  markAsRead(id: number): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/user/${userId}/read-all`, {}).pipe(
      tap(() => this.unreadCount$.next(0))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Icône Bootstrap selon le type */
  getIcon(type: string): string {
    switch (type) {
      // Machines / Services
      case 'MACHINE_APPROVED':        return 'bi-check-circle-fill text-success';
      case 'MACHINE_REJECTED':        return 'bi-x-circle-fill text-danger';
      case 'SERVICE_APPROVED':        return 'bi-check-circle-fill text-success';
      case 'SERVICE_REJECTED':        return 'bi-x-circle-fill text-danger';
      // Demandes
      case 'REQUEST_RECEIVED':        return 'bi-envelope-fill text-primary';
      case 'REQUEST_ACCEPTED':        return 'bi-check-circle-fill text-success';
      case 'REQUEST_REJECTED':        return 'bi-x-circle-fill text-danger';
      case 'REQUEST_IN_PROGRESS':     return 'bi-arrow-repeat text-primary';
      case 'REQUEST_COMPLETED':       return 'bi-trophy-fill text-success';
      case 'REQUEST_CANCELLED':       return 'bi-slash-circle-fill text-secondary';
      // Commandes
      case 'ORDER_CONFIRMED':         return 'bi-bag-check-fill text-success';
      case 'ORDER_IN_DELIVERY':       return 'bi-truck text-primary';
      case 'ORDER_DELIVERED':         return 'bi-gift-fill text-success';
      case 'ORDER_CANCELLED':         return 'bi-bag-x-fill text-danger';
      // ✅ Fidélité
      case 'LOYALTY_POINTS_EARNED':   return 'bi-star-fill text-warning';
      case 'LOYALTY_POINTS_SPENT':    return 'bi-dash-circle-fill text-info';
      case 'LOYALTY_TIER_UP':         return 'bi-trophy-fill text-warning';
      case 'LOYALTY_FREE_DELIVERY':   return 'bi-truck text-success';
      case 'LOYALTY_PREMIUM_ACCESS':  return 'bi-gem text-warning';
      default:                        return 'bi-bell-fill text-secondary';
    }
  }

  /** Couleur d'accent hexa selon le type */
  getAccentColor(type: string): string {
    if (type.includes('APPROVED') || type.includes('ACCEPTED') || type.includes('COMPLETED') || type.includes('DELIVERED'))
      return '#16a34a';
    if (type.includes('REJECTED') || type.includes('CANCELLED'))
      return '#dc2626';
    if (type.includes('IN_PROGRESS') || type.includes('IN_DELIVERY'))
      return '#2563eb';
    if (type === 'REQUEST_RECEIVED')
      return '#7c3aed';
    // Fidélité
    if (type.startsWith('LOYALTY_'))
      return '#d97706';  // doré
    return '#64748b';
  }

  timeAgo(date: Date | string): string {
    const d    = new Date(date);
    const now  = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60)    return 'À l\'instant';
    if (diff < 3600)  return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 604800)return `il y a ${Math.floor(diff / 86400)} j`;
    return d.toLocaleDateString('fr-TN');
  }
}