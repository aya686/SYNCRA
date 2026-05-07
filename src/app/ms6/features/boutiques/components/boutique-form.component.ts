import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Boutique, BoutiqueRequest, BoutiqueService } from '../../boutiques';
import { NotificationService } from '../../../core';

@Component({
  selector: 'app-boutique-form',
  template: `
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Header -->
          <div class="d-flex align-items-center mb-4">
            <button class="btn btn-outline-secondary btn-sm me-3" (click)="goBack()">
              <i class="bi bi-arrow-left"></i>
            </button>
            <div>
              <h1 class="h3 mb-1">{{ isEdit ? 'Modifier' : 'Nouvelle' }} boutique</h1>
              <p class="text-muted mb-0">{{ isEdit ? 'Modifiez les informations de la boutique' : 'Créez une nouvelle boutique pour vos produits' }}</p>
            </div>
          </div>

          <!-- Form Card -->
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-shop me-2 text-primary"></i>Informations de la boutique</h5>
            </div>
            <div class="card-body p-4">
              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <!-- Nom -->
                <div class="mb-3">
                  <label class="form-label">Nom <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [class.is-invalid]="form.get('nom')?.invalid && form.get('nom')?.touched"
                    formControlName="nom" 
                    placeholder="Nom de la boutique">
                  <div class="invalid-feedback" *ngIf="form.get('nom')?.hasError('required')">
                    Le nom est obligatoire
                  </div>
                  <div class="invalid-feedback" *ngIf="form.get('nom')?.hasError('minlength')">
                    Minimum 2 caractères
                  </div>
                </div>

                <!-- Description -->
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea 
                    class="form-control" 
                    formControlName="description" 
                    rows="4" 
                    placeholder="Description de la boutique"></textarea>
                  <div class="form-text">Maximum 2000 caractères</div>
                </div>

                <!-- Theme -->
                <div class="mb-3">
                  <label class="form-label">Thème</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    formControlName="theme" 
                    placeholder="Thème visuel">
                </div>

                <!-- Logo Upload Section -->
                <div class="mb-3">
                  <label class="form-label">Logo</label>
                  
                  <!-- Logo Preview -->
                  <div class="mb-3" *ngIf="logoPreview">
                    <div class="position-relative d-inline-block">
                      <img [src]="logoPreview" class="rounded-3 border" style="max-height: 150px; max-width: 100%; object-fit: cover;" alt="Logo preview">
                      <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2" (click)="clearLogo()">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Logo Input Options -->
                  <div class="card border">
                    <div class="card-header bg-light">
                      <ul class="nav nav-tabs card-header-tabs">
                        <li class="nav-item">
                          <a class="nav-link" [class.active]="logoInputType === 'url'" (click)="setLogoInputType('url')" style="cursor: pointer;">
                            <i class="bi bi-link me-1"></i>URL
                          </a>
                        </li>
                        <li class="nav-item">
                          <a class="nav-link" [class.active]="logoInputType === 'file'" (click)="setLogoInputType('file')" style="cursor: pointer;">
                            <i class="bi bi-upload me-1"></i>Fichier
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div class="card-body">
                      <!-- URL Input -->
                      <div *ngIf="logoInputType === 'url'">
                        <input 
                          type="text" 
                          class="form-control" 
                          formControlName="logo" 
                          placeholder="https://example.com/logo.png"
                          (input)="onUrlChange()">
                        <div class="form-text">Entrez l'URL de votre logo (Google Images, etc.)</div>
                      </div>
                      
                      <!-- File Input -->
                      <div *ngIf="logoInputType === 'file'">
                        <input 
                          type="file" 
                          class="form-control" 
                          accept="image/*"
                          (change)="onFileSelected($event)">
                        <div class="form-text">Sélectionnez une image depuis votre ordinateur</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
                    <i class="bi bi-x-lg me-2"></i>Annuler
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary d-flex align-items-center gap-2"
                    [disabled]="form.invalid || loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm"></span>
                    <i *ngIf="!loading" class="bi" [class.bi-plus-lg]="!isEdit" [class.bi-check-lg]="isEdit"></i>
                    {{ isEdit ? 'Modifier' : 'Créer' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-label {
      font-weight: 500;
      color: #495057;
    }
    
    .form-control:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.2rem rgba(25, 118, 210, 0.25);
    }
    
    .card {
      border-radius: 0.75rem;
    }
    
    .card-header {
      border-radius: 0.75rem 0.75rem 0 0 !important;
    }
    
    .btn {
      border-radius: 0.5rem;
    }
  `],
  standalone: false
})
export class BoutiqueFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  boutiqueId?: number;
  loading = false;
  logoInputType: 'url' | 'file' = 'url';
  logoPreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private boutiqueService: BoutiqueService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    const idParam = this.route.snapshot.params['id'];
    // Check if id is a valid number (not "new" or undefined)
    this.boutiqueId = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;
    if (this.boutiqueId) {
      this.isEdit = true;
      this.loadBoutique();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(2000)],
      theme: [''],
      logo: ['']
    });
  }

  setLogoInputType(type: 'url' | 'file'): void {
    this.logoInputType = type;
    this.selectedFile = null;
    if (type === 'url') {
      this.form.get('logo')?.enable();
    }
  }

  onUrlChange(): void {
    const url = this.form.get('logo')?.value;
    if (url) {
      this.logoPreview = url;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      console.log('File selected:', this.selectedFile.name, 'Size:', this.selectedFile.size);
      
      // Check file size (max 100KB to avoid backend issues with base64)
      // Base64 encoding increases size by ~33%, so 100KB file becomes ~133KB string
      if (this.selectedFile.size > 100 * 1024) {
        this.notificationService.error('L\'image est trop grande. Taille maximum: 100KB. Veuillez choisir une image plus petite ou utiliser une URL.');
        this.selectedFile = null;
        input.value = ''; // Reset input
        return;
      }
      
      // Check file type
      if (!this.selectedFile.type.startsWith('image/')) {
        this.notificationService.error('Veuillez sélectionner une image (JPG, PNG, GIF)');
        this.selectedFile = null;
        input.value = '';
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
        console.log('Image loaded, base64 length:', this.logoPreview?.length);
        // Store base64 in form
        this.form.patchValue({ logo: this.logoPreview });
        this.notificationService.success('Image chargée avec succès');
      };
      reader.onerror = () => {
        console.error('FileReader error');
        this.notificationService.error('Erreur lors de la lecture du fichier');
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  clearLogo(): void {
    this.logoPreview = null;
    this.selectedFile = null;
    this.form.patchValue({ logo: '' });
  }

  loadBoutique(): void {
    if (this.boutiqueId) {
      this.boutiqueService.getBoutiqueById(this.boutiqueId).subscribe({
        next: (boutique) => {
          this.form.patchValue(boutique);
          if (boutique.logo) {
            this.logoPreview = boutique.logo;
          }
        },
        error: () => {
          this.notificationService.error('Erreur lors du chargement de la boutique');
          this.router.navigate(['/boutiques']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      console.log('Form is invalid:', this.form.errors);
      return;
    }

    this.loading = true;
    const request: BoutiqueRequest = this.form.value;
    
    console.log('Submitting boutique request:', request);
    console.log('Logo value:', request.logo ? `Present (length: ${request.logo.length})` : 'Empty');
    
    // Check if logo is too big for backend
    if (request.logo && request.logo.length > 50000) {
      console.warn('Logo base64 is very large:', request.logo.length, 'characters');
      this.notificationService.info('Logo très grand - cela peut causer des erreurs');
    }

    const operation = this.isEdit && this.boutiqueId
      ? this.boutiqueService.updateBoutique(this.boutiqueId, request)
      : this.boutiqueService.createBoutique(request);

    operation.subscribe({
      next: (response) => {
        console.log('Boutique saved successfully:', response);
        this.notificationService.success(`Boutique ${this.isEdit ? 'modifiée' : 'créée'} avec succès`);
        this.router.navigate(['/admin/boutiques']);
      },
      error: (err) => {
        console.error('Error saving boutique:', err);
        this.loading = false;
        if (err.status === 413) {
          this.notificationService.error('Image trop grande pour le serveur. Utilisez une URL ou une image plus petite (< 50KB).');
        } else if (err.status === 400) {
          this.notificationService.error('Données invalides. Vérifiez tous les champs.');
        } else if (err.status === 0) {
          this.notificationService.error('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
        } else {
          this.notificationService.error(`Erreur ${err.status}: ${err.error?.message || 'Erreur lors de la création'}`);
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/boutiques']);
  }
}
