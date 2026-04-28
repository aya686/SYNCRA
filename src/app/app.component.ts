import { Component } from '@angular/core';
import { NotificationService } from './modules/shared/services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'event-formation-platform';

  constructor(public notificationService: NotificationService) {}

  closeNotification(id: number): void {
    // Méthode pour fermer manuellement une notification
    // La suppression se fait automatiquement après la durée définie
  }
  
}
