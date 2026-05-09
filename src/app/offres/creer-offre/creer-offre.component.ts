import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Offre, StatutOffre } from '../../models/offre.model';
import { Critere, TypeCritere } from '../../models/critere.model';
import { Categorie } from '../../models/categorie.model';
import { OffreService } from '../../services/offre.service';
import { CategorieService } from '../../services/categorie.service';
import { IaService } from '../../services/ia.service';

@Component({
  selector: 'app-creer-offre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './creer-offre.component.html',
  styleUrls: ['./creer-offre.component.scss']
})
export class CreerOffreComponent implements OnInit {
  currentStep = 1;
  totalSteps = 3;
  
  offreForm: FormGroup;
  categories: Categorie[] = [];
  typeCriteres = Object.values(TypeCritere);
  statutsOffres = Object.values(StatutOffre);
  
  loading = false;
  error = '';
  success = '';

  // Variables pour l'IA
  budgetPrediction: any = null;
  loadingPrediction = false;
  fraudeDetection: any = null;
  offreSuspecte = false;

  // Utilisateur connecté (simulé)
  currentUserId = 1;

  constructor(
    private fb: FormBuilder,
    private offreService: OffreService,
    private categorieService: CategorieService,
    private router: Router,
    private iaService: IaService
  ) {
    this.offreForm = this.fb.group({
      // Étape 1: Informations générales
      titre: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required]],
      categorieId: [null, Validators.required],
      budgetMin: [0, [Validators.required, Validators.min(0)]],
      budgetMax: [null],
      deadline: ['', Validators.required],
      nombrePostes: [1, [Validators.required, Validators.min(1)]],
      statut: [StatutOffre.BROUILLON, Validators.required],
      
      // Étape 2: Critères
      criteres: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.addCritere(); // Ajouter un critère par défaut
  }

