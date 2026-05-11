import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from 'src/app/theme/shared/shared.module';

interface ProgrammeAdmin {
  id: number;
  nom: string;
  objectif: string;
  dureesSemaines: number;
  utilisateurNom: string;
  utilisateurPrenom: string;
  utilisateurEmail: string;
  statut: 'ACTIF' | 'TERMINE' | 'ABANDONNE';
  progression: number;
  dateDebut: string;
  exercicesTotal: number;
  exercicesCompletes: number;
  estModele: boolean;
}

interface ProgrammeModele {
  id?: number;
  nom: string;
  objectif: string;
  dureesSemaines: number;
  description: string;
}

@Component({
  selector: 'app-programmes-admin',
  imports: [CommonModule, RouterModule, FormsModule, SharedModule],
  templateUrl: './programmes-admin.component.html',
  styleUrls: ['./programmes-admin.component.scss']
})
export class ProgrammesAdminComponent implements OnInit {

  programmes: ProgrammeAdmin[] = [];
  programmesFiltres: ProgrammeAdmin[] = [];
  loading = false;

  filtreStatut = 'tous';
  searchQuery = '';
  sortBy = 'progression_desc';

  showModeleModal = false;
  isEditModele = false;
  savingModele = false;
  modeleForm: ProgrammeModele = this.emptyModele();

  toastMsg = ''; toastType = ''; showToast = false;

  readonly objectifs = [
    'Réduction du stress', 'Gestion du burnout', 'Amélioration du sommeil',
    'Gestion de l\'anxiété', 'Renforcement de la résilience', 'Équilibre vie pro/perso'
  ];

  private readonly API = 'http://localhost:8082/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadProgrammes(); }

  loadProgrammes(): void {
    this.loading = true;
    this.http.get<ProgrammeAdmin[]>(`${this.API}/admin/programmes`).subscribe({
      next: (d) => { this.programmes = d; this.applyFilters(); this.loading = false; },
      error: () => { this.programmes = this.getDemoProgrammes(); this.applyFilters(); this.loading = false; }
    });
  }

  applyFilters(): void {
    let r = [...this.programmes];
    if (this.filtreStatut !== 'tous') r = r.filter(p => p.statut === this.filtreStatut);
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      r = r.filter(p => p.utilisateurNom.toLowerCase().includes(q) || p.nom.toLowerCase().includes(q));
    }
    if (this.sortBy === 'progression_desc') r.sort((a, b) => b.progression - a.progression);
    if (this.sortBy === 'progression_asc') r.sort((a, b) => a.progression - b.progression);
    if (this.sortBy === 'date_desc') r.sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime());
    this.programmesFiltres = r;
  }

  supprimerProgramme(p: ProgrammeAdmin): void {
    if (!confirm(`Supprimer le programme de ${p.utilisateurPrenom} ${p.utilisateurNom} ?`)) return;
    this.http.delete(`${this.API}/programmes/${p.id}`).subscribe({ next: () => {}, error: () => {} });
    this.programmes = this.programmes.filter(x => x.id !== p.id);
    this.applyFilters();
    this.toast('Programme supprimé', 'danger');
  }

  ouvrirCreerModele(): void { this.modeleForm = this.emptyModele(); this.isEditModele = false; this.showModeleModal = true; }

  sauvegarderModele(): void {
    if (!this.modeleForm.nom.trim()) { this.toast('Nom requis', 'warning'); return; }
    this.savingModele = true;
    this.http.post(`${this.API}/programmes/modele`, this.modeleForm).subscribe({ next: () => {}, error: () => {} });
    setTimeout(() => { this.savingModele = false; this.showModeleModal = false; this.toast('Programme modèle créé', 'success'); }, 600);
  }

  get stats() {
    const actifs = this.programmes.filter(p => p.statut === 'ACTIF');
    return {
      total: this.programmes.length,
      actifs: actifs.length,
      termines: this.programmes.filter(p => p.statut === 'TERMINE').length,
      progressionMoyenne: actifs.length ? Math.round(actifs.reduce((s, p) => s + p.progression, 0) / actifs.length) : 0,
      tauxCompletion: this.programmes.length ? Math.round((this.programmes.filter(p => p.statut === 'TERMINE').length / this.programmes.length) * 100) : 0
    };
  }

  getStatutClass(s: string): string {
    const m: Record<string, string> = { 'ACTIF': 'bg-light-success text-success', 'TERMINE': 'bg-light-primary text-primary', 'ABANDONNE': 'bg-light-danger text-danger' };
    return m[s] || '';
  }
  getProgressColor(p: number): string { return p >= 75 ? 'bg-success' : p >= 40 ? 'bg-warning' : 'bg-danger'; }
  formatDate(d: string): string { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }
  getInitiales(p: ProgrammeAdmin): string { return `${p.utilisateurPrenom?.[0] || ''}${p.utilisateurNom?.[0] || ''}`.toUpperCase(); }
  private emptyModele(): ProgrammeModele { return { nom: '', objectif: '', dureesSemaines: 4, description: '' }; }
  private toast(msg: string, type: string): void { this.toastMsg = msg; this.toastType = type; this.showToast = true; setTimeout(() => this.showToast = false, 3500); }

  private getDemoProgrammes(): ProgrammeAdmin[] {
    return [
      { id: 1, nom: 'Récupération Burnout', objectif: 'Réduction du stress', dureesSemaines: 6, utilisateurNom: 'Benali', utilisateurPrenom: 'Ahmed', utilisateurEmail: 'ahmed@company.tn', statut: 'ACTIF', progression: 67, dateDebut: '2025-03-15', exercicesTotal: 18, exercicesCompletes: 12, estModele: false },
      { id: 2, nom: 'Équilibre Pro/Perso', objectif: 'Équilibre vie pro/perso', dureesSemaines: 4, utilisateurNom: 'Gharbi', utilisateurPrenom: 'Sonia', utilisateurEmail: 'sonia@company.tn', statut: 'ACTIF', progression: 25, dateDebut: '2025-04-01', exercicesTotal: 12, exercicesCompletes: 3, estModele: false },
      { id: 3, nom: 'Gestion Anxiété', objectif: 'Gestion de l\'anxiété', dureesSemaines: 8, utilisateurNom: 'Trabelsi', utilisateurPrenom: 'Karim', utilisateurEmail: 'karim@company.tn', statut: 'TERMINE', progression: 100, dateDebut: '2025-01-10', exercicesTotal: 24, exercicesCompletes: 24, estModele: false },
      { id: 4, nom: 'Sommeil & Récupération', objectif: 'Amélioration du sommeil', dureesSemaines: 4, utilisateurNom: 'Mrad', utilisateurPrenom: 'Lina', utilisateurEmail: 'lina@company.tn', statut: 'ABANDONNE', progression: 33, dateDebut: '2025-02-20', exercicesTotal: 12, exercicesCompletes: 4, estModele: false },
      { id: 5, nom: 'Résilience au Travail', objectif: 'Renforcement de la résilience', dureesSemaines: 6, utilisateurNom: 'Jrad', utilisateurPrenom: 'Mohamed', utilisateurEmail: 'mohamed@company.tn', statut: 'ACTIF', progression: 83, dateDebut: '2025-03-01', exercicesTotal: 18, exercicesCompletes: 15, estModele: false },
    ];
  }
}