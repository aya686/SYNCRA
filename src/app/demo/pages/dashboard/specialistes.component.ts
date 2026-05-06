import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from 'src/app/theme/shared/shared.module';

interface Specialiste {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite: 'PSYCHOLOGUE' | 'PSYCHIATRE' | 'COACH' | 'MEDECIN';
  numeroOrdre: string;
  tarif: number;
  actif: boolean;
  seancesMois: number;
  notemoyenne: number;
  disponible: boolean;
}

interface SpecialisteForm {
  id?: number;
  nom: string; prenom: string; email: string;
  telephone: string; specialite: string;
  numeroOrdre: string; tarif: number; actif: boolean;
}

interface Stats {
  total: number;
  actifs: number;
  disponibles: number;
  seancesTotales: number;
}

@Component({
  selector: 'app-specialistes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SharedModule],
  templateUrl: './specialistes.component.html',
  styleUrls: ['./specialistes.component.scss']
})
export class SpecialistesComponent implements OnInit {

  specialistes: Specialiste[] = [];
  specialistesFiltres: Specialiste[] = [];
  loading = false;
  saving = false;

  // Stats — propriété normale (pas un getter) pour éviter NG0100
  stats: Stats = { total: 0, actifs: 0, disponibles: 0, seancesTotales: 0 };

  // Modal
  showModal = false;
  isEdit = false;
  form: SpecialisteForm = this.emptyForm();

  // Filtres
  filtreSpecialite = 'tous';
  filtreDisponibilite = 'tous';
  searchQuery = '';

  // Toast
  toastMsg = '';
  toastType = '';
  showToast = false;

  private readonly API = 'http://localhost:8082/api';

  readonly specialites = [
    { value: 'PSYCHOLOGUE', label: 'Psychologue du travail',  icon: 'ti ti-brain',               color: 'text-primary', bg: 'bg-light-primary' },
    { value: 'PSYCHIATRE',  label: 'Psychiatre',              icon: 'ti ti-stethoscope',          color: 'text-danger',  bg: 'bg-light-danger'  },
    { value: 'COACH',       label: 'Coach professionnel',     icon: 'ti ti-trophy',               color: 'text-success', bg: 'bg-light-success' },
    { value: 'MEDECIN',     label: 'Médecin du travail',      icon: 'ti ti-heart-rate-monitor',   color: 'text-warning', bg: 'bg-light-warning' },
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Charge les données demo immédiatement — évite NG0100
    this.specialistes = this.getDemoSpecialistes();
    this.applyFilters();
    this.updateStats();
    this.cdr.detectChanges();

    // Tente le backend
    this.loadSpecialistes();
  }

