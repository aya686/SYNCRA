import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastNotification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notifications: ToastNotification[] = [];
  private notificationSubject = new BehaviorSubject<ToastNotification[]>([]);

  notifications$ = this.notificationSubject.asObservable();

  startPolling(userId: number): void {
    console.log('Notification polling démarré pour user:', userId);

    // Exemple futur :
    // setInterval(() => {
    //   this.info('Nouvelle notification reçue');
    // }, 10000);
  }

  show(
    message: string,
    title: string = 'Notification',
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 3000
  ): void {

    const notification: ToastNotification = {
      id: Date.now(),
      title,
      message,
      type,
      duration
    };

    this.notifications.push(notification);
    this.notificationSubject.next([...this.notifications]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }

  success(message: string, title: string = 'Succès'): void {
    this.show(message, title, 'success', 4000);
  }

  error(message: string, title: string = 'Erreur'): void {
    this.show(message, title, 'error', 5000);
  }

  warning(message: string, title: string = 'Attention'): void {
    this.show(message, title, 'warning', 4000);
  }

  info(message: string, title: string = 'Information'): void {
    this.show(message, title, 'info', 3000);
  }

  private remove(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notificationSubject.next([...this.notifications]);
  }

}