  loadCategories(): void {
    this.categorieService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        console.log('Catégories chargées:', data);
      },
      error: (err) => {
        console.error('Erreur chargement catégories:', err);
        this.error = 'Impossible de charger les catégories. Vérifiez que le backend est démarré.';
      }
    });
  }

  get criteres(): FormArray {
    return this.offreForm.get('criteres') as FormArray;
  }

  createCritereFormGroup(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      poids: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
      obligatoire: [false],
      type: [TypeCritere.COMPETENCE, Validators.required]
    });
  }

  addCritere(): void {
    this.criteres.push(this.createCritereFormGroup());
  }

  removeCritere(index: number): void {
    if (this.criteres.length > 1) {
      this.criteres.removeAt(index);
    }
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      const step1Controls = ['titre', 'description', 'categorieId', 'budgetMin', 'deadline'];
      const valid = step1Controls.every(control => this.offreForm.get(control)?.valid);
      
      if (valid) {
        // Vérifier budget cohérent
        const budgetMin = this.offreForm.get('budgetMin')?.value;
        const budgetMax = this.offreForm.get('budgetMax')?.value;
        
        if (budgetMax !== null && budgetMax <= budgetMin) {
          this.error = 'Le budget maximum doit être supérieur au budget minimum';
          return;
        }
        
        this.error = '';
        this.currentStep++;
      } else {
        this.error = 'Veuillez remplir tous les champs obligatoires';
      }
    } else if (this.currentStep === 2) {
      // Vérifier qu'il y a au moins un critère
      if (this.criteres.length === 0) {
        this.error = 'Veuillez ajouter au moins un critère';
        return;
      }
      
      // Vérifier que tous les critères sont valides
      const allValid = this.criteres.controls.every(control => control.valid);
      if (!allValid) {
        this.error = 'Veuillez remplir correctement tous les critères';
        return;
      }
      
      // Vérifier la somme des poids
      const totalPoids = this.criteres.controls.reduce((sum, control) => 
        sum + (control.get('poids')?.value || 0), 0);
      
      if (totalPoids > 100) {
        this.error = `La somme des poids (${totalPoids}%) ne doit pas dépasser 100%`;
        return;
      }
      
      this.error = '';
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.error = '';
    }
  }

  submitOffre(): void {
    if (this.offreForm.invalid) {
      this.error = 'Veuillez corriger les erreurs du formulaire';
      return;
    }

    this.loading = true;
    this.error = '';

    const formValue = this.offreForm.value;

    // Détecter la fraude avant de soumettre
    this.detecterFraude();

    // Attendre que la détection de fraude se termine
    setTimeout(() => {
      const offre = {
        titre: formValue.titre,
        description: formValue.description,
        budgetMin: formValue.budgetMin,
        budgetMax: formValue.budgetMax,
        deadline: formValue.deadline,
        nombrePostes: formValue.nombrePostes,
        statut: formValue.statut,
        publieurId: this.currentUserId,
        categorie: { id: formValue.categorieId },  // Format attendu par Spring Boot JPA
        estSuspecte: this.offreSuspecte,  // Ajouter le champ estSuspecte
        criteres: formValue.criteres.map((c: any) => ({
          nom: c.nom,
          description: c.description,
          poids: c.poids,
          obligatoire: c.obligatoire,
          type: c.type
        }))
      };

      this.offreService.createOffre(offre).subscribe({
        next: (created) => {
          this.loading = false;

          // Publier automatiquement seulement si le statut est ACTIVE
          if (formValue.statut === StatutOffre.ACTIVE) {
            this.offreService.publierOffre(created.id!).subscribe({
              next: () => {
                this.router.navigate(['/offres/marketplace']);
              },
              error: (err) => {
                console.error('Erreur publication:', err);
                this.router.navigate(['/offres/mes-offres']);
              }
            });
          } else {
            // Rediriger vers mes offres si le statut n'est pas ACTIVE
            this.router.navigate(['/offres/mes-offres']);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Erreur lors de la création de l\'offre';
        }
      });
    }, 1000);  // Augmenter le délai à 1 seconde
  }

  getProgress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  getTotalPoids(): number {
    return this.criteres.controls.reduce((sum, control) =>
      sum + (control.get('poids')?.value || 0), 0);
  }

  getCategorieNom(categorieId: number | null): string {
    if (!categorieId) return '';
    const cat = this.categories.find(c => c.id === categorieId);
    return cat ? cat.nom : '';
  }

  formatBudget(budgetMin: number, budgetMax: number | null): string {
    if (budgetMax) {
      return `${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()} TND`;
    }
    return `À partir de ${budgetMin.toLocaleString()} TND`;
  }

  // Prédire le budget recommandé
  predireBudget(): void {
    const categorieId = this.offreForm.get('categorieId')?.value;
    const categorie = this.getCategorieNom(categorieId);
    const deadline = this.offreForm.get('deadline')?.value;
    const nombrePostes = this.offreForm.get('nombrePostes')?.value || 1;
    const nbCriteres = this.criteres.length;

    if (!categorie || !deadline) {
      this.error = 'Veuillez sélectionner une catégorie et une deadline';
      return;
    }

    // Calculer la durée en jours
    const deadlineDate = new Date(deadline);
    const aujourdHui = new Date();
    const dureeJours = Math.ceil((deadlineDate.getTime() - aujourdHui.getTime()) / (1000 * 60 * 60 * 24));

    if (dureeJours <= 0) {
      this.error = 'La deadline doit être dans le futur';
      return;
    }

    this.loadingPrediction = true;
    this.budgetPrediction = null;

    this.iaService.predireBudget({
      categorie,
      dureeJours,
      nbCriteres,
      scorePublieur: 50, // Score par défaut
      nbPostes: nombrePostes
    }).subscribe({
      next: (response) => {
        this.loadingPrediction = false;
        if (response.success) {
          this.budgetPrediction = response;
          this.error = '';
        } else {
          this.error = response.error || 'Erreur lors de la prédiction';
        }
      },
      error: (err) => {
        this.loadingPrediction = false;
        this.error = 'Erreur lors de la prédiction du budget';
        console.error(err);
      }
    });
  }

  // Détecter si l'offre est suspecte
  detecterFraude(): void {
    const categorieId = this.offreForm.get('categorieId')?.value;
    const categorie = this.getCategorieNom(categorieId);
    const deadline = this.offreForm.get('deadline')?.value;
    const nombrePostes = this.offreForm.get('nombrePostes')?.value || 1;
    const nbCriteres = this.criteres.length;
    const budgetMin = this.offreForm.get('budgetMin')?.value;

    if (!categorie || !deadline || !budgetMin) {
      return;
    }

    // Calculer la durée en jours
    const deadlineDate = new Date(deadline);
    const aujourdHui = new Date();
    const dureeJours = Math.ceil((deadlineDate.getTime() - aujourdHui.getTime()) / (1000 * 60 * 60 * 24));

    this.iaService.detecterFraude({
      categorie,
      dureeJours,
      nbCriteres,
      scorePublieur: 50,
      nbPostes: nombrePostes,
      budget: budgetMin
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.fraudeDetection = response;
          this.offreSuspecte = response.estSuspecte;
        }
      },
      error: (err) => {
        console.error('Erreur détection fraude:', err);
      }
    });
  }
}
