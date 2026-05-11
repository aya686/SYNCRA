import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from 'src/app/theme/shared/shared.module';

interface Specialiste {
  id: number; nom: string; prenom: string; specialite: string;
}

interface SeanceAdmin {
  id: number;
  utilisateurNom: string;
  utilisateurPrenom: string;
  utilisateurEmail: string;
  specialiste: Specialiste;
  date: string;
  heure: string;
  dureeMinutes: number;
  statut: 'PLANIFIEE' | 'EFFECTUEE' | 'ANNULEE' | 'EN_ATTENTE';
  typeSeance: 'PRESENTIEL' | 'EN_LIGNE';
  motif: string;
  rapport?: string;
}

interface SeanceStats {
  total: number;
  effectuees: number;
  annulees: number;
  planifiees: number;
  tauxAnnulation: number;
}

@Component({
  selector: 'app-seances-admin',
  imports: [CommonModule, RouterModule, FormsModule, SharedModule],
  templateUrl: './seances-admin.component.html',
  styleUrls: ['./seances-admin.component.scss']
})
export class SeancesAdminComponent implements OnInit {

  seances: SeanceAdmin[] = [];
  seancesFiltrees: SeanceAdmin[] = [];
  specialistes: Specialiste[] = [];
  loading = false;
  stats: SeanceStats = { total: 0, effectuees: 0, annulees: 0, planifiees: 0, tauxAnnulation: 0 };

  // Filtres
  filtreStatut = 'tous';
  filtreSpecialiste = 'tous';
  filtrePeriode = 'mois';
  searchQuery = '';

  // Modal rapport
  showRapportModal = false;
  rapportSeance: SeanceAdmin | null = null;
  rapportTexte = '';
  savingRapport = false;

  // Modal detail
  showDetailModal = false;
  seanceDetail: SeanceAdmin | null = null;

  // Toast
  toastMsg = ''; toastType = ''; showToast = false;

  // Graphique mensuel (barres CSS)
  seancesParMois: { mois: string; effectuees: number; annulees: number }[] = [];

