// src/app/modules/events/components/event-detail/event-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { EventDisplay, Inscription } from '../../../shared/models/event.model';
import { DataCollectorService } from '../../../shared/services/data-collector.service';
import { AuthService, User } from '../../../shared/services/auth.service';

@Component({
    selector: 'app-event-detail',
    templateUrl: './event-detail.component.html',
    styleUrls: ['./event-detail.component.css'],
    standalone: false
})
export class EventDetailComponent implements OnInit {
  event: EventDisplay | undefined;
  inscriptions: Inscription[] = [];
  showInscriptionForm: boolean = false;
  loading: boolean = false;
  
  newInscription: Partial<Inscription> = {
    participantId: 0,
    nom: '',
    email: '',
    statut: 'en_attente',
    presence: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private notificationService: NotificationService,
    private dataCollector: DataCollectorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      const eventId = parseInt(id, 10);
      
      if (!isNaN(eventId)) {
        console.log('Chargement événement ID:', eventId);
        this.loadEvent(eventId);
        this.loadInscriptions(eventId);
      } else {
        console.error('ID invalide:', id);
        this.notificationService.error('ID d\'événement invalide');
        this.router.navigate(['/admin/events']);
      }
    } else {
      console.error('Aucun ID trouvé dans l\'URL');
      this.notificationService.error('Aucun événement spécifié');
      this.router.navigate(['/admin/events']);
    }
  }

  loadEvent(id: number): void {
    this.loading = true;
    console.log('Appel API getEvent avec ID:', id);
    
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        console.log('Événement reçu:', event);
        this.event = event;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement événement:', err);
        this.notificationService.error('Impossible de charger l\'événement');
        this.loading = false;
        this.router.navigate(['/admin/events']);
      }
    });
  }

  loadInscriptions(eventId: number): void {
    this.eventService.getInscriptions(eventId).subscribe({
      next: (inscriptions) => {
        this.inscriptions = inscriptions;
        console.log('Inscriptions chargées:', inscriptions.length);
      },
      error: (err) => {
        console.error('Erreur chargement inscriptions:', err);
        this.inscriptions = [];
      }
    });
  }

  async inscrire(): Promise<void> {
    if (this.event && this.newInscription.participantId && this.newInscription.participantId > 0) {
      const inscription: Inscription = {
        id: 0,
        eventId: this.event.id,
        participantId: this.newInscription.participantId,
        nom: this.newInscription.nom || `Participant ${this.newInscription.participantId}`,
        email: this.newInscription.email || `participant${this.newInscription.participantId}@example.com`,
        dateInscription: new Date(),
        statut: 'confirme',
        presence: false
      };
      
      this.eventService.inscrireParticipant(inscription).subscribe({
        next: async () => {
          this.notificationService.success('Inscription confirmée !');
          this.showInscriptionForm = false;
          this.loadInscriptions(this.event!.id);
          this.newInscription = { 
            participantId: 0, 
            nom: '', 
            email: '', 
            statut: 'en_attente', 
            presence: false 
          };
          
          // ✅ CORRECTION: Convertir EventDisplay en objet compatible avec recordInteraction
          const currentUser = this.authService.getCurrentUser();
          if (currentUser && this.event) {
            const agent = {
              type: this.getUserTypeFromRole(currentUser.role),
              budget: 500,
              comportement: {
                priceSensitivity: 0.5,
                spontaneity: 0.5,
                loyalty: 0.5
              }
            };
            
            // ✅ Créer un objet compatible avec PublicEvent
            const compatibleEvent = {
              id: this.event.id,
              titre: this.event.titre,
              type: this.event.type,
              prix: this.event.prix,
              placesDisponibles: this.event.capaciteMax - this.inscriptions.length, 
              capaciteMax: this.event.capaciteMax,
              description: this.event.description || '',
              dateDebut: this.event.dateDebut,
              dateFin: this.event.dateFin,
              lieu: this.event.lieu,
              populariteReelle: this.inscriptions.length / this.event.capaciteMax
            };
            
            try {
              await this.dataCollector.recordInteraction(
                agent,
                compatibleEvent,  // ✅ Utiliser l'objet compatible
                true,
                'register'
              );
              console.log('✅ Interaction enregistrée pour l\'IA');
            } catch (error) {
              console.error('Erreur enregistrement interaction:', error);
            }
          }
        },
        error: (err) => {
          console.error('Erreur inscription:', err);
          this.notificationService.error('Impossible d\'inscrire le participant');
        }
      });
    } else {
      this.notificationService.warning('Veuillez entrer un ID de participant valide');
    }
  }

  private getUserTypeFromRole(role: string): 'etudiant' | 'professionnel' | 'curieux' | 'expert' {
    switch(role) {
      case 'admin': return 'professionnel';
      case 'user': return 'etudiant';
      default: return 'curieux';
    }
  }

  marquerPresence(inscriptionId: number): void {
    this.eventService.updatePresence(inscriptionId, true).subscribe({
      next: () => {
        this.notificationService.success('Présence marquée');
        this.loadInscriptions(this.event!.id);
      },
      error: (err) => {
        console.error('Erreur mise à jour présence:', err);
        this.notificationService.error('Impossible de marquer la présence');
      }
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
      this.eventService.deleteEvent(this.event.id).subscribe({
        next: () => {
          this.notificationService.success('Événement supprimé');
          this.router.navigate(['/admin/events']);
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.notificationService.error('Impossible de supprimer l\'événement');
        }
      });
    }
  }
}