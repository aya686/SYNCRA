import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from 'src/app/theme/shared/shared.module';

interface AlerteAdmin {
  id: number;
  utilisateurNom: string;
  utilisateurPrenom: string;
  utilisateurEmail: string;
  niveauRisque: number;
  typeAlerte: string;
  dateAlerte: string;
  traitee: boolean;
  sourceDescription: string;
  specialisteAssigne?: string;
}

interface Specialiste {
  id: number; nom: string; prenom: string; specialite: string;
}

@Component({
  selector: 'app-alertes-admin',
  imports: [CommonModule, RouterModule, FormsModule, SharedModule],
  templateUrl: './alertes-admin.component.html',
  styleUrls: ['./alertes-admin.component.scss']
})
export class AlertesAdminComponent implements OnInit {

  alertes: AlerteAdmin[] = [];
  alertesFiltrees: AlerteAdmin[] = [];
  specialistes: Specialiste[] = [];
  loading = false;

  filtreType = 'tous';
  filtreNiveau = 'tous';
  filtreStatut = 'tous';
  searchQuery = '';

  // Modal assigner
  showAssignerModal = false;
  alerteSelectionnee: AlerteAdmin | null = null;
  specialisteChoisi: number | null = null;
  assigning = false;

  // Graphique évolution risque (7 jours)
  evolutionRisque = [
    { jour: 'Lun', score: 62 }, { jour: 'Mar', score: 71 }, { jour: 'Mer', score: 65 },
    { jour: 'Jeu', score: 78 }, { jour: 'Ven', score: 70 }, { jour: 'Sam', score: 55 }, { jour: 'Dim', score: 58 }
  ];

  toastMsg = ''; toastType = ''; showToast = false;

  readonly typesAlertes = [
    { value: 'CHARGE_ELEVEE', label: 'Charge élevée', icon: 'ti ti-flame', color: 'text-danger' },
    { value: 'DEADLINE_STRESS', label: 'Deadline stress', icon: 'ti ti-clock', color: 'text-warning' },
    { value: 'LATENCE_LONGUE', label: 'Session longue', icon: 'ti ti-hourglass', color: 'text-info' },
    { value: 'SURCHARGE_CONSECUTIVE', label: 'Surcharge consécutive', icon: 'ti ti-trending-up', color: 'text-danger' },
    { value: 'MANQUE_PAUSE', label: 'Manque de pause', icon: 'ti ti-coffee', color: 'text-warning' },
  ];

  private readonly API = 'http://localhost:8082/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadAlertes(); this.loadSpecialistes(); }

  loadAlertes(): void {
    this.loading = true;
    this.http.get<AlerteAdmin[]>(`${this.API}/admin/alertes-burnout`).subscribe({
      next: (d) => { this.alertes = d; this.applyFilters(); this.loading = false; },
      error: () => { this.alertes = this.getDemoAlertes(); this.applyFilters(); this.loading = false; }
    });
  }

  loadSpecialistes(): void {
    this.http.get<Specialiste[]>(`${this.API}/specialistes`).subscribe({
      next: (d) => this.specialistes = d,
      error: () => this.specialistes = [
        { id: 1, nom: 'Martin', prenom: 'Sophie', specialite: 'Psychologue' },
        { id: 2, nom: 'Dupont', prenom: 'Jean', specialite: 'Coach' }
      ]
    });
  }

