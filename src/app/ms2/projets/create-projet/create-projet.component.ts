import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjetService } from '../../services/projet.service';
import { Projet } from '../../models/projet.model';
import { Ms2NavbarComponent } from '../../shared/navbar/ms2-navbar.component';
import { take } from 'rxjs/operators'; // ← Ajoute en haut
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // ← Ajoute ChangeDetectorRef

@Component({
  selector: 'app-create-projet',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, Ms2NavbarComponent],
  templateUrl: './create-projet.component.html',
  styleUrls: ['./create-projet.component.scss']
})
export class CreateProjetComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  submitting = false;
  error = '';
  isEditMode = false;
  projetId?: number;

  today = new Date().toISOString().split('T')[0];

  categories = [
    { value: 'TECH',        label: 'Tech / Développement', icon: 'ti-code',        desc: 'Applications, APIs, logiciels' },
    { value: 'ECOMMERCE',   label: 'E-Commerce',            icon: 'ti-shopping-cart', desc: 'Boutiques et marketplaces' },
    { value: 'DESIGN',      label: 'Design / Créatif',      icon: 'ti-palette',     desc: 'UI/UX, branding, visuels' },
    { value: 'FORMATION',   label: 'Formation',             icon: 'ti-school',      desc: 'Contenus éducatifs' },
    { value: 'GENERAL',     label: 'Général',               icon: 'ti-briefcase',   desc: 'Tout autre type de projet' },
  ];

  selectedCategorie = '';

  // Prévisualisation de ce qui sera généré
  generationPreview: Record<string, { jalons: string[]; objectifs: string[]; taches: string[] }> = {
    TECH: {
      jalons:    ['Lancement du projet', 'Mi-projet — Revue d\'avancement', 'Livraison finale'],
      objectifs: ['Définir l\'architecture technique', 'Livrer la version MVP', 'Passer les tests de recette', 'Déployer en production'],
      taches:    ['Analyse des besoins', 'Conception architecture', 'Développement Backend', 'Développement Frontend', 'Tests & validation', 'Déploiement']
    },
    ECOMMERCE: {
      jalons:    ['Lancement du projet', 'Mi-projet — Revue d\'avancement', 'Livraison finale'],
      objectifs: ['Créer le catalogue produits', 'Configurer les paiements', 'Lancer la boutique en ligne', 'Atteindre les premières ventes'],
      taches:    ['Catalogue produits', 'Configuration paiements', 'Configuration livraisons', 'Marketing de lancement']
    },
    DESIGN: {
      jalons:    ['Lancement du projet', 'Mi-projet — Revue d\'avancement', 'Livraison finale'],
      objectifs: ['Définir la charte graphique', 'Livrer les maquettes', 'Valider le prototype', 'Finaliser les livrables créatifs'],
      taches:    ['Brief créatif', 'Maquettes & wireframes', 'Production livrables']
    },
    FORMATION: {
      jalons:    ['Lancement du projet', 'Mi-projet — Revue d\'avancement', 'Livraison finale'],
      objectifs: ['Créer le programme de formation', 'Développer les contenus', 'Piloter la première session', 'Évaluer et améliorer'],
      taches:    ['Cadrage du projet', 'Planification détaillée', 'Exécution phase 1', 'Exécution phase 2', 'Clôture']
    },
    GENERAL: {
      jalons:    ['Lancement du projet', 'Mi-projet — Revue d\'avancement', 'Livraison finale'],
      objectifs: ['Définir le périmètre du projet', 'Identifier les ressources', 'Livrer le premier livrable', 'Clôturer et évaluer'],
      taches:    ['Cadrage du projet', 'Planification détaillée', 'Exécution phase 1', 'Exécution phase 2', 'Clôture']
    }
  };

  constructor(
    private fb: FormBuilder,
    private projetService: ProjetService,
    private router: Router,
     private cdr: ChangeDetectorRef ,
    private route: ActivatedRoute
  ) {}

 ngOnInit(): void {
  this.buildForm();
  
  const id = this.route.snapshot.paramMap.get('id');
  console.log('ID dans l\'URL:', id);  // ← AJOUTE
  
  if (id) {
    this.isEditMode = true;
    this.projetId = +id;
    console.log('Mode édition activé, ID:', this.projetId);  // ← AJOUTE
    this.loadProjet(this.projetId);
  } else {
    console.log('Mode création');  // ← AJOUTE
  }
}

  private buildForm(): void {
    this.form = this.fb.group({
      titre:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(2000)]],
      categorie:   ['', Validators.required],
      budget:      [null, [Validators.min(0)]],
      dateDebut:   ['', Validators.required],
      dateFin:     ['', Validators.required],
    }, { validators: this.dateRangeValidator });
  }

  private dateRangeValidator(group: FormGroup) {
    const debut = group.get('dateDebut')?.value;
    const fin   = group.get('dateFin')?.value;
    if (debut && fin && fin <= debut) {
      return { dateRange: true };
    }
    return null;
  }

 private loadProjet(id: number): void {
  this.loading = true;
  this.projetService.getById(id).pipe(take(1)).subscribe({
    next: (p) => {
      this.form.patchValue({
        titre:       p.titre,
        description: p.description,
        categorie:   p.categorie,
        budget:      p.budget,
        dateDebut:   p.dateDebut,
        dateFin:     p.dateFin,
      });
      this.selectedCategorie = p.categorie ?? '';
      this.loading = false;
      
      // ✅ FORCE LA MISE À JOUR DE L'AFFICHAGE
      this.cdr.detectChanges();
      
      console.log('loading après detectChanges:', this.loading);
    },
    error: () => {
      this.error = 'Impossible de charger le projet.';
      this.loading = false;
      this.cdr.detectChanges(); // ← Ajoute aussi ici
    }
  });
}
  selectCategorie(val: string): void {
    this.selectedCategorie = val;
    this.form.patchValue({ categorie: val });
    this.form.get('categorie')?.markAsTouched();
  }

  get preview() {
    return this.generationPreview[this.selectedCategorie] ?? null;
  }

  get f() { return this.form.controls; }

  get dateRangeInvalid(): boolean {
    return this.form.hasError('dateRange') &&
      (this.f['dateDebut'].touched || this.f['dateFin'].touched);
  }

  submit(): void {
  this.form.markAllAsTouched();
  if (this.form.invalid) return;

  this.submitting = true;
  this.error = '';

  const payload: Partial<Projet> = {
    ...this.form.value,
    porteurId: 1,
  };

  const action$ = this.isEditMode
    ? this.projetService.update(this.projetId!, payload as Projet).pipe(take(1))
    : this.projetService.create(payload as Projet).pipe(take(1));

  action$.subscribe({
    next: () => this.router.navigate(['/ms2/projets']),
    error: () => {
      this.error = 'Une erreur est survenue. Veuillez réessayer.';
      this.submitting = false;
    }
  });
}

}