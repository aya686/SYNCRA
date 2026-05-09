import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormationService } from '../../services/formation.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Session, Participation, Competence } from '../../../shared/models/formation.model';

@Component({
    selector: 'app-session-detail',
    templateUrl: './session-detail.component.html',
    styleUrls: ['./session-detail.component.css'],
    standalone: false
})
export class SessionDetailComponent implements OnInit {
  session: Session | undefined;
  participations: Participation[] = [];
  competences: Competence[] = [];
  showInscriptionForm: boolean = false;
  showParticipantsList: boolean = false;
  participants: any[] = [];
  newParticipation: Partial<Participation> = {
    participantId: 0,
    statut: 'inscrit',
    progression: 0
  };
  showEvaluationForm: boolean = false;
  evaluation = {
    note: 0,
    commentaire: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadSession(id);
      this.loadParticipations(id);
    });
  }

 // session-detail.component.ts

loadSession(id: number): void {
  this.formationService.getSession(id).subscribe(session => {
    if (session) {
      this.session = session;
      // ✅ DÉCOMMENTER
      this.loadCompetences(session.formationId);
      this.loadParticipantsByFormation(session.formationId);
    } else {
      this.notificationService.error('Session non trouvée');
      this.router.navigate(['/admin/formations']);
    }
  });
}

loadParticipations(sessionId: number): void {
  // ✅ DÉCOMMENTER
  this.formationService.getParticipations(sessionId).subscribe(participations => {
    this.participations = participations;
  });
}

  // session-detail.component.ts

loadParticipantsByFormation(formationId: number): void {
  console.log('📞 Chargement participants pour formation:', formationId);
  
  this.formationService.getParticipantsByFormation(formationId).subscribe({
    next: (participants) => {
      // ✅ Filtrer les participants invalides
      this.participants = participants.filter(p => p.nom && p.nom !== 'null' && p.email);
      console.log('✅ Participants chargés:', this.participants.length);
    },
    error: (err) => {
      console.error('❌ Erreur:', err);
      // ✅ En cas d'erreur, participants vide
      this.participants = [];
    }
  });
}

  toggleParticipantsList(): void {
    this.showParticipantsList = !this.showParticipantsList;
  }

  loadCompetences(formationId: number): void {
    this.formationService.getCompetences(formationId).subscribe(competences => {
      this.competences = competences;
    });
  }


  inscrire(): void {
    if (this.session && this.newParticipation.participantId) {
      const participation: Participation = {
        id: 0,
        sessionId: this.session.id,
        participantId: this.newParticipation.participantId,
        dateInscription: new Date(),
        statut: 'inscrit',
        progression: 0
      };
      
      this.formationService.inscrireParticipant(participation).subscribe(() => {
        this.notificationService.success('Inscription confirmée !');
        this.showInscriptionForm = false;
        this.loadParticipations(this.session!.id);
        this.newParticipation = { participantId: 0, statut: 'inscrit', progression: 0 };
      });
    }
  }

  updateProgression(participationId: number, progression: number): void {
    this.formationService.updateProgression(participationId, progression).subscribe(() => {
      this.notificationService.success('Progression mise à jour');
      this.loadParticipations(this.session!.id);
    });
  }

  submitEvaluation(): void {
    this.notificationService.success('Évaluation soumise avec succès');
    this.showEvaluationForm = false;
    this.evaluation = { note: 0, commentaire: '' };
  }

  getStatutLabel(statut: string): string {
    const labels: {[key: string]: string} = {
      'inscrit': 'Inscrit',
      'present': 'Présent',
      'absent': 'Absent',
      'abandon': 'Abandon'
    };
    return labels[statut] || statut;
  }

  deleteSession(): void {
    if (this.session && confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      this.formationService.deleteSession(this.session.id).subscribe(() => {
        this.notificationService.success('Session supprimée');
        this.router.navigate(['/admin/formations']);
      });
    }
  }
}