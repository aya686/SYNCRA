import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { EventDisplay } from '../../../shared/models/event.model';

@Component({
    selector: 'app-event-list',
    templateUrl: './event-list.component.html',
    styleUrls: ['./event-list.component.css'],
    standalone: false
})
export class EventListComponent implements OnInit {
  events: EventDisplay[] = [];
  filteredEvents: EventDisplay[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  loading: boolean = false;

  get totalEvents(): number {
    return this.events.length;
  }

  get planifieCount(): number {
    return this.events.filter(e => e.statut === 'planifie').length;
  }

  get termineCount(): number {
    return this.events.filter(e => e.statut === 'termine').length;
  }

  constructor(
    private eventService: EventService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

loadEvents(): void {
  this.loading = true;
  this.eventService.getEvents().subscribe({
    next: (events) => {
      console.log('=== VÉRIFICATION DES IDS ===');
      events.forEach(event => {
        console.log(`Titre: ${event.titre}, ID: ${event.id}, Type: ${typeof event.id}`);
      });
      this.events = events;
      this.filteredEvents = events;
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur:', err);
      this.loading = false;
    }
  });
}

  filterEvents(): void {
    this.filteredEvents = this.events.filter(event => {
      const matchesSearch = !this.searchTerm || 
        event.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || event.statut === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  deleteEvent(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          this.loadEvents();
          this.notificationService.success('Événement supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.notificationService.error('Impossible de supprimer l\'événement');
        }
      });
    }
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

  getEventProgress(event: EventDisplay): number {
    const today = new Date();
    const start = new Date(event.dateDebut);
    const end = new Date(event.dateFin);
    
    if (today < start) return 0;
    if (today > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  }

  getEventDaysLeft(event: EventDisplay): number {
    const today = new Date();
    const end = new Date(event.dateFin);
    
    if (today > end) return 0;
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getTotalParticipants(): number {
    return 128;
  }
}