// src/app/modules/admin/components/event-generator/event-generator.component.ts
import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { AiEventGeneratorService, GeneratedEvent, CategoryStats } from '../../../modules/admin/services/ai-event-generator.service';
import { NotificationService } from '../../../modules/shared/services/notification.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DecimalPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// ❌ SUPPRIMER ces imports car ils ne sont plus nécessaires
// import { CommonModule, DecimalPipe, DatePipe, TitleCasePipe } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-event-generator',
   standalone: true,  // ← SUPPRIMER cette ligne
  imports: [CommonModule, FormsModule, RouterModule, DecimalPipe, DatePipe, TitleCasePipe], // ← SUPPRIMER cette ligne
  templateUrl: './event-generator.component.html',
  styleUrls: ['./event-generator.component.scss']
})
export class EventGeneratorComponent implements OnInit {
  categories = [
    { value: 'conference', label: '🎤 Conférence', icon: '🎤' },
    { value: 'workshop', label: '🔧 Workshop', icon: '🔧' },
    { value: 'webinaire', label: '💻 Webinaire', icon: '💻' },
    { value: 'hackathon', label: '🚀 Hackathon', icon: '🚀' },
    { value: 'formation', label: '📚 Formation', icon: '📚' },
    { value: 'meetup', label: '🤝 Meetup', icon: '🤝' }
  ];
  
  selectedCategory = '';
  generatedEvent: GeneratedEvent | null = null;
  categoryStats: CategoryStats | null = null;
  isLoading = false;
  isAnalyzing = false;
  showStats = false;
selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;
  
  // Mode édition
  isEditing = false;
  editableEvent: Partial<GeneratedEvent> = {};
  
  constructor(
    private aiGenerator: AiEventGeneratorService,
    private notificationService: NotificationService,
    private router: Router,  // ← AJOUTER
        private http: HttpClient,           // ← AJOUTER
    private cdr: ChangeDetectorRef

  ) {}
  
  ngOnInit() {
    // Sélectionner la première catégorie par défaut
    if (this.categories.length > 0) {
      this.selectedCategory = this.categories[0].value;
    }
  }
  
