import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { FormationService } from '../../services/formation.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-session-form',
  templateUrl: './session-form.component.html',
  styleUrls: ['./session-form.component.css']
})
export class SessionFormComponent implements OnInit {
  session: any = {
    lieu: '',
    formateur: '',
    dateDebut: '',
    dateFin: '',
    capaciteMax: null,
    statut: 'planifiee',
    formationId: 0
  };
  
  isEditMode: boolean = false;
  sessionId: number = 0;
  formationId: number = 0;
  formationTitre: string = '';
  loading: boolean = false;
  submitted: boolean = false;

  errorMessages: { [key: string]: { [key: string]: string } } = {
    lieu: {
      required: 'Le lieu est obligatoire',
      minlength: 'Le lieu doit contenir au moins 2 caractères'
    },
    formateur: {
      required: 'Le nom du formateur est obligatoire',
      minlength: 'Le nom doit contenir au moins 2 caractères'
    },
    dateDebut: {
      required: 'La date de début est obligatoire',
      future: 'La date doit être dans le futur'
    },
    dateFin: {
      required: 'La date de fin est obligatoire'
    },
    capaciteMax: {
      required: 'La capacité maximale est obligatoire',
      min: 'La capacité doit être d\'au moins 1 personne',
      max: 'La capacité ne peut pas dépasser 500 personnes'
    }
  };

  constructor(
    private formationService: FormationService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

// Ajoute cette méthode dans la classe SessionFormComponent
onTypeLieuChange(): void {
  if (this.session.typeLieu === 'en-ligne') {
    this.session.lieu = 'En ligne';
  } else {
    this.session.lieu = '';
  }
}

// Dans ngOnInit ou constructor, initialise typeLieu
ngOnInit(): void {
  this.route.params.subscribe(params => {
    if (params['id']) {
      this.isEditMode = true;
      this.sessionId = +params['id'];
      this.loadSession();
    } else if (params['formationId']) {
      this.formationId = +params['formationId'];
      this.session.formationId = this.formationId;
      this.loadFormationInfo();
    }
    // Initialiser typeLieu
    this.session.typeLieu = '';
  });
}
  

  loadFormationInfo(): void {
    this.formationService.getFormation(this.formationId).subscribe({
      next: (formation) => {
        this.formationTitre = formation.titre;
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  loadSession(): void {
    this.loading = true;
    this.formationService.getSession(this.sessionId).subscribe({
      next: (session) => {
        this.session = {
          id: session.id,
          formationId: session.formationId,
          lieu: session.lieu,
          formateur: session.formateur,
          dateDebut: this.formatDateForInput(session.dateDebut),
          dateFin: this.formatDateForInput(session.dateFin),
          capaciteMax: session.capaciteMax,
          statut: session.statut
        };
        this.formationId = session.formationId;
        this.loadFormationInfo();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.notificationService.error('Impossible de charger la session');
        this.loading = false;
      }
    });
  }

  formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  isInvalid(fieldName: string, form: NgForm): boolean {
    const field = form.controls[fieldName];
    return (field && field.invalid && (field.dirty || field.touched || this.submitted)) || false;
  }

  getErrorMessage(fieldName: string, form: NgForm): string {
    const field = form.controls[fieldName];
    if (!field || !(field.dirty || field.touched || this.submitted)) return '';
    
    const errors = field.errors;
    if (!errors) return '';

    const messages = this.errorMessages[fieldName];
    if (!messages) return 'Ce champ est invalide';

    if (errors['required']) return messages['required'];
    if (errors['minlength']) return messages['minlength'];
    if (errors['min']) return messages['min'];
    if (errors['max']) return messages['max'];
    
    return 'Ce champ est invalide';
  }

  validateDateOrder(): boolean {
    if (!this.session.dateDebut || !this.session.dateFin) return true;
    const start = new Date(this.session.dateDebut);
    const end = new Date(this.session.dateFin);
    return end > start;
  }

  validateFutureDate(): boolean {
    if (!this.session.dateDebut) return true;
    const selectedDate = new Date(this.session.dateDebut);
    const now = new Date();
    return selectedDate > now;
  }
cancel(): void {
  this.router.navigate(['/admin/formations']);
}
  onSubmit(form: NgForm): void {
  console.log('🔵 1. onSubmit appelé');
  console.log('🔵 2. formulaire valide?', form.valid);
  console.log('🔵 3. submitted avant:', this.submitted);
  
  this.submitted = true;
  
  console.log('🔵 4. submitted après:', this.submitted);
  console.log('🔵 5. session data:', JSON.stringify(this.session));
  
  if (form.invalid) {
    console.log('🔴 Formulaire invalide!');
    console.log('🔴 Erreurs:', form.errors);
    this.notificationService.warning('Veuillez corriger les erreurs dans le formulaire');
    return;
  }
  
  console.log('🔵 6. Validation date future...');
  if (!this.validateFutureDate()) {
    console.log('🔴 Date future invalide');
    this.notificationService.error('La date de début doit être dans le futur');
    return;
  }
  
  console.log('🔵 7. Validation ordre dates...');
  if (!this.validateDateOrder()) {
    console.log('🔴 Ordre dates invalide');
    this.notificationService.error('La date de fin doit être après la date de début');
    return;
  }

  console.log('🔵 8. Envoi au serveur...');
  console.log('🔵 9. isEditMode:', this.isEditMode);
  console.log('🔵 10. session.formationId:', this.session.formationId);
  
  this.loading = true;

  if (this.isEditMode) {
    console.log('🔵 MODE ÉDITION');
    this.formationService.updateSession(this.sessionId, this.session).subscribe({
      next: () => {
        console.log('✅ Session modifiée avec succès');
        this.notificationService.success('Session modifiée avec succès');
        this.router.navigate(['/admin/formations']);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur modification:', err);
        this.notificationService.error('Erreur lors de la modification');
        this.loading = false;
      }
    });
  } else {
    console.log('🔵 MODE CRÉATION');
    console.log('🔵 Données envoyées:', this.session);
    this.formationService.createSession(this.session).subscribe({
      next: (response) => {
        console.log('✅ Session créée avec succès', response);
        this.notificationService.success('Session créée avec succès');
        this.router.navigate(['/admin/formations']);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur création détaillée:', err);
        console.error('❌ Status:', err.status);
        console.error('❌ Message:', err.message);
        console.error('❌ Error body:', err.error);
        this.notificationService.error('Erreur lors de la création: ' + (err.error?.message || err.message));
        this.loading = false;
      }
    });
  }
}

}