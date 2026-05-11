import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Idee, StatutIdee } from '../models/idee.model';
import { IdeeService } from '../services/idee.service';
import { Ms2NavbarComponent } from '../shared/navbar/ms2-navbar.component';

@Component({
  selector: 'app-mes-idees',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Ms2NavbarComponent],
  templateUrl: './mes-idees.component.html',
  styleUrls: ['./mes-idees.component.scss']
})
export class MesIdeesComponent implements OnInit {

  idees: Idee[] = [];
  filteredIdees: Idee[] = [];
  loading = false;
  error = '';

  // Filtres
  filtreActif: StatutIdee | 'TOUTES' = 'TOUTES';
  filtres: (StatutIdee | 'TOUTES')[] = ['TOUTES', 'NOUVELLE', 'ACCEPTEE', 'REJETEE', 'TRANSFORMEE'];

  // Modal créer/éditer
  showModal = false;
  isEditMode = false;
  editingIdee: Idee | null = null;
  submitting = false;
  ideeForm!: FormGroup;

  // Modal transformer en projet
  showTransformerModal = false;
  ideeATransformer: Idee | null = null;
  projetForm!: FormGroup;
  transforming = false;

  // Confirmation suppression
  showDeleteConfirm = false;
  ideeASupprimer: Idee | null = null;

  today = new Date().toISOString().split('T')[0];

  categories = [
    { value: 'TECH',       label: 'Tech / Dev',    icon: 'ti-code' },
    { value: 'COMMERCE',   label: 'Commerce',       icon: 'ti-shopping-cart' },
    { value: 'DESIGN',     label: 'Design',         icon: 'ti-brush' },
    { value: 'FORMATION',  label: 'Formation',      icon: 'ti-school' },
    { value: 'GENERAL',    label: 'Général',        icon: 'ti-bulb' },
  ];

  constructor(
    private ideeService: IdeeService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildIdeeForm();
    this.buildProjetForm();
    this.loadIdees();
    setTimeout(() => this.initReveal(), 100);
  }

  buildIdeeForm(): void {
    this.ideeForm = this.fb.group({
      titre:       ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      categorie:   ['', Validators.required],
    });
  }

  buildProjetForm(): void {
    this.projetForm = this.fb.group({
      titre:       ['', Validators.required],
      description: [''],
      dateDebut:   ['', Validators.required],
      dateFin:     ['', Validators.required],
      budget:      [null, [Validators.min(0)]],
      porteurId:   [1],
    });
  }

  loadIdees(): void {
    this.loading = true;
    this.error = '';
    this.ideeService.getAll().subscribe({
      next: (data) => {
        this.idees = data;
        this.appliquerFiltre();
        this.loading = false;
        setTimeout(() => this.initReveal(), 100);
      },
      error: () => {
        this.error = 'Impossible de charger les idées.';
        this.loading = false;
      }
    });
  }

  appliquerFiltre(): void {
    this.filteredIdees = this.filtreActif === 'TOUTES'
      ? [...this.idees]
      : this.idees.filter(i => i.statut === this.filtreActif);
  }

  filtrer(f: StatutIdee | 'TOUTES'): void {
    this.filtreActif = f;
    this.appliquerFiltre();
  }

  // ── CRÉER / ÉDITER ──
  ouvrirCreer(): void {
    this.isEditMode = false;
    this.editingIdee = null;
    this.ideeForm.reset();
    this.showModal = true;
  }

  ouvrirEditer(idee: Idee): void {
    this.isEditMode = true;
    this.editingIdee = idee;
    this.ideeForm.patchValue({
      titre: idee.titre,
      description: idee.description,
      categorie: idee.categorie,
    });
    this.showModal = true;
  }

  fermerModal(): void {
    this.showModal = false;
    this.editingIdee = null;
    this.ideeForm.reset();
  }