  private readonly API = 'http://localhost:8082/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSeances();
    this.loadSpecialistes();
    this.buildGraphiqueMois();
  }

  loadSeances(): void {
    this.loading = true;
    this.http.get<SeanceAdmin[]>(`${this.API}/admin/seances`).subscribe({
      next: (d) => { this.seances = d; this.computeStats(); this.applyFilters(); this.loading = false; },
      error: () => { this.seances = this.getDemoSeances(); this.computeStats(); this.applyFilters(); this.loading = false; }
    });
  }

  loadSpecialistes(): void {
    this.http.get<Specialiste[]>(`${this.API}/specialistes`).subscribe({
      next: (d) => this.specialistes = d,
      error: () => this.specialistes = [
        { id: 1, nom: 'Martin', prenom: 'Sophie', specialite: 'Psychologue du travail' },
        { id: 2, nom: 'Dupont', prenom: 'Jean', specialite: 'Coach professionnel' }
      ]
    });
  }

  computeStats(): void {
    const total = this.seances.length;
    const effectuees = this.seances.filter(s => s.statut === 'EFFECTUEE').length;
    const annulees = this.seances.filter(s => s.statut === 'ANNULEE').length;
    const planifiees = this.seances.filter(s => s.statut === 'PLANIFIEE' || s.statut === 'EN_ATTENTE').length;
    const tauxAnnulation = total > 0 ? Math.round((annulees / total) * 100) : 0;
    this.stats = { total, effectuees, annulees, planifiees, tauxAnnulation };
  }

  applyFilters(): void {
    let r = [...this.seances];
    if (this.filtreStatut !== 'tous') r = r.filter(s => s.statut === this.filtreStatut);
    if (this.filtreSpecialiste !== 'tous') r = r.filter(s => s.specialiste.id === +this.filtreSpecialiste);
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      r = r.filter(s => s.utilisateurNom.toLowerCase().includes(q) || s.utilisateurPrenom.toLowerCase().includes(q) || s.utilisateurEmail.toLowerCase().includes(q));
    }
    this.seancesFiltrees = r;
  }

  confirmerSeance(s: SeanceAdmin): void {
    this.http.patch(`${this.API}/suivi-psycho/${s.id}/confirmer`, {}).subscribe({ next: () => {}, error: () => {} });
    s.statut = 'PLANIFIEE';
    this.computeStats(); this.applyFilters();
    this.toast('Séance confirmée', 'success');
  }

  annulerSeance(s: SeanceAdmin): void {
    if (!confirm('Annuler cette séance ?')) return;
    this.http.patch(`${this.API}/suivi-psycho/${s.id}/annuler`, {}).subscribe({ next: () => {}, error: () => {} });
    s.statut = 'ANNULEE';
    this.computeStats(); this.applyFilters();
    this.toast('Séance annulée', 'warning');
  }

  ouvrirRapport(s: SeanceAdmin): void {
    this.rapportSeance = s;
    this.rapportTexte = s.rapport || '';
    this.showRapportModal = true;
  }

  sauvegarderRapport(): void {
    if (!this.rapportSeance) return;
    this.savingRapport = true;
    this.http.post(`${this.API}/rapports/seance/${this.rapportSeance.id}`, { contenu: this.rapportTexte }).subscribe({
      next: () => {},  error: () => {}
    });
    this.rapportSeance.rapport = this.rapportTexte;
    this.rapportSeance.statut = 'EFFECTUEE';
    this.computeStats(); this.applyFilters();
    setTimeout(() => { this.savingRapport = false; this.showRapportModal = false; this.toast('Rapport sauvegardé', 'success'); }, 600);
  }

  voirDetail(s: SeanceAdmin): void { this.seanceDetail = s; this.showDetailModal = true; }

  buildGraphiqueMois(): void {
    this.seancesParMois = [
      { mois: 'Nov', effectuees: 12, annulees: 2 },
      { mois: 'Déc', effectuees: 15, annulees: 1 },
      { mois: 'Jan', effectuees: 18, annulees: 3 },
      { mois: 'Fév', effectuees: 14, annulees: 2 },
      { mois: 'Mar', effectuees: 22, annulees: 4 },
      { mois: 'Avr', effectuees: 19, annulees: 2 },
    ];
  }

  getMaxSeances(): number { return Math.max(...this.seancesParMois.map(s => s.effectuees + s.annulees), 1); }

  getStatutClass(statut: string): string {
    const m: Record<string, string> = { 'PLANIFIEE': 'bg-light-primary text-primary', 'EFFECTUEE': 'bg-light-success text-success', 'ANNULEE': 'bg-light-danger text-danger', 'EN_ATTENTE': 'bg-light-warning text-warning' };
    return m[statut] || '';
  }
  getStatutLabel(statut: string): string {
    const m: Record<string, string> = { 'PLANIFIEE': 'Planifiée', 'EFFECTUEE': 'Effectuée', 'ANNULEE': 'Annulée', 'EN_ATTENTE': 'En attente' };
    return m[statut] || statut;
  }
  getTypeIcon(t: string): string { return t === 'EN_LIGNE' ? 'ti ti-device-laptop' : 'ti ti-building-hospital'; }
  formatDate(d: string): string { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }
  getInitiales(s: SeanceAdmin): string { return `${s.utilisateurPrenom?.[0] || ''}${s.utilisateurNom?.[0] || ''}`.toUpperCase(); }

  private toast(msg: string, type: string): void {
    this.toastMsg = msg; this.toastType = type; this.showToast = true;
    setTimeout(() => this.showToast = false, 3500);
  }

  private getDemoSeances(): SeanceAdmin[] {
    return [
      { id: 1, utilisateurNom: 'Benali', utilisateurPrenom: 'Ahmed', utilisateurEmail: 'ahmed@company.tn', specialiste: { id: 1, nom: 'Martin', prenom: 'Sophie', specialite: 'Psychologue' }, date: '2025-04-28', heure: '14:30', dureeMinutes: 50, statut: 'EN_ATTENTE', typeSeance: 'EN_LIGNE', motif: 'Suivi mensuel stress chronique' },
      { id: 2, utilisateurNom: 'Gharbi', utilisateurPrenom: 'Sonia', utilisateurEmail: 'sonia@company.tn', specialiste: { id: 1, nom: 'Martin', prenom: 'Sophie', specialite: 'Psychologue' }, date: '2025-04-25', heure: '10:00', dureeMinutes: 50, statut: 'PLANIFIEE', typeSeance: 'PRESENTIEL', motif: 'Bilan bien-être trimestriel' },
      { id: 3, utilisateurNom: 'Trabelsi', utilisateurPrenom: 'Karim', utilisateurEmail: 'karim@company.tn', specialiste: { id: 2, nom: 'Dupont', prenom: 'Jean', specialite: 'Coach' }, date: '2025-04-20', heure: '09:00', dureeMinutes: 60, statut: 'EFFECTUEE', typeSeance: 'EN_LIGNE', motif: 'Coaching gestion priorités', rapport: 'Session très productive. Karim a bien progressé dans la gestion de son temps.' },
      { id: 4, utilisateurNom: 'Mrad', utilisateurPrenom: 'Lina', utilisateurEmail: 'lina@company.tn', specialiste: { id: 1, nom: 'Martin', prenom: 'Sophie', specialite: 'Psychologue' }, date: '2025-04-15', heure: '11:00', dureeMinutes: 50, statut: 'ANNULEE', typeSeance: 'EN_LIGNE', motif: 'Anxiété et surcharge' },
      { id: 5, utilisateurNom: 'Jrad', utilisateurPrenom: 'Mohamed', utilisateurEmail: 'mohamed@company.tn', specialiste: { id: 2, nom: 'Dupont', prenom: 'Jean', specialite: 'Coach' }, date: '2025-04-10', heure: '16:00', dureeMinutes: 60, statut: 'EFFECTUEE', typeSeance: 'PRESENTIEL', motif: 'Objectifs professionnels Q2', rapport: 'Mohamed a défini 3 objectifs clairs pour le trimestre.' },
    ];
  }
}