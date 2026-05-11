import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from 'src/app/theme/shared/shared.module';

interface RessourceBienEtre {
  id: number;
  titre: string;
  type: 'EXERCICE' | 'ARTICLE' | 'VIDEO' | 'MEDITATION';
  niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  gratuit: boolean;
  actif: boolean;
  consultations: number;
  dureeMinutes: number;
  description: string;
  tags: string[];
}

interface RessourceForm {
  id?: number;
  titre: string; type: string; niveau: string;
  gratuit: boolean; actif: boolean;
  dureeMinutes: number; description: string; tags: string;
}

@Component({
  selector: 'app-ressources-admin',
  imports: [CommonModule, RouterModule, FormsModule, SharedModule],
  templateUrl: './ressources-admin.component.html',
  styleUrls: ['./ressources-admin.component.scss']
})
export class RessourcesAdminComponent implements OnInit {

  ressources: RessourceBienEtre[] = [];
  ressourcesFiltrees: RessourceBienEtre[] = [];
  loading = false;
  saving = false;

  filtreType = 'tous';
  filtreNiveau = 'tous';
  filtreAcces = 'tous';
  searchQuery = '';

  showModal = false;
  isEdit = false;
  form: RessourceForm = this.emptyForm();

  toastMsg = ''; toastType = ''; showToast = false;

  readonly types = [
    { value: 'EXERCICE',   label: 'Exercice',   icon: 'ti ti-run',       color: 'text-success', bg: 'bg-light-success' },
    { value: 'ARTICLE',    label: 'Article',    icon: 'ti ti-file-text', color: 'text-primary', bg: 'bg-light-primary' },
    { value: 'VIDEO',      label: 'Vidéo',      icon: 'ti ti-player-play', color: 'text-danger',  bg: 'bg-light-danger'  },
    { value: 'MEDITATION', label: 'Méditation', icon: 'ti ti-brain',     color: 'text-info',    bg: 'bg-light-info'    },
  ];

  readonly niveaux = [
    { value: 'DEBUTANT',      label: 'Débutant',       color: 'bg-light-success text-success' },
    { value: 'INTERMEDIAIRE', label: 'Intermédiaire',  color: 'bg-light-warning text-warning' },
    { value: 'AVANCE',        label: 'Avancé',         color: 'bg-light-danger text-danger'   },
  ];

  private readonly API = 'http://localhost:8082/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadRessources(); }

  loadRessources(): void {
    this.loading = true;
    this.http.get<RessourceBienEtre[]>(`${this.API}/ressources`).subscribe({
      next: (d) => { this.ressources = d; this.applyFilters(); this.loading = false; },
      error: () => { this.ressources = this.getDemoRessources(); this.applyFilters(); this.loading = false; }
    });
  }

  applyFilters(): void {
    let r = [...this.ressources];
    if (this.filtreType !== 'tous') r = r.filter(x => x.type === this.filtreType);
    if (this.filtreNiveau !== 'tous') r = r.filter(x => x.niveau === this.filtreNiveau);
    if (this.filtreAcces !== 'tous') r = r.filter(x => this.filtreAcces === 'gratuit' ? x.gratuit : !x.gratuit);
    if (this.searchQuery.trim()) { const q = this.searchQuery.toLowerCase(); r = r.filter(x => x.titre.toLowerCase().includes(q) || x.description.toLowerCase().includes(q)); }
    r.sort((a, b) => b.consultations - a.consultations);
    this.ressourcesFiltrees = r;
  }

  ouvrirCreer(): void { this.form = this.emptyForm(); this.isEdit = false; this.showModal = true; }

  ouvrirEditer(r: RessourceBienEtre): void {
    this.form = { id: r.id, titre: r.titre, type: r.type, niveau: r.niveau, gratuit: r.gratuit, actif: r.actif, dureeMinutes: r.dureeMinutes, description: r.description, tags: r.tags.join(', ') };
    this.isEdit = true; this.showModal = true;
  }

