import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Offre } from '../../models/offre.model';
import { Critere, TypeCritere } from '../../models/critere.model';
import { Categorie } from '../../models/categorie.model';
import { OffreService } from '../../services/offre.service';
import { CategorieService } from '../../services/categorie.service';

@Component({
  selector: 'app-modifier-offre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modifier-offre.component.html',
  styleUrls: ['./modifier-offre.component.scss']
})
export class ModifierOffreComponent implements OnInit {
  offreId: number | null = null;
  offre: Offre | null = null;
  currentStep = 1;
  totalSteps = 3;
  
  offreForm: FormGroup;
  categories: Categorie[] = [];
  typeCriteres = Object.values(TypeCritere);
  
  loading = false;
  loadingInitial = false;
  error = '';
  
  // Utilisateur connecté (simulé)
  currentUserId = 1;

  constructor(
    private fb: FormBuilder,
    private offreService: OffreService,
    private categorieService: CategorieService,
    private router: Router,
    private route: ActivatedRoute
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
      
      // Étape 2: Critères
      criteres: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.offreId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.offreId) {
      this.loadOffre();
    }
    this.loadCategories();
  }

  loadOffre(): void {
    this.loadingInitial = true;
    this.offreService.getOffreById(this.offreId!).subscribe({
      next: (data) => {
        this.offre = data;
        this.populateForm(data);
        this.loadingInitial = false;
      },
      error: (err) => {
        console.error('Erreur chargement offre:', err);
        this.error = 'Erreur lors du chargement de l\'offre';
        this.loadingInitial = false;
      }
    });
  }

  loadCategories(): void {
    this.categorieService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Erreur chargement catégories:', err);
      }
    });
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  populateForm(offre: Offre): void {
    this.offreForm.patchValue({
      titre: offre.titre,
      description: offre.description,
      categorieId: offre.categorieId,
      budgetMin: offre.budgetMin,
      budgetMax: offre.budgetMax,
      deadline: offre.deadline ? this.formatDateForInput(offre.deadline) : '',
      nombrePostes: offre.nombrePostes
    });

    // Populate criteres
    if (offre.criteres && offre.criteres.length > 0) {
      this.criteres.clear();
      offre.criteres.forEach(critere => {
        this.criteres.push(this.fb.group({
          nom: [critere.nom, [Validators.required, Validators.maxLength(200)]],
          description: [critere.description || ''],
          poids: [critere.poids, [Validators.required, Validators.min(0), Validators.max(100)]],
          obligatoire: [critere.obligatoire || false],
          type: [critere.type, Validators.required]
        }));
      });
    } else {
      this.addCritere();
    }
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
      if (this.criteres.length === 0) {
        this.error = 'Veuillez ajouter au moins un critère';
        return;
      }
      
      const allValid = this.criteres.controls.every(control => control.valid);
      if (!allValid) {
        this.error = 'Veuillez remplir correctement tous les critères';
        return;
      }
      
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

  updateOffre(): void {
    if (this.offreForm.invalid || !this.offreId) {
      this.error = 'Veuillez corriger les erreurs du formulaire';
      console.log('Formulaire invalide:', this.offreForm.errors);
      return;
    }

    this.loading = true;
    this.error = '';

    const formValue = this.offreForm.value;
    console.log('Valeur du formulaire:', formValue);
    
    const offre = {
      titre: formValue.titre,
      description: formValue.description,
      budgetMin: formValue.budgetMin,
      budgetMax: formValue.budgetMax,
      deadline: formValue.deadline,
      nombrePostes: formValue.nombrePostes,
      publieurId: this.offre?.publieurId || this.currentUserId,
      categorieId: formValue.categorieId,
      criteres: formValue.criteres ? formValue.criteres.map((c: any) => ({
        nom: c.nom,
        description: c.description,
        poids: c.poids,
        obligatoire: c.obligatoire,
        type: c.type
      })) : []
    };

    console.log('Envoi de la mise à jour:', offre);
    console.log('Offre ID:', this.offreId);

    this.offreService.updateOffre(this.offreId, offre).subscribe({
      next: (response) => {
        console.log('Mise à jour réussie:', response);
        this.loading = false;
        this.router.navigate(['/offres/admin-dashboard']);
      },
      error: (err) => {
        console.error('Erreur mise à jour:', err);
        console.error('Status:', err.status);
        console.error('Error body:', JSON.stringify(err.error, null, 2));
        console.error('Error message:', err.error?.message);
        console.error('Error status text:', err.statusText);
        this.loading = false;
        this.error = err.error?.message || err.error?.error || err.message || 'Erreur lors de la modification de l\'offre (Erreur 500 du serveur)';
      }
    });
  }

  annuler(): void {
    this.router.navigate(['/offres/admin-dashboard']);
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
}
