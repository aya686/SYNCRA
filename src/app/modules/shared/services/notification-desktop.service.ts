import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DesktopNotificationService {

  constructor() {
    // Demander la permission automatiquement au chargement
    this.requestPermissionOnLoad();
  }

  // Demander automatiquement la permission au chargement
  private requestPermissionOnLoad(): void {
    if (!('Notification' in window)) {
      console.log('⚠️ Les notifications ne sont pas supportées par ce navigateur');
      return;
    }

    // Ne demander que si la permission n'a pas encore été traitée
    if (Notification.permission === 'default') {
      // Attendre un peu que la page soit chargée
      setTimeout(() => {
        this.requestPermission();
      }, 1000);
    }
  }

  // Demander la permission à l'utilisateur
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('⚠️ Les notifications ne sont pas supportées par ce navigateur');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Permission déjà accordée');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Permission déjà refusée');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Permission de notification accordée');
        return true;
      } else {
        console.log('❌ Permission de notification refusée');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  // Envoyer une notification
  sendNotification(title: string, body: string, icon?: string): void {
    if (!('Notification' in window)) {
      console.log('Ce navigateur ne supporte pas les notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      const options: NotificationOptions = {
        body: body,
        icon: icon || '/favicon.ico',
        badge: icon || '/favicon.ico',
        silent: false,
      };
      
      const notification = new Notification(title, options);
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      setTimeout(() => notification.close(), 5000);
      console.log('✅ Notification envoyée');
      
    } else if (Notification.permission === 'denied') {
      console.log('❌ Impossible d\'envoyer la notification: permission refusée');
    } else {
      console.log('ℹ️ Permission non encore accordée, tentative de demande...');
      this.requestPermission().then(granted => {
        if (granted) {
          this.sendNotification(title, body, icon);
        }
      });
    }
  }

  // Vérifier si les notifications sont supportées
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Vérifier la permission actuelle
  getPermission(): string {
    if (!this.isSupported()) return 'not-supported';
    return Notification.permission;
  }
}