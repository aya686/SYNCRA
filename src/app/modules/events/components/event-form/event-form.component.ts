import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../../services/event.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { MapPickerComponent } from './map-picker.component';

@Component({
  selector: 'app-event-form',
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
      minlength: 'Le lieu doit contenir au moins 2 caractères',
      maxlength: 'Le lieu ne peut pas dépasser 200 caractères'
    },
    dateDebut: {
      required: 'La date de début est obligatoire'
    },
    dateFin: {
      required: 'La date de fin est obligatoire'
    },
    capaciteMax: {
      required: 'La capacité maximale est obligatoire',
      min: 'La capacité doit être d\'au moins 1 personne',
      max: 'La capacité ne peut pas dépasser 10 000 personnes'
    },
    prix: {
      min: 'Le prix ne peut pas être négatif'
    },
    statut: {
      required: 'Le statut est obligatoire'
    }
  };

  constructor(
    private eventService: EventService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // src/app/modules/events/components/event-form/event-form.component.ts

ngOnInit(): void {
  console.log('=== EventFormComponent INIT ===');
  
  // ✅ VÉRIFIER S'IL Y A UN ÉVÉNEMENT GÉNÉRÉ PAR L'IA
  const pendingEvent = localStorage.getItem('pendingGeneratedEvent');
  const isGenerated = this.route.snapshot.queryParams['generated'] === 'true';
  
  if (pendingEvent && isGenerated) {
    try {
      const generated = JSON.parse(pendingEvent);
      console.log('🎯 Événement généré par IA trouvé:', generated);
      
      // Remplir le formulaire avec les données générées
      this.event = {
        titre: generated.titre || '',
        description: generated.description || '',
        type: generated.type || '',
        lieu: generated.lieu || '',
        dateDebut: this.formatDateForInput(generated.dateDebut),
        dateFin: this.formatDateForInput(generated.dateFin),
        capaciteMax: generated.capacite || null,
        prix: generated.prix || 0,
        statut: 'planifie',
        latitude: generated.latitude || null,
        longitude: generated.longitude || null,
        imageUrl: generated.imageUrl || null
      };
      
      // Aperçu de l'image si disponible
      if (this.event.imageUrl) {
        this.imagePreview = this.event.imageUrl;
      }
      
      this.notificationService.success('Formulaire pré-rempli avec l\'événement généré par IA !');
      
      // Supprimer du localStorage après utilisation
      localStorage.removeItem('pendingGeneratedEvent');
      
    } catch (error) {
      console.error('Erreur parsing événement généré:', error);
    }
  }
  console.log('URL complète:', this.router.url);
  
  // ✅ Méthode robuste : extraire l'ID de l'URL
  const url = this.router.url;
  const editMatch = url.match(/\/admin\/events\/(\d+)\/edit/);
  const viewMatch = url.match(/\/admin\/events\/(\d+)$/);
  
  if (editMatch) {
    // Mode édition
    this.isEditMode = true;
    this.eventId = parseInt(editMatch[1], 10);
    console.log('✅ Mode édition détecté, ID:', this.eventId);
    this.loadEvent();
  } 
  else if (viewMatch && !url.includes('new')) {
    // Mode visualisation (si nécessaire)
    this.isEditMode = true;
    this.eventId = parseInt(viewMatch[1], 10);
    console.log('✅ Mode visualisation, ID:', this.eventId);
    this.loadEvent();
  }
  else if (url.includes('/new') || url.endsWith('/events')) {
    // Mode création
    this.isEditMode = false;
    this.loading = false;
    console.log('✅ Mode création');
  }
  else {
    // Fallback: utiliser paramMap
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.eventId = parseInt(id, 10);
      this.loadEvent();
    } else {
      this.isEditMode = false;
    }
  }
}
  loadEvent(): void {
    console.log('=== loadEvent() appelé avec ID:', this.eventId);
    this.loading = true;
    
    this.eventService.getEvent(this.eventId).subscribe({
      next: (event) => {
        console.log('Événement reçu:', event);
        
        this.event = {
          id: event.id,
          titre: event.titre,
          description: event.description || '',
          type: event.type,
          lieu: event.lieu,
          dateDebut: this.formatDateForInput(event.dateDebut),
          dateFin: this.formatDateForInput(event.dateFin),
          capaciteMax: event.capaciteMax,
          prix: event.prix || 0,
          statut: event.statut,
          latitude: (event as any).latitude || null,
          longitude: (event as any).longitude || null,
          imageUrl: (event as any).imageUrl || null
        };
        
        console.log('Formulaire rempli:', this.event);
        
        if (this.event.imageUrl) {
          this.imagePreview = this.event.imageUrl;
        }
        
        this.loading = false;
        this.cdr.detectChanges();
        this.notificationService.success('Événement chargé');
      },
      error: (err) => {
        console.error('Erreur chargement:', err);
        this.notificationService.error('Impossible de charger l\'événement');
        this.loading = false;
        this.router.navigate(['/admin/events']);
      }
    });
  }

  formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
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
    if (errors['maxlength']) return messages['maxlength'];
    if (errors['min']) return messages['min'];
    if (errors['max']) return messages['max'];
    
    return 'Ce champ est invalide';
  }

  validateDateOrder(): boolean {
    if (!this.event.dateDebut || !this.event.dateFin) return true;
    const start = new Date(this.event.dateDebut);
    const end = new Date(this.event.dateFin);
    return end > start;
  }

  onLocationSelected(location: {lat: number, lng: number, address: string}): void {
    this.event.lieu = location.address;
    this.event.latitude = location.lat;
    this.event.longitude = location.lng;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

// event-form.component.ts

async uploadImage(): Promise<string | null> {
    if (!this.selectedFile) return null;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    try {
        // ✅ UTILISER LA BONNE URL
        const response: any = await this.http.post('http://localhost:8089/event_db/api/images/upload', formData).toPromise();
        console.log('Upload réussi:', response);
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
      this.notificationService.warning('Veuillez remplir tous les champs');
      return;
    }

    this.loading = true;

    let imageUrl = this.event.imageUrl;
    if (this.selectedFile) {
      const uploadedUrl = await this.uploadImage();
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

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
      imageUrl: imageUrl
    };

    if (this.isEditMode) {
      this.eventService.updateEvent(this.eventId, eventData).subscribe({
        next: () => {
          this.notificationService.success('Événement modifié');
          this.router.navigate(['/admin/events']);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.notificationService.error('Erreur lors de la modification');
          this.loading = false;
        }
      });
    } else {
      this.eventService.createEvent(eventData).subscribe({
        next: () => {
          this.notificationService.success('Événement créé');
          this.router.navigate(['/admin/events']);
        },
        error: (err) => {
          console.error('Erreur:', err);
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