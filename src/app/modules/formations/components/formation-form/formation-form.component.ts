import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { FormationService } from '../../services/formation.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-formation-form',
  templateUrl: './formation-form.component.html',
  styleUrls: ['./formation-form.component.css']
})
export class FormationFormComponent implements OnInit {
  formation: any = {
    titre: '',
    description: '',
    dureeTotale: null,
    niveau: 'debutant',
    prix: 0,
    certificate: false,
    formateurId: null
  };
  
  formateurs: any[] = [];
  isEditMode: boolean = false;
  formationId: number = 0;
  loading: boolean = false;
  submitted: boolean = false;

  errorMessages: { [key: string]: { [key: string]: string } } = {
    titre: {
      required: 'Le titre est obligatoire',
      minlength: 'Le titre doit contenir au moins 3 caractères',
      maxlength: 'Le titre ne peut pas dépasser 100 caractères'
    },
    dureeTotale: {
      required: 'La durée est obligatoire',
      min: 'La durée doit être d\'au moins 1 heure',
      max: 'La durée ne peut pas dépasser 500 heures'
    },
    prix: {
      required: 'Le prix est obligatoire',
      min: 'Le prix ne peut pas être négatif'
    }
  };

  constructor(
    private formationService: FormationService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadFormateurs();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.formationId = +params['id'];
        this.loadFormation();
      }
    });
  }

  loadFormateurs(): void {
    this.http.get('http://localhost:8089/event_db/api/formations/formateurs').subscribe({
      next: (data: any) => {
        this.formateurs = data;
      },
      error: (err) => {
        console.error('Erreur chargement formateurs:', err);
      }
    });
  }

  loadFormation(): void {
    this.loading = true;
    this.formationService.getFormation(this.formationId).subscribe({
      next: (formation) => {
        this.formation = {
          id: formation.id,
          titre: formation.titre,
          description: formation.description,
          dureeTotale: formation.dureeTotale,
          niveau: formation.niveau,
          prix: formation.prix,
          certificate: formation.certificate,
          formateurId: (formation as any).formateurId || null
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.notificationService.error('Impossible de charger la formation');
        this.loading = false;
      }
    });
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

    if (errors['required']) return messages['required'] || 'Ce champ est obligatoire';
    if (errors['minlength']) return messages['minlength'] || `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return messages['maxlength'] || `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['min']) return messages['min'] || `La valeur minimale est ${errors['min'].min}`;
    if (errors['max']) return messages['max'] || `La valeur maximale est ${errors['max'].max}`;
    
    return 'Ce champ est invalide';
  }

  onSubmit(form: NgForm): void {
    this.submitted = true;
    
    if (form.invalid) {
      this.notificationService.warning('Veuillez corriger les erreurs dans le formulaire');
      const firstInvalid = document.querySelector('.ng-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    this.loading = true;

    const formationData = {
      titre: this.formation.titre,
      niveau: this.formation.niveau,
      dureeHeures: this.formation.dureeTotale,
      certificate: this.formation.certificate,
      prix: this.formation.prix,
      statut: 'active',
      formateur: this.formation.formateurId ? { formateurId: this.formation.formateurId } : null
    };

    if (this.isEditMode) {
      this.formationService.updateFormation(this.formationId, formationData).subscribe({
        next: () => {
          this.notificationService.success('Formation modifiée avec succès');
          this.router.navigate(['/admin/formations']);
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.notificationService.error('Erreur lors de la modification');
          this.loading = false;
        }
      });
    } else {
      this.formationService.createFormation(formationData).subscribe({
        next: (response) => {
          console.log('Formation créée:', response);
          this.notificationService.success('Formation créée avec succès');
          this.router.navigate(['/admin/formations']);
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur détaillée:', err);
          this.notificationService.error('Erreur lors de la création');
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/formations']);
  }
}