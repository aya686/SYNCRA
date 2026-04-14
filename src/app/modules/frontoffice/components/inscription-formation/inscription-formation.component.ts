import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../shared/services/notification.service';
import { DesktopNotificationService } from '../../../shared/services/notification-desktop.service';

@Component({
  selector: 'app-inscription-formation',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './inscription-formation.component.html',
  styleUrls: ['./inscription-formation.component.css']
})
export class InscriptionFormationComponent implements OnInit {
  formationId: number = 0;
  formation: any = null;
  sessions: any[] = [];
  loading = false;
  submitted = false;
  inscriptionSuccess = false;

  inscription = {
    participant: {
      nom: '',
      email: '',
      telephone: '',
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
    this.route.params.subscribe(params => {
      const id = params['formationId'];
      if (id && !isNaN(Number(id))) {
        this.formationId = Number(id);
        this.loadFormationInfo();
        this.loadSessions();
      } else {
        this.notificationService.error('ID de formation invalide');
        this.router.navigate(['/formations']);
      }
    });
  }

  loadFormationInfo(): void {
    this.loading = true;
    this.http.get(`http://localhost:8089/event_db/api/formations/${this.formationId}`).subscribe({
      next: (formation: any) => {
        this.formation = formation;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement formation:', err);
        this.notificationService.error('Impossible de charger les informations de la formation');
        this.loading = false;
      }
    });
  }

  loadSessions(): void {
    this.http.get(`http://localhost:8089/event_db/api/sessions?formationId=${this.formationId}`).subscribe({
      next: (sessions: any) => {
        this.sessions = sessions || [];
        console.log('Sessions chargées:', this.sessions.length);
      },
      error: (err) => {
        console.error('Erreur chargement sessions:', err);
        this.sessions = [];
      }
    });
  }

  onSubmit(form: NgForm): void {
    this.submitted = true;

    if (form.invalid) {
      this.notificationService.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.loading = true;

    // 1. Créer le participant
    const participantData = {
      nom: this.inscription.participant.nom,
      email: this.inscription.participant.email,
      role: this.inscription.participant.role
    };

    this.http.post('http://localhost:8089/event_db/api/participants', participantData).subscribe({
      next: (participant: any) => {
        // 2. Créer l'inscription à la formation
        const inscriptionData = {
          participantId: participant.participantId,
          formationId: this.formationId,
          dateInscription: new Date().toISOString(),
          statut: 'inscrit',
          progression: 0,
          
          // Infos pour l'email
          email: this.inscription.participant.email,
          nomParticipant: this.inscription.participant.nom,
          formationTitle: this.formation.titre,
          formationNiveau: this.formation.niveau,
          formationDuree: this.formation.dureeHeures,
          formationPrix: this.formation.prix
        };

        console.log('Envoi inscription formation:', inscriptionData);

        this.http.post('http://localhost:8089/event_db/api/inscriptions-formation', inscriptionData).subscribe({
          next: (response: any) => {
            this.inscriptionSuccess = true;
            
            // Notification Toast
            this.notificationService.success(
              `Félicitations ! Vous êtes inscrit à la formation "${this.formation.titre}"`, 
              '🎓 Inscription confirmée'
            );
            
            // Notification Système
            if (this.desktopNotification.getPermission() === 'granted') {
              this.desktopNotification.sendNotification(
                '🎓 Inscription formation confirmée !',
                `Félicitations ${this.inscription.participant.nom} !\nVous êtes inscrit à la formation "${this.formation.titre}"\n📚 Niveau: ${this.formation.niveau}\n⏱️ Durée: ${this.formation.dureeHeures} heures`,
                '/favicon.ico'
              );
            }
            
            setTimeout(() => {
              this.router.navigate(['/formations', this.formationId]);
            }, 30000);
            this.loading = false;
          },
          error: (err) => {
            console.error('Erreur création inscription formation:', err);
            this.notificationService.error('Erreur lors de l\'inscription à la formation');
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Erreur création participant:', err);
        this.notificationService.error('Erreur lors de la création du participant');
        this.loading = false;
      }
    });
  }

  getFormationLevelClass(): string {
    if (!this.formation) return '';
    switch (this.formation.niveau) {
      case 'debutant': return 'level-debutant';
      case 'intermediaire': return 'level-intermediaire';
      case 'avance': return 'level-avance';
      default: return '';
    }
  }
}