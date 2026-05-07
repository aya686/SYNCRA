import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Produit, ProduitRequest, ProduitService } from '../../produits';
import { Boutique, BoutiqueService } from '../../boutiques';
import { NotificationService } from '../../../core';

@Component({
  selector: 'app-produit-form',
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex align-items-center mb-4">
        <button class="btn btn-outline-secondary btn-sm me-3" (click)="goBack()">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1 class="h3 mb-0">{{ isEdit ? 'Modifier' : 'Nouveau' }} produit</h1>
      </div>

      <div class="card shadow-sm border-0">
        <div class="card-body">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            
            <!-- Section: Informations générales -->
            <div class="mb-4">
              <h5 class="text-primary mb-3 border-bottom pb-2">
                <i class="bi bi-info-circle me-2"></i>Informations générales
              </h5>
              
              <div class="row g-3">
                <div class="col-md-12">
                  <label class="form-label">Nom du produit <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" formControlName="nom" 
                         [class.is-invalid]="form.get('nom')?.invalid && form.get('nom')?.touched"
                         placeholder="Nom du produit">
                  <div class="invalid-feedback" *ngIf="form.get('nom')?.hasError('required')">
                    Le nom est obligatoire
                  </div>
                </div>

                <div class="col-md-12">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" formControlName="description" rows="3" 
                            placeholder="Description du produit"></textarea>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Prix <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text">€</span>
                    <input type="number" class="form-control" formControlName="prix" 
                           [class.is-invalid]="form.get('prix')?.invalid && form.get('prix')?.touched"
                           placeholder="Prix" step="0.01">
                  </div>
                  <div class="invalid-feedback" *ngIf="form.get('prix')?.hasError('required')">
                    Le prix est obligatoire
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Boutique <span class="text-danger">*</span></label>
                  <select class="form-select" formControlName="boutiqueId"
                          [class.is-invalid]="form.get('boutiqueId')?.invalid && form.get('boutiqueId')?.touched">
                    <option value="">Sélectionnez une boutique</option>
                    <option *ngFor="let boutique of boutiques" [value]="boutique.boutiqueId">
                      {{ boutique.nom }}
                    </option>
                  </select>
                  <div class="invalid-feedback" *ngIf="form.get('boutiqueId')?.hasError('required')">
                    La boutique est obligatoire
                  </div>
                </div>

                <div class="col-md-12">
                  <label class="form-label">Catégories</label>
                  <input type="text" class="form-control" formControlName="categories" 
                         placeholder="Catégories (séparées par des virgules)">
                  <div class="form-text">Ex: Électronique, Téléphones, Accessoires</div>
                </div>
              </div>
            </div>

            <!-- Section: Images -->
            <div class="mb-4">
              <h5 class="text-primary mb-3 border-bottom pb-2">
                <i class="bi bi-image me-2"></i>Images du produit
              </h5>
              
              <!-- Image Preview -->
              <div class="mb-3" *ngIf="imagesPreview.length > 0">
                <div class="row g-2">
                  <div class="col-4 col-md-2" *ngFor="let img of imagesPreview; let i = index">
                    <div class="position-relative">
                      <img [src]="img" class="img-fluid rounded border" style="height: 100px; object-fit: cover; width: 100%;">
                      <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" 
                              (click)="removeImage(i)" title="Supprimer">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Image Input Options -->
              <div class="card bg-light border-0">
                <div class="card-body">
                  <!-- Option 1: URL -->
                  <div class="mb-3">
                    <label class="form-label">Ajouter par URL</label>
                    <div class="input-group">
                      <input type="text" class="form-control" [(ngModel)]="newImageUrl" 
                             [ngModelOptions]="{standalone: true}"
                             placeholder="https://example.com/image.jpg">
                      <button type="button" class="btn btn-outline-primary" (click)="addImageFromUrl()">
                        <i class="bi bi-plus-lg me-1"></i>Ajouter
                      </button>
                    </div>
                    <div class="form-text">Entrez l'URL d'une image (Google Images, etc.)</div>
                  </div>

                  <!-- Option 2: File Upload -->
                  <div>
                    <label class="form-label">Ou importer depuis votre ordinateur</label>
                    <input type="file" class="form-control" accept="image/*" (change)="onFileSelected($event)">
                    <div class="form-text">Taille maximum: 100KB. Formats acceptés: JPG, PNG, GIF</div>
                  </div>
                </div>
              </div>

              <!-- Hidden images field -->
              <input type="hidden" formControlName="images">
            </div>

            <!-- Section: Stock (only for create) -->
            <div class="mb-4" *ngIf="!isEdit">
              <h5 class="text-primary mb-3 border-bottom pb-2">
                <i class="bi bi-box-seam me-2"></i>Stock initial
              </h5>
              
              <div class="row g-3" formGroupName="stock">
                <div class="col-md-4">
                  <label class="form-label">Quantité</label>
                  <input type="number" class="form-control" formControlName="quantite" placeholder="0">
                </div>

                <div class="col-md-4">
                  <label class="form-label">Seuil d'alerte</label>
                  <input type="number" class="form-control" formControlName="seuilAlerte" placeholder="10">
                </div>

                <div class="col-md-4">
                  <label class="form-label">Entrepôt</label>
                  <input type="text" class="form-control" formControlName="entrepot" placeholder="Entrepôt principal">
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="d-flex justify-content-end gap-2 pt-3 border-top">
              <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
                <i class="bi bi-x-lg me-2"></i>Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-check-lg me-2" *ngIf="!loading"></i>
                {{ isEdit ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 0.75rem;
    }
    
    .form-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    .form-control, .form-select {
      border-radius: 0.5rem;
    }
    
    .btn {
      border-radius: 0.5rem;
    }
    
    .img-fluid {
      transition: transform 0.2s ease;
    }
    
    .img-fluid:hover {
      transform: scale(1.05);
    }
  `],
  standalone: false
})
export class ProduitFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  produitId?: number;
  loading = false;
  boutiques: Boutique[] = [];
  imagesPreview: string[] = [];
  newImageUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService,
    private boutiqueService: BoutiqueService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadBoutiques();
    
    const idParam = this.route.snapshot.params['id'];
    // Check if id is a valid number (not "new" or undefined)
    this.produitId = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;
    if (this.produitId) {
      this.isEdit = true;
      this.loadProduit();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      description: ['', Validators.maxLength(3000)],
      prix: ['', [Validators.required, Validators.min(0)]],
      boutiqueId: ['', Validators.required],
      categories: [''],
      images: [''],
      stock: this.fb.group({
        quantite: [0, Validators.min(0)],
        seuilAlerte: [0, Validators.min(0)],
        entrepot: ['']
      })
    });

    if (this.isEdit) {
      this.form.removeControl('stock');
    }
  }

  loadBoutiques(): void {
    this.boutiqueService.getAllBoutiques().subscribe({
      next: (boutiques) => this.boutiques = boutiques
    });
  }

  loadProduit(): void {
    if (this.produitId) {
      this.produitService.getProduitById(this.produitId).subscribe({
        next: (produit) => {
          this.form.patchValue(produit);
          // Load images preview
          if (produit.images) {
            this.imagesPreview = produit.images.split(',').map(img => img.trim()).filter(img => img);
          }
        },
        error: () => {
          this.notificationService.error('Erreur lors du chargement du produit');
          this.router.navigate(['/admin/produits']);
        }
      });
    }
  }

  addImageFromUrl(): void {
    if (this.newImageUrl.trim()) {
      this.imagesPreview.push(this.newImageUrl.trim());
      this.updateImagesField();
      this.newImageUrl = '';
      this.notificationService.success('Image ajoutée');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      console.log('File selected:', file.name, 'Size:', file.size);
      
      // Check file size (max 100KB)
      if (file.size > 100 * 1024) {
        this.notificationService.error('L\'image est trop grande. Taille maximum: 100KB');
        input.value = '';
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        this.notificationService.error('Veuillez sélectionner une image (JPG, PNG, GIF)');
        input.value = '';
        return;
      }
      
      // Read file as base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        console.log('Image loaded, base64 length:', base64.length);
        this.imagesPreview.push(base64);
        this.updateImagesField();
        this.notificationService.success('Image chargée avec succès');
      };
      reader.onerror = () => {
        this.notificationService.error('Erreur lors de la lecture du fichier');
      };
      reader.readAsDataURL(file);
      
      input.value = ''; // Reset input
    }
  }

  removeImage(index: number): void {
    this.imagesPreview.splice(index, 1);
    this.updateImagesField();
  }

  updateImagesField(): void {
    const imagesString = this.imagesPreview.join(',');
    this.form.patchValue({ images: imagesString });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      console.log('Form is invalid:', this.form.errors);
      return;
    }

    this.loading = true;
    const request: ProduitRequest = this.form.value;
    
    console.log('Submitting produit request:', request);

    const operation = this.isEdit && this.produitId
      ? this.produitService.updateProduit(this.produitId, request)
      : this.produitService.createProduit(request);

    operation.subscribe({
      next: (response) => {
        console.log('Produit saved successfully:', response);
        this.notificationService.success(`Produit ${this.isEdit ? 'modifié' : 'créé'} avec succès`);
        this.router.navigate(['/admin/produits']);
      },
      error: (err) => {
        console.error('Error saving produit:', err);
        this.loading = false;
        if (err.status === 413) {
          this.notificationService.error('Images trop grandes. Réduisez la taille ou utilisez des URLs.');
        } else if (err.status === 400) {
          this.notificationService.error('Données invalides. Vérifiez tous les champs.');
        } else if (err.status === 0) {
          this.notificationService.error('Erreur de connexion. Vérifiez que le backend est démarré.');
        } else {
          this.notificationService.error(`Erreur ${err.status}: ${err.error?.message || 'Erreur lors de la création'}`);
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/produits']);
  }
}