  loadSpecialistes(): void {
    this.loading = true;
    this.http.get<Specialiste[]>(`${this.API}/specialistes`).subscribe({
      next: (d) => {
        this.specialistes = d;
        this.applyFilters();
        this.updateStats();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // Demo déjà chargé dans ngOnInit
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let r = [...this.specialistes];
    if (this.filtreSpecialite !== 'tous') {
      r = r.filter(s => s.specialite === this.filtreSpecialite);
    }
    if (this.filtreDisponibilite !== 'tous') {
      r = r.filter(s => this.filtreDisponibilite === 'disponible' ? s.disponible : !s.disponible);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      r = r.filter(s =>
        s.nom.toLowerCase().includes(q) ||
        s.prenom.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }
    this.specialistesFiltres = r;
  }

  // Met à jour la propriété stats (appelée après chaque changement de données)
  updateStats(): void {
    this.stats = {
      total: this.specialistes.length,
      actifs: this.specialistes.filter(s => s.actif).length,
      disponibles: this.specialistes.filter(s => s.disponible).length,
      seancesTotales: this.specialistes.reduce((acc, s) => acc + (s.seancesMois || 0), 0)
    };
  }

  // ── CRUD ──────────────────────────────────────────────────────────
  ouvrirCreer(): void {
    this.form = this.emptyForm();
    this.isEdit = false;
    this.showModal = true;
  }

  ouvrirEditer(s: Specialiste): void {
    this.form = {
      id: s.id, nom: s.nom, prenom: s.prenom,
      email: s.email, telephone: s.telephone,
      specialite: s.specialite, numeroOrdre: s.numeroOrdre,
      tarif: s.tarif, actif: s.actif
    };
    this.isEdit = true;
    this.showModal = true;
  }

  sauvegarder(): void {
    if (!this.form.nom || !this.form.prenom || !this.form.email) {
      this.toast('Remplissez tous les champs obligatoires', 'warning');
      return;
    }
    this.saving = true;
    const obs = this.isEdit
      ? this.http.put<Specialiste>(`${this.API}/specialistes/${this.form.id}`, this.form)
      : this.http.post<Specialiste>(`${this.API}/specialistes`, this.form);

    obs.subscribe({
      next: (s) => {
        if (this.isEdit) {
          const i = this.specialistes.findIndex(x => x.id === s.id);
          if (i >= 0) this.specialistes[i] = s;
        } else {
          this.specialistes.unshift(s);
        }
        this.applyFilters();
        this.updateStats();
        this.showModal = false;
        this.saving = false;
        this.toast(this.isEdit ? 'Spécialiste mis à jour' : 'Spécialiste créé', 'success');
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback demo
        if (this.isEdit) {
          const i = this.specialistes.findIndex(x => x.id === this.form.id);
          if (i >= 0) Object.assign(this.specialistes[i], this.form);
        } else {
          this.specialistes.unshift({
            ...this.form,
            id: Date.now(),
            seancesMois: 0,
            notemoyenne: 0,
            disponible: true
          } as Specialiste);
        }
        this.applyFilters();
        this.updateStats();
        this.showModal = false;
        this.saving = false;
        this.toast(this.isEdit ? 'Spécialiste mis à jour' : 'Spécialiste créé', 'success');
        this.cdr.detectChanges();
      }
    });
  }

  toggleActif(s: Specialiste): void {
    this.http.patch(`${this.API}/specialistes/${s.id}/toggle-actif`, {})
      .subscribe({ next: () => {}, error: () => {} });
    s.actif = !s.actif;
    this.updateStats();
    this.toast(
      s.actif ? `${s.prenom} ${s.nom} activé` : `${s.prenom} ${s.nom} désactivé`,
      s.actif ? 'success' : 'warning'
    );
    this.cdr.detectChanges();
  }

  supprimer(s: Specialiste): void {
    if (!confirm(`Supprimer Dr ${s.prenom} ${s.nom} ?`)) return;
    this.http.delete(`${this.API}/specialistes/${s.id}`)
      .subscribe({ next: () => {}, error: () => {} });
    this.specialistes = this.specialistes.filter(x => x.id !== s.id);
    this.applyFilters();
    this.updateStats();
    this.toast('Spécialiste supprimé', 'danger');
    this.cdr.detectChanges();
  }

  fermerModal(): void { this.showModal = false; }

  // ── HELPERS ───────────────────────────────────────────────────────
  getSpecialiteInfo(val: string) {
    return this.specialites.find(s => s.value === val) || this.specialites[0];
  }

  getInitiales(s: Specialiste): string {
    return `${s.prenom?.[0] || ''}${s.nom?.[0] || ''}`.toUpperCase();
  }

  getInitialesBg(s: Specialiste): string {
    const colors = ['#5e35b1', '#1588d8', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9'];
    return colors[(s.id || 0) % colors.length];
  }

  getStars(note: number): { full: boolean; half: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => ({
      full: i + 1 <= Math.floor(note),
      half: i + 1 > Math.floor(note) && i < note
    }));
  }

  getNotePct(note: number): number {
    return Math.round((note / 5) * 100);
  }

  private emptyForm(): SpecialisteForm {
    return {
      nom: '', prenom: '', email: '',
      telephone: '', specialite: 'PSYCHOLOGUE',
      numeroOrdre: '', tarif: 80, actif: true
    };
  }

  private toast(msg: string, type: string): void {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; this.cdr.detectChanges(); }, 3500);
  }

  private getDemoSpecialistes(): Specialiste[] {
    return [
      { id: 1, nom: 'Martin',  prenom: 'Sophie', email: 'sophie.martin@clinic.fr',      telephone: '0600000001', specialite: 'PSYCHOLOGUE', numeroOrdre: 'PSY-2019-7821',   tarif: 80,  actif: true,  seancesMois: 22, notemoyenne: 4.8, disponible: true  },
      { id: 2, nom: 'Dupont',  prenom: 'Jean',   email: 'jean.dupont@coaching.fr',       telephone: '0600000002', specialite: 'COACH',       numeroOrdre: 'COACH-2020-1234', tarif: 90,  actif: true,  seancesMois: 18, notemoyenne: 4.5, disponible: true  },
      { id: 3, nom: 'Laurent', prenom: 'Marie',  email: 'marie.laurent@psych.fr',        telephone: '0600000003', specialite: 'PSYCHIATRE',  numeroOrdre: 'PSY-2015-3312',   tarif: 120, actif: true,  seancesMois: 14, notemoyenne: 4.9, disponible: false },
      { id: 4, nom: 'Bernard', prenom: 'Paul',   email: 'paul.bernard@medtravail.fr',    telephone: '0600000004', specialite: 'MEDECIN',     numeroOrdre: 'MED-2017-9901',   tarif: 100, actif: false, seancesMois: 0,  notemoyenne: 4.2, disponible: false },
    ];
  }
}