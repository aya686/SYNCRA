import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../shared/services/notification.service';
import { DesktopNotificationService } from '../../../shared/services/notification-desktop.service';

@Component({
    selector: 'app-inscription-form',
    templateUrl: './inscription-form.component.html',
    styleUrls: ['./inscription-form.component.css'],
    standalone: false
})
export class InscriptionFormComponent implements OnInit {
  eventId: number = 0;
  event: any = null;
  loading = false;
  submitted = false;
  inscriptionSuccess = false;

  inscription = {
    participant: {
      nom: '',
      email: '',
      role: 'participant'
    },
    commentaire: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private notificationService: NotificationService,
    public desktopNotification: DesktopNotificationService
  ) {}

  ngOnInit(): void {
    this.eventId = +this.route.snapshot.params['id'];
    this.loadEventInfo();
  }

  loadEventInfo(): void {
    this.loading = true;
    this.http.get(`http://localhost:8089/event_db/api/events/${this.eventId}`).subscribe({
      next: (event: any) => {
        this.event = {
          id: event.evenementId,
          titre: event.titre,
          type: event.type,
          lieu: event.lieu,
          dateHeure: event.dateHeure,
          capacite: event.capacite,
          prix: event.prix,
          statut: event.statut,
          placesDisponibles: event.capacite - (event.nbInscrits || 0)
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.notificationService.error('Impossible de charger l\'événement');
        this.loading = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    this.submitted = true;

    if (form.invalid) {
      this.notificationService.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.event.placesDisponibles <= 0) {
      this.notificationService.error('Désolé, cet événement est complet');
      return;
    }

    this.loading = true;

    const participantData = {
      nom: this.inscription.participant.nom,
      email: this.inscription.participant.email,
      role: this.inscription.participant.role
    };

    this.http.post('http://localhost:8089/event_db/api/participants', participantData).subscribe({
      next: (participant: any) => {
        const inscriptionData = {
          participantId: participant.participantId,
          evenementId: this.eventId,
          statut: 'confirme',
          present: false,
          dateInscription: new Date().toISOString(),
          email: this.inscription.participant.email,
          nomParticipant: this.inscription.participant.nom,
          eventTitle: this.event.titre,
          eventDate: new Date(this.event.dateHeure).toLocaleDateString('fr-FR'),
          eventLieu: this.event.lieu
        };

        this.http.post('http://localhost:8089/event_db/api/inscriptions', inscriptionData).subscribe({
          next: (inscription: any) => {
            this.inscriptionSuccess = true;
            
            // Notification Toast (dans la page)
            this.notificationService.success(
              `Félicitations ! Vous êtes inscrit à "${this.event.titre}"`, 
              '🎉 Inscription confirmée'
            );
            
            // Notification Système (automatique)
            this.desktopNotification.sendNotification(
              '🎉 Inscription confirmée !',
              `Félicitations ${this.inscription.participant.nom} !\nVous êtes inscrit à "${this.event.titre}"\n📅 Date: ${new Date(this.event.dateHeure).toLocaleDateString('fr-FR')}\n📍 Lieu: ${this.event.lieu}`,
              '/favicon.ico'
            );
            
            setTimeout(() => {
              this.router.navigate(['/events', this.eventId]);
            }, 30000);
            this.loading = false;
          },
          error: (err) => {
            console.error('Erreur lors de l\'inscription:', err);
            this.notificationService.error('Erreur lors de l\'inscription');
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors de la création du participant:', err);
        this.notificationService.error('Erreur lors de l\'enregistrement');
        this.loading = false;
      }
    });
  }

  getPlacesDisponibles(): number {
    if (!this.event) return 0;
    return this.event.placesDisponibles || this.event.capacite || 0;
  }
}