  sauvegarder(): void {
    if (!this.form.titre.trim()) { this.toast('Titre requis', 'warning'); return; }
    this.saving = true;
    const payload = { ...this.form, tags: this.form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    const obs = this.isEdit
      ? this.http.put<RessourceBienEtre>(`${this.API}/ressources/${this.form.id}`, payload)
      : this.http.post<RessourceBienEtre>(`${this.API}/ressources`, payload);
    obs.subscribe({
      next: (r) => { if (this.isEdit) { const i = this.ressources.findIndex(x => x.id === r.id); if (i >= 0) this.ressources[i] = r; } else { this.ressources.unshift(r); } this.applyFilters(); this.showModal = false; this.saving = false; this.toast(this.isEdit ? 'Ressource mise à jour' : 'Ressource créée', 'success'); },
      error: () => {
        if (this.isEdit) { const i = this.ressources.findIndex(x => x.id === this.form.id); if (i >= 0) Object.assign(this.ressources[i], payload); }
        else { this.ressources.unshift({ ...payload, id: Date.now(), consultations: 0, tags: payload.tags } as RessourceBienEtre); }
        this.applyFilters(); this.showModal = false; this.saving = false; this.toast(this.isEdit ? 'Ressource mise à jour' : 'Ressource créée', 'success');
      }
    });
  }

  toggleActif(r: RessourceBienEtre): void {
    this.http.patch(`${this.API}/ressources/${r.id}/toggle`, {}).subscribe({ next: () => {}, error: () => {} });
    r.actif = !r.actif; this.applyFilters();
    this.toast(r.actif ? 'Ressource activée' : 'Ressource désactivée', r.actif ? 'success' : 'warning');
  }

  supprimer(r: RessourceBienEtre): void {
    if (!confirm(`Supprimer "${r.titre}" ?`)) return;
    this.http.delete(`${this.API}/ressources/${r.id}`).subscribe({ next: () => {}, error: () => {} });
    this.ressources = this.ressources.filter(x => x.id !== r.id); this.applyFilters();
    this.toast('Ressource supprimée', 'danger');
  }

  get stats() {
    return {
      total: this.ressources.length,
      actives: this.ressources.filter(r => r.actif).length,
      gratuites: this.ressources.filter(r => r.gratuit).length,
      consultationsTotal: this.ressources.reduce((s, r) => s + r.consultations, 0),
      plusPopulaire: this.ressources.sort((a, b) => b.consultations - a.consultations)[0]?.titre || '-'
    };
  }

  getTypeInfo(val: string) { return this.types.find(t => t.value === val) || this.types[0]; }
  getNiveauInfo(val: string) { return this.niveaux.find(n => n.value === val) || this.niveaux[0]; }
  private emptyForm(): RessourceForm { return { titre: '', type: 'EXERCICE', niveau: 'DEBUTANT', gratuit: true, actif: true, dureeMinutes: 15, description: '', tags: '' }; }
  private toast(msg: string, type: string): void { this.toastMsg = msg; this.toastType = type; this.showToast = true; setTimeout(() => this.showToast = false, 3500); }

  private getDemoRessources(): RessourceBienEtre[] {
    return [
      { id: 1, titre: 'Respiration 4-7-8 anti-stress', type: 'EXERCICE', niveau: 'DEBUTANT', gratuit: true, actif: true, consultations: 342, dureeMinutes: 5, description: 'Technique de respiration puissante pour réduire le stress en quelques minutes.', tags: ['respiration', 'stress', 'rapide'] },
      { id: 2, titre: 'Comprendre le burnout : signes et prévention', type: 'ARTICLE', niveau: 'DEBUTANT', gratuit: true, actif: true, consultations: 287, dureeMinutes: 10, description: 'Guide complet sur les signes précoces du burnout et comment les prévenir.', tags: ['burnout', 'prévention', 'guide'] },
      { id: 3, titre: 'Méditation pleine conscience au bureau', type: 'MEDITATION', niveau: 'INTERMEDIAIRE', gratuit: false, actif: true, consultations: 198, dureeMinutes: 20, description: 'Séance de méditation guidée adaptée à l\'environnement de travail.', tags: ['méditation', 'bureau', 'pleine conscience'] },
      { id: 4, titre: 'Yoga de bureau — 7 postures', type: 'VIDEO', niveau: 'DEBUTANT', gratuit: true, actif: true, consultations: 156, dureeMinutes: 15, description: 'Enchaînement de postures de yoga réalisables sans quitter son bureau.', tags: ['yoga', 'bureau', 'corps'] },
      { id: 5, titre: 'Gestion avancée du temps : méthode Pomodoro++', type: 'ARTICLE', niveau: 'AVANCE', gratuit: false, actif: false, consultations: 89, dureeMinutes: 25, description: 'Version améliorée de la technique Pomodoro pour les profils à haut stress.', tags: ['temps', 'productivité', 'avancé'] },
    ];
  }
}