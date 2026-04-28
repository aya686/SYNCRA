import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../shared/services/notification.service';
import { DesktopNotificationService } from '../../../shared/services/notification-desktop.service';
import { SimpleAuthService } from '../../../auth/services/simple-auth.service';

@Component({
  selector: 'app-inscription-formation',
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
  selectedSessionId: number = 0; 
    paymentInfo = {
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  };
  
  paymentErrors = {
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  };
  
  paymentSubmitted = false;

  inscription = {
    participant: {
      prenom: '',
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
    public desktopNotification: DesktopNotificationService,
      private authService: SimpleAuthService
  ) {}

  ngOnInit(): void {
    // ✅ PRÉ-REMPLIR LE FORMULAIRE AVEC LES INFOS DE L'UTILISATEUR CONNECTÉ
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.inscription.participant.nom = currentUser.nom;
      this.inscription.participant.email = `${currentUser.nom.toLowerCase().replace(' ', '.')}@example.com`;
    }

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
// inscription-formation.component.ts - Ajoutez/modifiez ces méthodes

// ✅ MODIFIER les méthodes de validation pour recevoir la valeur directement
// inscription-formation.component.ts - Ajoutez/modifiez ces méthodes

// ✅ MODIFIER les méthodes de validation pour recevoir la valeur directement
validateCardNumber(value: string): boolean {
  // Supprimer les espaces
  const clean = value.replace(/\s/g, '');
  // Vérifier 16 chiffres
  const isValid = /^\d{16}$/.test(clean);
  this.paymentErrors.cardNumber = isValid ? '' : 'Numéro de carte invalide (16 chiffres)';
  return isValid;
}

validateCardHolder(value: string): boolean {
  const isValid = value.trim().length >= 3;
  this.paymentErrors.cardHolder = isValid ? '' : 'Nom du titulaire invalide';
  return isValid;
}

// inscription-formation.component.ts - Corrigez cette méthode

validateExpiryDate(value: string): boolean {
  // Supprimer les espaces
  const clean = value.replace(/\s/g, '');
  let month: number;
  let year: number;
  
  if (clean.includes('/')) {
    const parts = clean.split('/');
    month = parseInt(parts[0], 10);
    year = parseInt(parts[1], 10);
  } else {
    month = parseInt(clean.substring(0, 2), 10);
    year = parseInt(clean.substring(2, 4), 10);
  }
  
  // ✅ RÉCUPÉRER L'ANNÉE COMPLÈTE (2026)
  const currentFullYear = new Date().getFullYear();
  const currentYear = currentFullYear % 100; // 26 pour 2026
  const currentMonth = new Date().getMonth() + 1;
  
  // ✅ CONVERTIR L'ANNÉE EN FORMAT COMPLET POUR COMPARAISON
  // Si année = 27, c'est 2027
  const fullYear = 2000 + year;
  
  console.log('Validation date:', { month, year: fullYear, currentYear: currentFullYear, currentMonth });
  
  let isValid = true;
  let errorMessage = '';
  
  if (isNaN(month) || isNaN(year)) {
    isValid = false;
    errorMessage = 'Format invalide. Utilisez MM/AA';
  } else if (month < 1 || month > 12) {
    isValid = false;
    errorMessage = 'Mois invalide (1-12)';
  } else if (fullYear < currentFullYear) {
    isValid = false;
    errorMessage = 'Carte expirée (année)';
  } else if (fullYear === currentFullYear && month < currentMonth) {
    isValid = false;
    errorMessage = 'Carte expirée (mois)';
  }
  
  this.paymentErrors.expiryDate = isValid ? '' : errorMessage || 'Date d\'expiration invalide (MM/AA)';
  return isValid;
}

validateCVV(value: string): boolean {
  const isValid = /^\d{3}$/.test(value);
  this.paymentErrors.cvv = isValid ? '' : 'CVV invalide (3 chiffres)';
  return isValid;
}

// ✅ MODIFIER les méthodes de formatage
onCardNumberInput(event: any): void {
  let value = event.target.value.replace(/\s/g, '');
  if (value.length > 16) value = value.slice(0, 16);
  const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
  this.paymentInfo.cardNumber = formatted;
  this.validateCardNumber(value);
}

onExpiryDateInput(event: any): void {
  let value = event.target.value.replace(/\s/g, '');
  
  // Supprimer tout ce qui n'est pas un chiffre
  value = value.replace(/[^\d]/g, '');
  
  // Limiter à 4 chiffres
  if (value.length > 4) value = value.slice(0, 4);
  
  // Ajouter automatiquement le / après 2 chiffres
  if (value.length >= 3 && !value.includes('/')) {
    value = value.slice(0, 2) + '/' + value.slice(2);
  }
  
  this.paymentInfo.expiryDate = value;
  
  // Valider seulement si complet
  if (value.length === 5) { // MM/AA = 5 caractères
    this.validateExpiryDate(value);
  } else {
    this.paymentErrors.expiryDate = ''; // Effacer l'erreur tant que pas complet
  }
}

onCardHolderBlur(): void {
  this.validateCardHolder(this.paymentInfo.cardHolder);
}

onCardNumberBlur(): void {
  this.validateCardNumber(this.paymentInfo.cardNumber.replace(/\s/g, ''));
}

onExpiryDateBlur(): void {
  this.validateExpiryDate(this.paymentInfo.expiryDate.replace(/\s/g, ''));
}

onCvvBlur(): void {
  this.validateCVV(this.paymentInfo.cvv);
}
// Ajouter cette méthode
resetForm(): void {
  this.inscription = {
    participant: {
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      role: 'participant'
    },
    commentaire: ''
  };
  this.paymentInfo = {
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  };
  this.paymentErrors = {
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  };
  this.submitted = false;
  this.paymentSubmitted = false;
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

  // inscription-formation.component.ts

// inscription-formation.component.ts

// inscription-formation.component.ts - Modifiez onSubmit()

onSubmit(form: NgForm): void {
  this.submitted = true;
  this.paymentSubmitted = true;

  if (form.invalid) {
    this.notificationService.warning('Veuillez remplir tous les champs obligatoires');
    this.loading = false;
    return;
  }

  this.loading = true;

  const currentUser = this.authService.getCurrentUser();
  
  if (!currentUser) {
    this.notificationService.error('Vous devez être connecté pour vous inscrire');
    this.router.navigate(['/login']);
    this.loading = false;
    return;
  }

  const participantId = currentUser.id;
  const fullName = this.inscription.participant.nom || '';
  const nameParts = fullName.trim().split(' ');
  const prenom = nameParts[0] || '';
  const nom = nameParts.slice(1).join(' ') || '';

  // ✅ Validation paiement si formation payante
  if (this.formation?.prix > 0) {
    const isCardValid = this.validateCardNumber(this.paymentInfo.cardNumber.replace(/\s/g, ''));
    const isHolderValid = this.validateCardHolder(this.paymentInfo.cardHolder);
    const isExpiryValid = this.validateExpiryDate(this.paymentInfo.expiryDate);
    const isCvvValid = this.validateCVV(this.paymentInfo.cvv);
    
    if (!this.paymentInfo.cardNumber || !this.paymentInfo.cardHolder || 
        !this.paymentInfo.expiryDate || !this.paymentInfo.cvv) {
      this.notificationService.warning('Veuillez remplir tous les champs de paiement');
      this.loading = false;
      return;
    }
    
    if (!isCardValid || !isHolderValid || !isExpiryValid || !isCvvValid) {
      this.notificationService.warning('Veuillez vérifier vos informations de paiement');
      this.loading = false;
      return;
    }
  }

  const inscriptionData = {
    participantId: participantId,
    nom: nom,
    prenom: prenom,
    email: this.inscription.participant.email,
    telephone: this.inscription.participant.telephone || '',
    message: this.inscription.commentaire || '',
    formationId: this.formationId,
    sessionId: this.selectedSessionId || null,
    paymentInfo: this.formation?.prix > 0 ? {
      cardNumber: this.paymentInfo.cardNumber ? this.paymentInfo.cardNumber.slice(-4) : '',
      cardHolder: this.paymentInfo.cardHolder || '',
      expiryDate: this.paymentInfo.expiryDate || ''
    } : null
  };

  console.log('Envoi inscription formation:', inscriptionData);

  this.http.post('http://localhost:8089/event_db/api/inscriptions-formation', inscriptionData).subscribe({
    next: (response: any) => {
      this.inscriptionSuccess = true;
      this.resetForm();
      this.notificationService.success(`Félicitations ! Vous êtes inscrit à la formation "${this.formation.titre}"`, '🎓 Inscription confirmée');
      
      setTimeout(() => {
        this.router.navigate(['/formations', this.formationId]);
      }, 3000);
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur création inscription formation:', err);
      this.notificationService.error('Erreur lors de l\'inscription à la formation');
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