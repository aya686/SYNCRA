import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Livraison, LivraisonRequest, LivraisonUpdateRequest, LivraisonService } from '../../livraisons';
import { Commande, CommandeService } from '../../commandes';
import { NotificationService } from '../../../core';

@Component({
  selector: 'app-livraison-form',
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
              <h1 class="h3 mb-1">{{ isEdit ? 'Modifier' : 'Nouvelle' }} livraison</h1>
              <p class="text-muted mb-0">{{ isEdit ? 'Modifiez les informations de la livraison' : 'Créez une nouvelle livraison pour une commande' }}</p>
            </div>
          </div>

          <!-- Form Card -->
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0"><i class="bi bi-truck me-2 text-primary"></i>Informations de livraison</h5>
            </div>
            <div class="card-body p-4">
              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <!-- Commande -->
                <div class="mb-3">
                  <label class="form-label">Commande <span class="text-danger">*</span></label>
                  <select class="form-select" formControlName="commandeId" [disabled]="isEdit"
                          [class.is-invalid]="form.get('commandeId')?.invalid && form.get('commandeId')?.touched">
                    <option value="">Sélectionnez une commande</option>
                    <option *ngFor="let cmd of commandes" [value]="cmd.commandeId">
                      #{{ cmd.commandeId }} - {{ cmd.montantTotal | currency:'EUR' }} ({{ cmd.statut }})
                    </option>
                  </select>
                  <div class="invalid-feedback">Commande obligatoire</div>
                </div>

                <!-- Adresse -->
                <div class="mb-3">
                  <label class="form-label">Adresse de livraison <span class="text-danger">*</span></label>
                  <textarea class="form-control" formControlName="adresse" rows="3"
                            [class.is-invalid]="form.get('adresse')?.invalid && form.get('adresse')?.touched"></textarea>
                  <div class="invalid-feedback">Adresse obligatoire</div>
                </div>

                <!-- Transporteur & Tracking -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Transporteur</label>
                    <input type="text" class="form-control" formControlName="transporteur" placeholder="Nom du transporteur">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Numéro de tracking</label>
                    <input type="text" class="form-control" formControlName="tracking" placeholder="N° de suivi">
                  </div>
                </div>

                <!-- Actions -->
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
                    <i class="bi bi-x-lg me-2"></i>Annuler
                  </button>
                  <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" [disabled]="form.invalid || loading">
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
    
    .form-control:focus, .form-select:focus {
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
export class LivraisonFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  livraisonId?: number;
  loading = false;
  commandes: Commande[] = [];

  constructor(
    private fb: FormBuilder,
    private livraisonService: LivraisonService,
    private commandeService: CommandeService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCommandes();

    const idParam = this.route.snapshot.params['id'];
    // Check if id is a valid number (not "new" or undefined)
    this.livraisonId = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;
    if (this.livraisonId) {
      this.isEdit = true;
      this.loadLivraison();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      commandeId: ['', Validators.required],
      adresse: ['', [Validators.required, Validators.maxLength(500)]],
      transporteur: [''],
      tracking: ['']
    });
  }

  loadCommandes(): void {
    console.log('Loading commandes with status CONFIRMEE...');
    this.commandeService.getAllCommandes('CONFIRMEE').subscribe({
      next: (commandes) => {
        console.log('Loaded commandes:', commandes);
        this.commandes = commandes;
        if (commandes.length === 0) {
          console.log('No confirmed commandes found, loading all...');
          this.loadAllCommandes();
        }
      },
      error: (err) => {
        console.error('Error loading confirmed commandes:', err);
        this.notificationService.error('Erreur lors du chargement des commandes');
        this.loadAllCommandes();
      }
    });
  }

  loadAllCommandes(): void {
    console.log('Loading all commandes...');
    this.commandeService.getAllCommandes().subscribe({
      next: (commandes) => {
        console.log('Loaded all commandes:', commandes);
        this.commandes = commandes;
      },
      error: (err) => {
        console.error('Error loading all commandes:', err);
        this.notificationService.error('Erreur lors du chargement de toutes les commandes');
      }
    });
  }

  loadLivraison(): void {
    if (!this.livraisonId) return;

    this.livraisonService.getLivraisonById(this.livraisonId).subscribe({
      next: (livraison) => {
        this.form.patchValue(livraison);
        this.form.get('commandeId')?.disable();
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement de la livraison');
        this.router.navigate(['/admin/livraisons']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;

    if (this.isEdit && this.livraisonId) {
      const request: LivraisonUpdateRequest = this.form.getRawValue();
      this.livraisonService.updateLivraison(this.livraisonId, request).subscribe({
        next: () => {
          this.notificationService.success('Livraison modifiée avec succès');
          this.router.navigate(['/admin/livraisons']);
        },
        error: () => {
          this.loading = false;
          this.notificationService.error('Erreur lors de la modification');
        }
      });
    } else {
      const request: LivraisonRequest = this.form.getRawValue();
      this.livraisonService.createLivraison(request).subscribe({
        next: () => {
          this.notificationService.success('Livraison créée avec succès');
          this.router.navigate(['/admin/livraisons']);
        },
        error: () => {
          this.loading = false;
          this.notificationService.error('Erreur lors de la création');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/livraisons']);
  }
}
