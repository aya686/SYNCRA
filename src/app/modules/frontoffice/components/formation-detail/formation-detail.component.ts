import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PublicFormationService } from '../../services/public-formation.service';
import { FormationService } from '../../../formations/services/formation.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { JitsiMeetComponent } from '../../../shared/components/jitsi-meet/jitsi-meet.component';
import { SecretCodeModalComponent } from '../../../shared/components/secret-code-modal/secret-code-modal.component';
import { SimpleAuthService } from '../../../auth/services/simple-auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-formation-detail',
    templateUrl: './formation-detail.component.html',
    styleUrls: ['./formation-detail.component.css'],
    standalone: false
})
export class FormationDetailComponent implements OnInit {
  formation: any = null;
  sessions: any[] = [];
  loading = true;
  showLive = false;
  selectedSession: any = null;
  currentUser = { name: 'Participant', isModerator: false };
  showCodeModal = false;
  selectedSessionForCode: any = null;
  private apiUrl = 'http://localhost:8089/event_db/api/inscriptions';


  constructor(
    private route: ActivatedRoute,
    private publicFormationService: PublicFormationService,
    private formationService: FormationService,
    private notificationService: NotificationService,
    private authService: SimpleAuthService, 
    private http: HttpClient,
    
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
    this.currentUser.name = localStorage.getItem('userName') || 'Participant';
    this.currentUser.isModerator = localStorage.getItem('role') === 'formateur';
  }
  isSessionLive(session: any): boolean {
  const now = new Date();
  const start = new Date(session.dateDebut);
  const end = new Date(session.dateFin);
  return now >= start && now <= end;
}
 checkUserRegistration(userId: number, sessionId: number) {
  // URL CORRECTE
  return this.http.get<boolean>(`http://localhost:8089/event_db/api/inscriptions-formation/session/${sessionId}/user/${userId}/check`);
}
// formation-detail.component.ts

joinLive(session: any) {
    // Vérifier si l'utilisateur est connecté
    const userId = this.authService.getCurrentUser()?.id;
    
    if (!userId) {
      this.notificationService.error('❌ Veuillez vous connecter pour accéder au live.');
      return;
    }
    
    const sessionId = session.id;
    
    this.checkUserRegistration(userId, sessionId).subscribe({
      next: (isRegistered: boolean) => {
        if (!isRegistered) {
          this.notificationService.error(
            '❌ Vous devez être inscrit à cette formation pour accéder au live.'
          );
          return;
        }
        
        // SI INSCRIT → Continuer vers le live
        this.proceedToLive(session);
      },
      error: (err) => {
        console.error('Erreur de vérification:', err);
        this.notificationService.error('Erreur de vérification. Veuillez réessayer.');
      }
    });
  }

  private proceedToLive(session: any) {
    const sessionStarted = localStorage.getItem(`session_${session.id}_started`);
    
    if (!sessionStarted) {
      this.selectedSessionForCode = session;
      this.showCodeModal = true;
    } else {
      this.selectedSession = session;
      this.showLive = true;
    }
  }

  onCodeSuccess() {
    const session = this.selectedSessionForCode;
    localStorage.setItem(`session_${session.id}_started`, 'true');
    localStorage.setItem(`session_${session.id}_moderator`, localStorage.getItem('role') || 'admin');
    
    this.showCodeModal = false;
    this.openLiveRoom(session);
  }

  onCodeCancel() {
    this.showCodeModal = false;
    this.selectedSessionForCode = null;
  }

  private openLiveRoom(session: any) {
    this.selectedSession = session;
    this.showLive = true;
  }

  leaveLive() {
    this.showLive = false;
    this.selectedSession = null;
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