  async analyzeCategory() {
    if (!this.selectedCategory) return;
    
    this.isAnalyzing = true;
    this.showStats = true;
    
    try {
      this.categoryStats = await this.aiGenerator.analyzeCategory(this.selectedCategory);
      this.notificationService.success(`Analyse de la catégorie "${this.selectedCategory}" terminée`);
    } catch (error) {
      console.error('Erreur analyse:', error);
      this.notificationService.error('Erreur lors de l\'analyse');
    } finally {
      this.isAnalyzing = false;
    }
  }
   onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.notificationService.warning('L\'image est trop volumineuse (max 2MB)');
        return;
      }
      if (!file.type.startsWith('image/')) {
        this.notificationService.warning('Veuillez sélectionner une image');
        return;
      }
      
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }
  
  // ✅ AJOUTER LA MÉTHODE POUR UPLOADER L'IMAGE
  async uploadImage(): Promise<void> {
    if (!this.selectedFile) return;
    
    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    
    try {
      const response: any = await this.http.post('http://localhost:8089/event_db/api/images/upload', formData).toPromise();
      if (response && response.imageUrl) {
        if (this.generatedEvent) {
          this.generatedEvent.imageUrl = response.imageUrl;
          if (this.isEditing && this.editableEvent) {
            this.editableEvent.imageUrl = response.imageUrl;
          }
        }
        this.notificationService.success('Image ajoutée avec succès');
        this.selectedFile = null;
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      this.notificationService.error('Erreur lors de l\'upload');
    } finally {
      this.isUploading = false;
    }
  }
// event-generator.component.ts - Modifiez generateEvent()

async generateEvent() {
  if (!this.selectedCategory) {
    this.notificationService.warning('Veuillez sélectionner une catégorie');
    return;
  }
  
  this.isLoading = true;
  this.isEditing = false;
  
  // ✅ RÉINITIALISER L'IMAGE
  this.imagePreview = null;
  this.selectedFile = null;
  
  try {
    await this.delay(2000);

    this.generatedEvent = await this.aiGenerator.generateEvent(this.selectedCategory);
    this.notificationService.success('Événement généré avec succès !');
  } catch (error) {
    console.error('Erreur génération:', error);
    this.notificationService.error('Erreur lors de la génération');
  } finally {
    this.isLoading = false;
  }
}
  
  editEvent() {
    if (!this.generatedEvent) return;
    
    this.isEditing = true;
    this.editableEvent = { ...this.generatedEvent };
  }
  
  cancelEdit() {
    this.isEditing = false;
    this.editableEvent = {};
  }
  
saveEdit() {
    if (this.generatedEvent && this.editableEvent) {
      this.generatedEvent = {
        ...this.generatedEvent,
        ...this.editableEvent
      } as GeneratedEvent;
      
      this.isEditing = false;
      this.notificationService.success('Modifications enregistrées');
    }
  }
  
  async confirmAndSave() {
    if (!this.generatedEvent) return;
    
    const confirmMessage = `Confirmez-vous la création de l'événement ?
    
            Titre: ${this.generatedEvent.titre}
            Type: ${this.generatedEvent.type}
            Prix: ${this.generatedEvent.prix}€
            Capacité: ${this.generatedEvent.capacite}
            Lieu: ${this.generatedEvent.lieu}
            Popularité prédite: ${this.generatedEvent.predictedPopularity}%`;
    
    if (!confirm(confirmMessage)) return;
    
    this.isLoading = true;
    
    try {
      const saved = await this.aiGenerator.saveGeneratedEvent(this.generatedEvent);
      this.notificationService.success(`Événement "${this.generatedEvent.titre}" créé avec succès !`);
      
      // Réinitialiser pour nouvelle génération
      this.generatedEvent = null;
      this.categoryStats = null;
      this.showStats = false;
      this.imagePreview = null;
      this.selectedFile = null; 
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      this.notificationService.error('Erreur lors de la création');
    } finally {
      this.isLoading = false;
    }
  }
  
// event-generator.component.ts - Modifiez regenerate()

 async regenerate() {
    this.imagePreview = null;
    this.selectedFile = null;
    this.isLoading = true;
    
    try {
      await this.delay(1500);
      
      if (this.selectedCategory) {
        this.generatedEvent = await this.aiGenerator.generateEvent(this.selectedCategory);
        this.notificationService.success('Nouvel événement généré avec succès !');
      }
    } catch (error) {
      console.error('Erreur régénération:', error);
      this.notificationService.error('Erreur lors de la régénération');
    } finally {
      this.isLoading = false;
      this.isEditing = false;
    }
  }
  getCategoryIcon(category: string): string {
    const found = this.categories.find(c => c.value === category);
    return found ? found.icon : '📅';
  }
  
  getConfidenceClass(confidence: number): string {
    if (confidence >= 80) return 'high';
    if (confidence >= 60) return 'medium';
    return 'low';
  }
  
  getPopularityClass(popularity: number): string {
    if (popularity >= 70) return 'high';
    if (popularity >= 50) return 'medium';
    return 'low';
  }
  // event-generator.component.ts - Modifiez generateAndRedirect()
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
async generateAndRedirect() {
  if (!this.selectedCategory) return;
  
  this.isLoading = true;
  
  // ✅ RÉINITIALISER L'IMAGE
  this.imagePreview = null;
  this.selectedFile = null;
  
  try {
    await this.delay(2000);
    const generatedEvent = await this.aiGenerator.generateEvent(this.selectedCategory);
    localStorage.setItem('pendingGeneratedEvent', JSON.stringify(generatedEvent));
    this.router.navigate(['/admin/events/new'], { 
      queryParams: { generated: true }
    });
  } catch (error) {
    console.error('Erreur:', error);
    this.notificationService.error('Erreur lors de la génération');
  } finally {
    this.isLoading = false;
  }
}
}