  submitIdee(): void {
    if (this.ideeForm.invalid) {
      this.ideeForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const payload: Partial<Idee> = {
      ...this.ideeForm.value,
      auteurId: 1,
      statut: 'NOUVELLE'
    };

    const req$ = this.isEditMode && this.editingIdee?.id
      ? this.ideeService.update(this.editingIdee.id, { ...this.ideeForm.value })
      : this.ideeService.create(payload);

    req$.subscribe({
      next: () => {
        this.submitting = false;
        this.fermerModal();
        this.loadIdees();
      },
      error: () => { this.submitting = false; }
    });
  }

  // ── VALIDER / REJETER ──
  valider(idee: Idee): void {
    if (!idee.id) return;
    this.ideeService.update(idee.id, { ...idee, statut: 'ACCEPTEE' }).subscribe({
      next: () => this.loadIdees()
    });
  }

  rejeter(idee: Idee): void {
    if (!idee.id) return;
    this.ideeService.update(idee.id, { ...idee, statut: 'REJETEE' }).subscribe({
      next: () => this.loadIdees()
    });
  }

  // ── SUPPRIMER ──
  confirmerSupprimer(idee: Idee): void {
    this.ideeASupprimer = idee;
    this.showDeleteConfirm = true;
  }

  annulerSupprimer(): void {
    this.ideeASupprimer = null;
    this.showDeleteConfirm = false;
  }

  supprimerIdee(): void {
    if (!this.ideeASupprimer?.id) return;
    this.ideeService.delete(this.ideeASupprimer.id).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.ideeASupprimer = null;
        this.loadIdees();
      }
    });
  }

  // ── TRANSFORMER EN PROJET ──
  ouvrirTransformer(idee: Idee): void {
    this.ideeATransformer = idee;
    this.projetForm.patchValue({
      titre: idee.titre,
      description: idee.description,
      categorie: idee.categorie,
      porteurId: 1,
    });
    this.showTransformerModal = true;
  }

  fermerTransformerModal(): void {
    this.showTransformerModal = false;
    this.ideeATransformer = null;
    this.projetForm.reset();
  }

  submitTransformer(): void {
    if (this.projetForm.invalid) {
      this.projetForm.markAllAsTouched();
      return;
    }
    if (!this.ideeATransformer?.id) return;
    this.transforming = true;

    const projet = {
      ...this.projetForm.value,
      categorie: this.ideeATransformer.categorie,
      porteurId: 1,
    };

    this.ideeService.transformerEnProjet(this.ideeATransformer.id, projet).subscribe({
      next: () => {
        this.transforming = false;
        this.fermerTransformerModal();
        this.loadIdees();
      },
      error: () => { this.transforming = false; }
    });
  }

  // ── HELPERS ──
  get f() { return this.ideeForm.controls; }
  get pf() { return this.projetForm.controls; }

  labelStatut(s?: StatutIdee): string {
    const map: Record<string, string> = {
      NOUVELLE: 'Nouvelle', ACCEPTEE: 'Acceptée',
      REJETEE: 'Rejetée', TRANSFORMEE: 'Transformée'
    };
    return s ? (map[s] ?? s) : '—';
  }

  badgeClass(s?: StatutIdee): string {
    const map: Record<string, string> = {
      NOUVELLE: 'nouvelle', ACCEPTEE: 'acceptee',
      REJETEE: 'rejetee', TRANSFORMEE: 'transformee'
    };
    return s ? (map[s] ?? '') : '';
  }

  iconCategorie(cat?: string): string {
    const map: Record<string, string> = {
      TECH: 'ti-code', COMMERCE: 'ti-shopping-cart',
      DESIGN: 'ti-brush', FORMATION: 'ti-school', GENERAL: 'ti-bulb'
    };
    return cat ? (map[cat.toUpperCase()] ?? 'ti-bulb') : 'ti-bulb';
  }

  get stats() {
    return {
      total:      this.idees.length,
      nouvelles:  this.idees.filter(i => i.statut === 'NOUVELLE').length,
      acceptees:  this.idees.filter(i => i.statut === 'ACCEPTEE').length,
      transformees: this.idees.filter(i => i.statut === 'TRANSFORMEE').length,
    };
  }

  initReveal(): void {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
    }, { threshold: 0.08 });
    els.forEach(el => obs.observe(el));
  }

  selectedCategorie = '';
  selectCategorie(val: string): void {
    this.selectedCategorie = val;
    this.ideeForm.patchValue({ categorie: val });
  }
}