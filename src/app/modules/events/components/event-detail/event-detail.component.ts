import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Event, Inscription } from '../../../shared/models/event.model';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  event: Event | undefined;
  inscriptions: Inscription[] = [];
  showInscriptionForm: boolean = false;
  newInscription: Partial<Inscription> = {
    participantId: 0,
    statut: 'en_attente',
    presence: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadEvent(id);
      this.loadInscriptions(id);
    });
  }

  loadEvent(id: number): void {
    this.eventService.getEvent(id).subscribe(event => {
      if (event) {
        this.event = event;
      } else {
        this.notificationService.error('Événement non trouvé');
        this.router.navigate(['/events']);
      }
    });
  }

  loadInscriptions(eventId: number): void {
    this.eventService.getInscriptions(eventId).subscribe(inscriptions => {
      this.inscriptions = inscriptions;
    });
  }

  inscrire(): void {
    if (this.event && this.newInscription.participantId) {
      const inscription: Inscription = {
        id: 0,
        eventId: this.event.id,
        participantId: this.newInscription.participantId,
        dateInscription: new Date(),
        statut: 'confirme',
        presence: false
      };
      
      this.eventService.inscrireParticipant(inscription).subscribe(() => {
        this.notificationService.success('Inscription confirmée !');
        this.showInscriptionForm = false;
        this.loadInscriptions(this.event!.id);
        this.newInscription = { participantId: 0, statut: 'en_attente', presence: false };
      });
    }
  }

  marquerPresence(inscriptionId: number): void {
    this.eventService.updatePresence(inscriptionId, true).subscribe(() => {
      this.notificationService.success('Présence marquée');
      this.loadInscriptions(this.event!.id);
    });
  }

  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'planifie': 'Planifié',
      'en_cours': 'En cours',
      'termine': 'Terminé',
      'annule': 'Annulé'
    };
    return labels[status] || status;
  }

  deleteEvent(): void {
    if (this.event && confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.eventService.deleteEvent(this.event.id).subscribe(() => {
        this.notificationService.success('Événement supprimé');
        this.router.navigate(['/events']);
      });
    }
  }
}