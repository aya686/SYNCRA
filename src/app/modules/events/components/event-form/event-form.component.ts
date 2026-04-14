import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../../services/event.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { MapPickerComponent } from './map-picker.component';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MapPickerComponent],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  event: any = {
    titre: '',
    description: '',
    type: '',
    lieu: '',
    dateDebut: '',
    dateFin: '',
    capaciteMax: null,
    prix: 0,
    statut: 'planifie',
    latitude: null,
    longitude: null,
    imageUrl: null
  };
  
  isEditMode: boolean = false;
  eventId: number = 0;
  loading: boolean = false;
  submitted: boolean = false;
  
  // Propriétés pour l'image
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  errorMessages: { [key: string]: { [key: string]: string } } = {
    titre: {
      required: 'Le titre est obligatoire',
      minlength: 'Le titre doit contenir au moins 3 caractères',
      maxlength: 'Le titre ne peut pas dépasser 100 caractères'
    },
    type: {
      required: 'Le type d\'événement est obligatoire'
    },
    lieu: {
      required: 'Le lieu est obligatoire',
      minlength: 'Le lieu doit contenir au moins 2 caractères'
    },
    dateDebut: {
      required: 'La date de début est obligatoire'
    },
    capaciteMax: {
      required: 'La capacité maximale est obligatoire',
      min: 'La capacité doit être d\'au moins 1 personne',
      max: 'La capacité ne peut pas dépasser 10 000 personnes'
    },
    prix: {
      min: 'Le prix ne peut pas être négatif'
    }
  };

  constructor(
    private eventService: EventService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && id !== 'new' && !isNaN(Number(id))) {
        this.isEditMode = true;
        this.eventId = +id;
        this.loadEvent();
      } else {
        this.isEditMode = false;
        this.loading = false;
      }
    });
  }

  loadEvent(): void {
    this.loading = true;
    this.eventService.getEvent(this.eventId).subscribe({
      next: (event) => {
        this.event = {
          id: event.id,
          titre: event.titre,
          description: event.description,
          type: event.type,
          lieu: event.lieu,
          dateDebut: this.formatDateForInput(event.dateDebut),
          dateFin: this.formatDateForInput(event.dateFin),
          capaciteMax: event.capaciteMax,
          statut: event.statut,
          latitude: (event as any).latitude || null,
          longitude: (event as any).longitude || null,
          imageUrl: (event as any).imageUrl || null
        };
        if (this.event.imageUrl) {
          this.imagePreview = this.event.imageUrl;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.notificationService.error('Impossible de charger l\'événement');
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

    if (errors['required']) return messages['required'] || 'Ce champ est obligatoire';
    if (errors['minlength']) return messages['minlength'] || `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return messages['maxlength'] || `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['min']) return messages['min'] || `La valeur minimale est ${errors['min'].min}`;
    if (errors['max']) return messages['max'] || `La valeur maximale est ${errors['max'].max}`;
    
    return 'Ce champ est invalide';
  }

  validateFutureDate(dateStr: string): boolean {
    if (!dateStr) return true;
    const selectedDate = new Date(dateStr);
    const now = new Date();
    return selectedDate > now;
  }

  validateDateOrder(): boolean {
    if (!this.event.dateDebut || !this.event.dateFin) return true;
    const start = new Date(this.event.dateDebut);
    const end = new Date(this.event.dateFin);
    return end > start;
  }

  onLocationSelected(location: {lat: number, lng: number, address: string}): void {
    console.log('=== LOCATION SELECTED ===');
    console.log('Adresse:', location.address);
    console.log('Latitude:', location.lat);
    console.log('Longitude:', location.lng);
    
    this.event.lieu = location.address;
    this.event.latitude = location.lat;
    this.event.longitude = location.lng;
    
    console.log('Event après mise à jour:', this.event);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadImage(): Promise<string | null> {
    if (!this.selectedFile) return null;
    
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    
    try {
      const response: any = await this.http.post('http://localhost:8089/event_db/api/images/upload', formData).toPromise();
      return response.imageUrl;
    } catch (error) {
      console.error('Erreur upload:', error);
      this.notificationService.error('Erreur lors de l\'upload de l\'image');
      return null;
    }
  }

  async onSubmit(form: NgForm): Promise<void> {
  this.submitted = true;
  
  if (form.invalid) {
    this.notificationService.warning('Veuillez corriger les erreurs dans le formulaire');
    return;
  }
  
  if (!this.validateFutureDate(this.event.dateDebut)) {
    this.notificationService.error('La date de début doit être dans le futur');
    return;
  }

  this.loading = true;

  let imageUrl = this.event.imageUrl;
  
  // Upload image si sélectionnée
  if (this.selectedFile) {
    const uploadedUrl = await this.uploadImage();
    if (uploadedUrl) {
      imageUrl = uploadedUrl;
      console.log('Image uploadée, URL:', imageUrl);
    }
  }

  console.log('Image URL finale:', imageUrl);

  const eventData = {
    titre: this.event.titre,
    description: this.event.description,
    type: this.event.type,
    lieu: this.event.lieu,
    dateDebut: this.event.dateDebut,
    dateFin: this.event.dateFin,
    capaciteMax: this.event.capaciteMax,
    prix: this.event.prix,
    statut: this.event.statut,
    latitude: this.event.latitude,
    longitude: this.event.longitude,
    imageUrl: imageUrl  // ← Assure-toi que c'est bien envoyé
  };

  console.log('Données envoyées:', eventData);

  if (this.isEditMode) {
    this.eventService.updateEvent(this.eventId, eventData).subscribe({
      next: () => {
        this.notificationService.success('Événement modifié avec succès');
        this.router.navigate(['/admin/events']);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.notificationService.error('Erreur lors de la modification');
        this.loading = false;
      }
    });
  } else {
    this.eventService.createEvent(eventData).subscribe({
      next: (response) => {
        console.log('Événement créé:', response);
        this.notificationService.success('Événement créé avec succès');
        this.router.navigate(['/admin/events']);
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
    this.router.navigate(['/admin/events']);
  }
}