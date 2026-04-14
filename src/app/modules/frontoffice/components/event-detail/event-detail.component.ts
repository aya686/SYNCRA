import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PublicEventService } from '../../services/public-event.service';
import { MapViewerComponent } from './map-viewer.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MapViewerComponent],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  event: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private eventService: PublicEventService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadEvent(id);
  }

  loadEvent(id: number): void {
    this.loading = true;
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        console.log('=== ÉVÉNEMENT CHARGÉ ===');
        console.log('Latitude:', event.latitude);
        console.log('Longitude:', event.longitude);
        console.log('Date fin:', event.dateFin);
        
        this.event = {
          ...event,
          latitude: event.latitude || null,
          longitude: event.longitude || null,
          dateFin: event.dateFin || event.dateDebut
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }
}