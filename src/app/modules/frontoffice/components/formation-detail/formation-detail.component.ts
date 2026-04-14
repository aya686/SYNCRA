import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PublicFormationService } from '../../services/public-formation.service';
import { FormationService } from '../../../formations/services/formation.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './formation-detail.component.html',
  styleUrls: ['./formation-detail.component.css']
})
export class FormationDetailComponent implements OnInit {
  formation: any = null;
  sessions: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private publicFormationService: PublicFormationService,
    private formationService: FormationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    console.log('ID formation:', id);
    
    if (id && !isNaN(Number(id))) {
      this.loadFormation(Number(id));
      this.loadSessions(Number(id));
    } else {
      this.notificationService.error('ID de formation invalide');
      this.loading = false;
    }
  }

  loadFormation(id: number): void {
    this.loading = true;
    this.publicFormationService.getFormation(id).subscribe({
      next: (formation) => {
        this.formation = formation;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement formation:', err);
        this.notificationService.error('Impossible de charger la formation');
        this.loading = false;
      }
    });
  }

  loadSessions(formationId: number): void {
    this.formationService.getSessions(formationId).subscribe({
      next: (sessions) => {
        this.sessions = sessions || [];
        console.log('Sessions chargées:', this.sessions.length);
      },
      error: (err) => {
        console.error('Erreur chargement sessions:', err);
        this.sessions = [];
      }
    });
  }
}