  applyFilters(): void {
    let r = [...this.alertes];
    if (this.filtreType !== 'tous') r = r.filter(a => a.typeAlerte === this.filtreType);
    if (this.filtreNiveau !== 'tous') {
      r = r.filter(a => {
        if (this.filtreNiveau === 'critique') return a.niveauRisque >= 8;
        if (this.filtreNiveau === 'eleve') return a.niveauRisque >= 5 && a.niveauRisque < 8;
        return a.niveauRisque < 5;
      });
    }
    if (this.filtreStatut !== 'tous') r = r.filter(a => this.filtreStatut === 'traitee' ? a.traitee : !a.traitee);
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      r = r.filter(a => a.utilisateurNom.toLowerCase().includes(q) || a.utilisateurPrenom.toLowerCase().includes(q));
    }
    r.sort((a, b) => b.niveauRisque - a.niveauRisque);
    this.alertesFiltrees = r;
  }

  marquerTraitee(a: AlerteAdmin): void {
    this.http.patch(`${this.API}/alertes-burnout/${a.id}/traiter`, {}).subscribe({ next: () => {}, error: () => {} });
    a.traitee = true; this.applyFilters();
    this.toast('Alerte marquée comme traitée', 'success');
  }

  ouvrirAssigner(a: AlerteAdmin): void {
    this.alerteSelectionnee = a; this.specialisteChoisi = null; this.showAssignerModal = true;
  }

  confirmerAssignation(): void {
    if (!this.specialisteChoisi || !this.alerteSelectionnee) return;
    this.assigning = true;
    const spec = this.specialistes.find(s => s.id === this.specialisteChoisi);
    this.http.post(`${this.API}/suivi-psycho`, {
      utilisateurId: this.alerteSelectionnee.id,
      specialisteId: this.specialisteChoisi,
      motif: `Assignation suite alerte critique : ${this.getTypeLabel(this.alerteSelectionnee.typeAlerte)}`,
      statut: 'EN_ATTENTE'
    }).subscribe({ next: () => {}, error: () => {} });
    if (spec && this.alerteSelectionnee) {
      this.alerteSelectionnee.specialisteAssigne = `Dr ${spec.prenom} ${spec.nom}`;
      this.alerteSelectionnee.traitee = true;
    }
    this.applyFilters();
    setTimeout(() => { this.assigning = false; this.showAssignerModal = false; this.toast('Spécialiste assigné — séance créée', 'success'); }, 600);
  }

  get stats() {
    return {
      total: this.alertes.length,
      critiques: this.alertes.filter(a => a.niveauRisque >= 8).length,
      nonTraitees: this.alertes.filter(a => !a.traitee).length,
      sansSpecialiste: this.alertes.filter(a => !a.traitee && !a.specialisteAssigne).length
    };
  }

  getNiveauClass(n: number): string {
    if (n >= 8) return 'badge bg-light-danger text-danger';
    if (n >= 5) return 'badge bg-light-warning text-warning';
    return 'badge bg-light-success text-success';
  }
  getNiveauLabel(n: number): string { return n >= 8 ? 'Critique' : n >= 5 ? 'Élevé' : 'Modéré'; }
  getTypeLabel(type: string): string { return this.typesAlertes.find(t => t.value === type)?.label || type; }
  getTypeIcon(type: string): string { return this.typesAlertes.find(t => t.value === type)?.icon || 'ti ti-alert-triangle'; }
  getTypeColor(type: string): string { return this.typesAlertes.find(t => t.value === type)?.color || 'text-muted'; }
  formatDate(d: string): string { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); }
  getInitiales(a: AlerteAdmin): string { return `${a.utilisateurPrenom?.[0] || ''}${a.utilisateurNom?.[0] || ''}`.toUpperCase(); }
  getMaxScore(): number { return Math.max(...this.evolutionRisque.map(e => e.score), 1); }

  private toast(msg: string, type: string): void {
    this.toastMsg = msg; this.toastType = type; this.showToast = true;
    setTimeout(() => this.showToast = false, 3500);
  }

  private getDemoAlertes(): AlerteAdmin[] {
    return [
      { id: 1, utilisateurNom: 'Benali', utilisateurPrenom: 'Ahmed', utilisateurEmail: 'ahmed@company.tn', niveauRisque: 9, typeAlerte: 'SURCHARGE_CONSECUTIVE', dateAlerte: '2025-04-24', traitee: false, sourceDescription: '6h consécutives sans pause' },
      { id: 2, utilisateurNom: 'Gharbi', utilisateurPrenom: 'Sonia', utilisateurEmail: 'sonia@company.tn', niveauRisque: 8, typeAlerte: 'CHARGE_ELEVEE', dateAlerte: '2025-04-23', traitee: false, sourceDescription: 'Score charge 8.5/10' },
      { id: 3, utilisateurNom: 'Trabelsi', utilisateurPrenom: 'Karim', utilisateurEmail: 'karim@company.tn', niveauRisque: 7, typeAlerte: 'DEADLINE_STRESS', dateAlerte: '2025-04-22', traitee: false, sourceDescription: '3 deadlines simultanées' },
      { id: 4, utilisateurNom: 'Mrad', utilisateurPrenom: 'Lina', utilisateurEmail: 'lina@company.tn', niveauRisque: 6, typeAlerte: 'LATENCE_LONGUE', dateAlerte: '2025-04-21', traitee: true, sourceDescription: 'Session 9h30', specialisteAssigne: 'Dr Sophie Martin' },
      { id: 5, utilisateurNom: 'Jrad', utilisateurPrenom: 'Mohamed', utilisateurEmail: 'mohamed@company.tn', niveauRisque: 5, typeAlerte: 'MANQUE_PAUSE', dateAlerte: '2025-04-20', traitee: false, sourceDescription: '4h sans pause enregistrée' },
      { id: 6, utilisateurNom: 'Ben Ali', utilisateurPrenom: 'Nour', utilisateurEmail: 'nour@company.tn', niveauRisque: 9, typeAlerte: 'CHARGE_ELEVEE', dateAlerte: '2025-04-19', traitee: false, sourceDescription: 'Score charge 9/10 pendant 3 jours' },
    ];
  }
}