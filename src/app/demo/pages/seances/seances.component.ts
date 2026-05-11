import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Specialiste {
  id: number; nom: string; prenom: string; specialite: string;
  telephone?: string; tarif?: number; disponible?: boolean;
}
interface Disponibilite {
  id: number; specialisteId: number; date: string;
  heureDebut: string; heureFin: string; reservee: boolean;
}
interface Rapport {
  id: number; contenu: string; dateCreation: string; recommendations: string;
}
interface SuiviPsycho {
  id: number; utilisateurId: number; specialiste: Specialiste;
  date: string; heure: string; dureeMinutes: number;
  statut: 'PLANIFIEE' | 'EFFECTUEE' | 'ANNULEE' | 'EN_ATTENTE';
  typeSeance: 'PRESENTIEL' | 'EN_LIGNE';
  motif: string; rapport?: Rapport; programmeId?: number; noteUtilisateur?: number;
}
interface PrevisionIA {
  risqueRechute: number; frequenceRecommandee: string;
  prochaineSeanceIdeal: string; facteursPrincipaux: string[];
  scoreEngagement: number; tendance: 'amelioration' | 'stable' | 'degradation';
  messageIA: string;
}
interface NouvelleSeance {
  specialisteId: number | null; disponibiliteId: number | null;
  typeSeance: 'PRESENTIEL' | 'EN_LIGNE'; motif: string; date: string; heure: string;
}
interface NotifToast {
  id: number; message: string; type: 'success' | 'warning' | 'danger' | 'info'; visible: boolean;
}
interface CalJour {
  date: Date | null;
  isToday: boolean; isSelected: boolean; isPast: boolean;
  isIASuggested: boolean; seances: SuiviPsycho[];
}
interface RdvNotifData {
  date: string; heure: string;
  specialistePrenom: string; specialisteNom: string;
  typeSeance: 'PRESENTIEL' | 'EN_LIGNE'; messageIA?: string;
}

@Component({
  selector: 'app-seances',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './seances.component.html',
  styleUrls: ['./seances.component.scss']
})
export class SeancesComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('particleCanvas') particleCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorGlow') cursorGlowRef!: ElementRef<HTMLDivElement>;

  loading = true;
  navScrolled = false;
  userId = 1;
  seances: SuiviPsycho[] = [];
  seancesFiltrees: SuiviPsycho[] = [];
  specialistes: Specialiste[] = [];
  disponibilites: Disponibilite[] = [];

  filtreStatut = 'tous'; filtreType = 'tous'; sortBy = 'date_desc';

  showPlanifier = false; showRapport = false;
  rapportActif: Rapport | null = null;
  showDetailSeance = false; seanceDetail: SuiviPsycho | null = null;

  prevision: PrevisionIA | null = null;
  previsionLoading = false; showPrevisionDetail = false;

  nouvelleSeance: NouvelleSeance = {
    specialisteId: null, disponibiliteId: null,
    typeSeance: 'EN_LIGNE', motif: '', date: '', heure: ''
  };
  planifierStep = 1; planifierLoading = false;
  disponibilitesSpecialiste: Disponibilite[] = [];

  toasts: NotifToast[] = []; toastCounter = 0;

  showCalendrier = false;
  calMoisActuel = new Date().getMonth();
  calAnneeActuelle = new Date().getFullYear();
  calJours: CalJour[] = [];
  calJourSelectionne: CalJour | null = null;

  joursNoms = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
              'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  showRdvNotif = false;
  rdvNotifHiding = false;
  rdvNotifData: RdvNotifData | null = null;
  rdvNotifDuration = 8000;
  private rdvNotifTimer: any = null;

  get totalEffectuees() { return this.seances.filter(s => s.statut === 'EFFECTUEE').length; }
  get totalPlanifiees() { return this.seances.filter(s => s.statut === 'PLANIFIEE' || s.statut === 'EN_ATTENTE').length; }
  get prochaine() {
    // ✅ FIX : comparaison avec today sans heure pour éviter les faux positifs
    const todayStr = this.getTodayISOString();
    return this.seances.find(s =>
      (s.statut === 'PLANIFIEE' || s.statut === 'EN_ATTENTE') && s.date >= todayStr
    );
  }
  get tauxPresence() {
    const total = this.seances.filter(s => s.statut !== 'EN_ATTENTE').length;
    if (!total) return 0;
    return Math.round((this.totalEffectuees / total) * 100);
  }

  private readonly API = 'http://localhost:8082/api';
  private readonly GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly GROQ_KEY = '';
  private readonly GROQ_MODEL = 'llama-3.3-70b-versatile';

  private ctx!: CanvasRenderingContext2D;
  private particles: any[] = [];
  private animId!: number;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadAll(); }
  ngAfterViewInit(): void { this.initParticles(); }
  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
    if (this.rdvNotifTimer) clearTimeout(this.rdvNotifTimer);
  }

  @HostListener('window:scroll')
  onScroll(): void { this.navScrolled = window.scrollY > 20; }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (this.cursorGlowRef?.nativeElement) {
      this.cursorGlowRef.nativeElement.style.left = e.clientX + 'px';
      this.cursorGlowRef.nativeElement.style.top = e.clientY + 'px';
    }
  }

  // ── HELPER DATE CRITIQUE ───────────────────────────────
  /**
   * Retourne la date d'aujourd'hui au format YYYY-MM-DD
   * en utilisant l'heure locale (pas UTC) pour éviter le décalage.
   */
  private getTodayISOString(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Retourne une date future à N jours de MAINTENANT au format ISO YYYY-MM-DD.
   * Utilise l'heure locale pour éviter tout décalage UTC.
   */
  private getFutureDateISOString(daysFromNow: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${mo}-${da}`;
  }

  // ── DATA ───────────────────────────────────────────────
  loadAll(): void {
    this.loading = true;
    this.http.get<SuiviPsycho[]>(`${this.API}/suivi-psycho/utilisateur/${this.userId}`)
      .subscribe({
        next: (data) => {
          this.seances = data; this.applyFilters(); this.loading = false;
          this.loadPrevisionIA(); this.genererCalendrier();
        },
        error: () => {
          this.seances = this.getDemoSeances(); this.applyFilters(); this.loading = false;
          this.loadPrevisionIA(); this.genererCalendrier();
        }
      });
    this.http.get<Specialiste[]>(`${this.API}/specialistes`)
      .subscribe({ next: (d) => this.specialistes = d, error: () => this.specialistes = this.getDemoSpecialistes() });
  }

  applyFilters(): void {
    let r = [...this.seances];
    if (this.filtreStatut !== 'tous') r = r.filter(s => s.statut === this.filtreStatut);
    if (this.filtreType !== 'tous') r = r.filter(s => s.typeSeance === this.filtreType);
    r.sort((a, b) => {
      if (this.sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (this.sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      return 0;
    });
    this.seancesFiltrees = r;
  }

  // ── ✦ IA PRÉVISION RECHUTE ─────────────────────────────
  loadPrevisionIA(): void {
    if (!this.seances.length) return;
    this.previsionLoading = true;

    const today = this.getTodayISOString();
    // ✅ Date minimale = demain, max = 60 jours à partir d'aujourd'hui
    const minDate = this.getFutureDateISOString(1);   // demain
    const maxDate = this.getFutureDateISOString(60);  // dans 60 jours

    const effectuees = this.seances.filter(s => s.statut === 'EFFECTUEE');
    const annulees = this.seances.filter(s => s.statut === 'ANNULEE');
    const derniere = [...effectuees].sort((a, b) => b.date.localeCompare(a.date))[0];

    // ✅ Calcul correct : on compare les strings ISO YYYY-MM-DD directement
    const joursDepuisDerniere = derniere
      ? Math.floor((new Date(today).getTime() - new Date(derniere.date).getTime()) / 86400000)
      : 999;

    const intervalles = this.calculerIntervallesMoyens(effectuees);

    // ✅ Prompt très explicite sur les contraintes de date
    const prompt = `Tu es un expert en psychologie du travail et prévention du burnout.
CONTRAINTE ABSOLUE : La date d'aujourd'hui est ${today}. 
La date "prochaineSeanceIdeal" DOIT être STRICTEMENT APRÈS ${today}.
Elle doit être entre ${minDate} et ${maxDate}.
NE JAMAIS retourner une date passée ou égale à aujourd'hui.

Analyse cet historique :
- Aujourd'hui : ${today}
- Séances effectuées : ${effectuees.length}
- Séances annulées : ${annulees.length}
- Jours depuis dernière séance : ${joursDepuisDerniere}
- Intervalle moyen entre séances (jours) : ${intervalles}
- Taux de présence : ${this.tauxPresence}%
- Motifs récents : ${effectuees.slice(0, 3).map(s => s.motif).join(', ')}

Réponds UNIQUEMENT avec ce JSON valide (sans backticks, sans texte avant ou après) :
{
  "risqueRechute": <entier 0-100>,
  "frequenceRecommandee": "<texte court français>",
  "prochaineSeanceIdeal": "<date YYYY-MM-DD STRICTEMENT après ${today}, entre ${minDate} et ${maxDate}>",
  "facteursPrincipaux": ["<facteur 1>", "<facteur 2>", "<facteur 3>"],
  "scoreEngagement": <entier 0-100>,
  "tendance": "<amelioration|stable|degradation>",
  "messageIA": "<message bienveillant 2 phrases max en français>"
}`;

    this.callGroq(prompt).then(text => {
      try {
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed: PrevisionIA = JSON.parse(clean);

        // ✅ VALIDATION CÔTÉ CLIENT : si la date retournée est passée ou aujourd'hui → on corrige
        const dateRetournee = parsed.prochaineSeanceIdeal?.split('T')[0];
        if (!dateRetournee || dateRetournee <= today) {
          console.warn(`[IA] Date invalide reçue: "${dateRetournee}", correction automatique.`);
          // Calcul basé sur l'intervalle ou 14 jours par défaut
          const joursDefaut = intervalles > 0 ? Math.min(intervalles, 30) : 14;
          parsed.prochaineSeanceIdeal = this.getFutureDateISOString(joursDefaut);
        }

        this.prevision = parsed;
        this.genererCalendrier();
      } catch {
        console.warn('[IA] Parsing JSON échoué, fallback utilisé.');
        this.prevision = this.getFallbackPrevision();
        this.genererCalendrier();
      }
      this.previsionLoading = false;
    }).catch(() => {
      this.prevision = this.getFallbackPrevision();
      this.genererCalendrier();
      this.previsionLoading = false;
    });
  }

  private calculerIntervallesMoyens(seances: SuiviPsycho[]): number {
    if (seances.length < 2) return 0;
    const sorted = [...seances].sort((a, b) => a.date.localeCompare(b.date));
    let total = 0;
    for (let i = 1; i < sorted.length; i++) {
      total += (new Date(sorted[i].date).getTime() - new Date(sorted[i-1].date).getTime()) / 86400000;
    }
    return Math.round(total / (sorted.length - 1));
  }

  private getFallbackPrevision(): PrevisionIA {
    const risque = this.tauxPresence < 60 ? 72 : this.tauxPresence < 80 ? 45 : 28;
    // ✅ Fallback utilise aussi getFutureDateISOString
    const joursAvant = risque > 60 ? 7 : risque > 40 ? 14 : 21;
    return {
      risqueRechute: risque,
      frequenceRecommandee: 'toutes les 2 semaines',
      prochaineSeanceIdeal: this.getFutureDateISOString(joursAvant),
      facteursPrincipaux: ['Irrégularité des séances', 'Charge de travail élevée', 'Manque de suivi continu'],
      scoreEngagement: this.tauxPresence,
      tendance: risque > 60 ? 'degradation' : risque > 40 ? 'stable' : 'amelioration',
      messageIA: `Votre suivi montre un taux de présence de ${this.tauxPresence}%. Maintenir la régularité est clé pour réduire le risque de rechute.`
    };
  }

  private async callGroq(prompt: string): Promise<string> {
    const r = await fetch(this.GROQ_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.GROQ_KEY}` },
      body: JSON.stringify({
        model: this.GROQ_MODEL, max_tokens: 500, temperature: 0.1, // ✅ température basse pour plus de précision
        messages: [
          { role: 'system', content: `Tu es un expert en santé mentale au travail. Aujourd'hui est le ${this.getTodayISOString()}. Tu réponds UNIQUEMENT en JSON valide sans aucun texte autour. TOUTE date future doit être STRICTEMENT après ${this.getTodayISOString()}.` },
          { role: 'user', content: prompt }
        ]
      })
    });
    const data = await r.json();
    return data?.choices?.[0]?.message?.content || '';
  }

  // ── CALENDRIER ─────────────────────────────────────────
  ouvrirCalendrier(): void {
    this.calMoisActuel = new Date().getMonth();
    this.calAnneeActuelle = new Date().getFullYear();
    this.calJourSelectionne = null;
    this.genererCalendrier();
    this.showCalendrier = true;
  }

  fermerCalendrier(): void { this.showCalendrier = false; this.calJourSelectionne = null; }

  genererCalendrier(): void {
    const todayStr = this.getTodayISOString();
    const premierJour = new Date(this.calAnneeActuelle, this.calMoisActuel, 1);
    const dernierJour = new Date(this.calAnneeActuelle, this.calMoisActuel + 1, 0);

    let debutSemaine = premierJour.getDay() - 1;
    if (debutSemaine < 0) debutSemaine = 6;

    const jours: CalJour[] = [];
    for (let i = 0; i < debutSemaine; i++) {
      jours.push({ date: null, isToday: false, isSelected: false, isPast: false, isIASuggested: false, seances: [] });
    }

    // ✅ Date IA : on compare en YYYY-MM-DD string pour éviter les problèmes UTC
    const iaSuggestedStr = this.prevision?.prochaineSeanceIdeal?.split('T')[0] || null;

    for (let d = 1; d <= dernierJour.getDate(); d++) {
      const date = new Date(this.calAnneeActuelle, this.calMoisActuel, d);
      const dateStr = this.formatDateToISO(date);

      const seancesDuJour = this.seances.filter(s => s.date.split('T')[0] === dateStr);

      jours.push({
        date,
        isToday: dateStr === todayStr,
        isSelected: false,
        isPast: dateStr < todayStr, // ✅ comparaison string YYYY-MM-DD fiable
        isIASuggested: iaSuggestedStr ? dateStr === iaSuggestedStr : false,
        seances: seancesDuJour
      });
    }
    this.calJours = jours;
  }

  /** Formate une Date locale en YYYY-MM-DD sans passer par UTC */
  private formatDateToISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  selectionnerJour(jour: CalJour): void {
    this.calJours.forEach(j => j.isSelected = false);
    jour.isSelected = true;
    this.calJourSelectionne = jour;
  }

  prevMois(): void {
    if (this.calMoisActuel === 0) { this.calMoisActuel = 11; this.calAnneeActuelle--; }
    else this.calMoisActuel--;
    this.calJourSelectionne = null; this.genererCalendrier();
  }

  nextMois(): void {
    if (this.calMoisActuel === 11) { this.calMoisActuel = 0; this.calAnneeActuelle++; }
    else this.calMoisActuel++;
    this.calJourSelectionne = null; this.genererCalendrier();
  }

  getNomMois(index: number): string { return this.moisNoms[index]; }

  planifierDepuisCalendrier(jour: CalJour): void {
    if (!jour.date) return;
    this.nouvelleSeance.date = this.formatDateToISO(jour.date);
    this.fermerCalendrier();
    this.planifierStep = 1;
    this.showPlanifier = true;
  }

  // ── NOTIFICATION RDV ───────────────────────────────────
  afficherNotifRdv(seance: SuiviPsycho): void {
    this.genererMessageNotifIA(seance).then(messageIA => {
      this.rdvNotifData = {
        date: seance.date, heure: seance.heure,
        specialistePrenom: seance.specialiste.prenom,
        specialisteNom: seance.specialiste.nom,
        typeSeance: seance.typeSeance, messageIA
      };
      this.showRdvNotif = true; this.rdvNotifHiding = false;
      if (this.rdvNotifTimer) clearTimeout(this.rdvNotifTimer);
      this.rdvNotifTimer = setTimeout(() => this.dismissRdvNotif(), this.rdvNotifDuration);
    });
  }

  dismissRdvNotif(): void {
    this.rdvNotifHiding = true;
    setTimeout(() => { this.showRdvNotif = false; this.rdvNotifData = null; this.rdvNotifHiding = false; }, 450);
  }

  private async genererMessageNotifIA(seance: SuiviPsycho): Promise<string> {
    try {
      const prompt = `En 1 phrase courte et bienveillante en français (max 20 mots), encourage l'utilisateur pour sa séance psychologique planifiée avec Dr ${seance.specialiste.prenom} ${seance.specialiste.nom} le ${new Date(seance.date).toLocaleDateString('fr-FR')} pour : "${seance.motif}". Réponds UNIQUEMENT avec la phrase, sans guillemets.`;
      return (await this.callGroq(prompt)).trim().replace(/^["']|["']$/g, '');
    } catch {
      return 'Prendre soin de soi est la meilleure décision — à bientôt pour cette séance !';
    }
  }

  // ── PLANIFIER ──────────────────────────────────────────
  ouvrirPlanifier(): void {
    this.nouvelleSeance = { specialisteId: null, disponibiliteId: null, typeSeance: 'EN_LIGNE', motif: '', date: '', heure: '' };
    this.planifierStep = 1; this.showPlanifier = true;
  }
  fermerPlanifier(): void { this.showPlanifier = false; this.planifierStep = 1; }

  choisirSpecialiste(id: number): void {
    this.nouvelleSeance.specialisteId = id;
    this.loadDisponibilites(id); this.planifierStep = 2;
  }

  loadDisponibilites(specialisteId: number): void {
    this.http.get<Disponibilite[]>(`${this.API}/disponibilites/specialiste/${specialisteId}`)
      .subscribe({
        next: (d) => this.disponibilitesSpecialiste = d.filter(dispo => !dispo.reservee),
        error: () => this.disponibilitesSpecialiste = this.getDemoDisponibilites()
      });
  }

  choisirDisponibilite(dispo: Disponibilite): void {
    this.nouvelleSeance.disponibiliteId = dispo.id;
    this.nouvelleSeance.date = dispo.date;
    this.nouvelleSeance.heure = dispo.heureDebut;
    this.planifierStep = 3;
  }

  goStep(step: number): void { this.planifierStep = step; }

  confirmerSeance(): void {
    if (!this.nouvelleSeance.motif.trim()) { this.showToast('Veuillez indiquer un motif', 'warning'); return; }
    this.planifierLoading = true;
    const payload = {
      utilisateurId: this.userId,
      specialisteId: this.nouvelleSeance.specialisteId,
      disponibiliteId: this.nouvelleSeance.disponibiliteId,
      typeSeance: this.nouvelleSeance.typeSeance,
      motif: this.nouvelleSeance.motif,
      date: this.nouvelleSeance.date,
      heure: this.nouvelleSeance.heure,
      statut: 'EN_ATTENTE'
    };
    this.http.post<SuiviPsycho>(`${this.API}/suivi-psycho`, payload).subscribe({
      next: (s) => {
        this.seances.unshift(s); this.applyFilters(); this.genererCalendrier();
        this.planifierStep = 4; this.planifierLoading = false;
        this.showToast('Séance planifiée avec succès !', 'success');
        this.afficherNotifRdv(s);
      },
      error: () => {
        const spec = this.specialistes.find(s => s.id === this.nouvelleSeance.specialisteId);
        const demo: SuiviPsycho = {
          id: Date.now(), utilisateurId: this.userId,
          specialiste: spec || this.getDemoSpecialistes()[0],
          date: this.nouvelleSeance.date, heure: this.nouvelleSeance.heure,
          dureeMinutes: 50, statut: 'EN_ATTENTE',
          typeSeance: this.nouvelleSeance.typeSeance, motif: this.nouvelleSeance.motif
        };
        this.seances.unshift(demo); this.applyFilters(); this.genererCalendrier();
        this.planifierStep = 4; this.planifierLoading = false;
        this.showToast('Séance planifiée avec succès !', 'success');
        this.afficherNotifRdv(demo);
      }
    });
  }

  voirRapport(seance: SuiviPsycho, e: Event): void {
    e.stopPropagation();
    if (seance.rapport) { this.rapportActif = seance.rapport; this.showRapport = true; return; }
    this.http.get<Rapport>(`${this.API}/rapports/seance/${seance.id}`).subscribe({
      next: (r) => { seance.rapport = r; this.rapportActif = r; this.showRapport = true; },
      error: () => {
        this.rapportActif = { id: 1, contenu: 'Séance productive. Le patient montre une bonne progression.', dateCreation: seance.date, recommendations: 'Pratiquer 10 minutes de respiration profonde chaque matin.' };
        this.showRapport = true;
      }
    });
  }

  ouvrirDetail(seance: SuiviPsycho): void { this.seanceDetail = seance; this.showDetailSeance = true; }
  fermerDetail(): void { this.showDetailSeance = false; this.seanceDetail = null; }

  showToast(message: string, type: NotifToast['type'] = 'info'): void {
    const id = ++this.toastCounter;
    this.toasts.push({ id, message, type, visible: true });
    setTimeout(() => {
      const t = this.toasts.find(t => t.id === id);
      if (t) { t.visible = false; setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 400); }
    }, 4000);
  }
  dismissToast(id: number): void {
    const t = this.toasts.find(t => t.id === id);
    if (t) { t.visible = false; setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 400); }
  }

  getStatutClass(statut: string): string {
    const m: Record<string,string> = { 'PLANIFIEE':'st-planifiee','EFFECTUEE':'st-effectuee','ANNULEE':'st-annulee','EN_ATTENTE':'st-attente' };
    return m[statut] || '';
  }
  getStatutLabel(statut: string): string {
    const m: Record<string,string> = { 'PLANIFIEE':'📅 Planifiée','EFFECTUEE':'✓ Effectuée','ANNULEE':'✕ Annulée','EN_ATTENTE':'⏳ En attente' };
    return m[statut] || statut;
  }
  getTypeIcon(type: string): string { return type === 'EN_LIGNE' ? '💻' : '🏥'; }

  formatDate(d: string): string {
    // ✅ Forcer le parsing en heure locale pour éviter le décalage UTC d'1 jour
    const parts = d.split('T')[0].split('-');
    const date = new Date(+parts[0], +parts[1]-1, +parts[2]);
    return date.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  }
  formatDateShort(d: string): string {
    const parts = d.split('T')[0].split('-');
    const date = new Date(+parts[0], +parts[1]-1, +parts[2]);
    return date.toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
  }
  formatPrevisionDate(d: string): string {
    const parts = d.split('T')[0].split('-');
    const date = new Date(+parts[0], +parts[1]-1, +parts[2]);
    return date.toLocaleDateString('fr-FR', { day:'numeric', month:'long' });
  }

  getSpecialisteInitiales(s: Specialiste): string { return `${s.prenom?.[0]||''}${s.nom?.[0]||''}`.toUpperCase(); }
  getRisqueColor(r: number): string { return r >= 70 ? '#ef4444' : r >= 40 ? '#f59e0b' : '#10b981'; }
  getRisqueLabel(r: number): string { return r >= 70 ? 'Élevé' : r >= 40 ? 'Modéré' : 'Faible'; }
  getTendanceIcon(t: string): string { return t === 'amelioration' ? '📈' : t === 'degradation' ? '📉' : '➡️'; }
  getSelectedSpecialiste(): Specialiste | undefined { return this.specialistes.find(s => s.id === this.nouvelleSeance.specialisteId); }
  isProchaine(seance: SuiviPsycho): boolean { return this.prochaine?.id === seance.id; }

  private getDemoSeances(): SuiviPsycho[] {
    // ✅ Dates relatives à aujourd'hui pour que les démos soient toujours cohérentes
    const today = this.getTodayISOString();
    const demain = this.getFutureDateISOString(7);
    const il_y_a_30j = this.getFutureDateISOString(-30);
    const il_y_a_60j = this.getFutureDateISOString(-60);
    const il_y_a_90j = this.getFutureDateISOString(-90);
    return [
      { id:1, utilisateurId:1, specialiste:{id:1,nom:'Martin',prenom:'Sophie',specialite:'Psychologue du travail',tarif:80}, date:demain, heure:'14:30', dureeMinutes:50, statut:'PLANIFIEE', typeSeance:'EN_LIGNE', motif:'Suivi mensuel et gestion du stress' },
      { id:2, utilisateurId:1, specialiste:{id:1,nom:'Martin',prenom:'Sophie',specialite:'Psychologue du travail',tarif:80}, date:il_y_a_30j, heure:'10:00', dureeMinutes:50, statut:'EFFECTUEE', typeSeance:'EN_LIGNE', motif:'Bilan trimestriel bien-être', noteUtilisateur:5, rapport:{id:1,contenu:'Excellente session. Progression notable dans la gestion de l\'anxiété.',dateCreation:il_y_a_30j,recommendations:'Continuer les exercices de pleine conscience.'} },
      { id:3, utilisateurId:1, specialiste:{id:2,nom:'Dupont',prenom:'Jean',specialite:'Coach professionnel',tarif:90}, date:il_y_a_60j, heure:'09:00', dureeMinutes:60, statut:'EFFECTUEE', typeSeance:'PRESENTIEL', motif:'Gestion charge de travail', noteUtilisateur:4 },
      { id:4, utilisateurId:1, specialiste:{id:1,nom:'Martin',prenom:'Sophie',specialite:'Psychologue du travail',tarif:80}, date:il_y_a_90j, heure:'11:00', dureeMinutes:50, statut:'ANNULEE', typeSeance:'EN_LIGNE', motif:'Suivi régulier' },
    ];
  }
  private getDemoSpecialistes(): Specialiste[] {
    return [
      { id:1, nom:'Martin', prenom:'Sophie', specialite:'Psychologue du travail', telephone:'0600000001', tarif:80, disponible:true },
      { id:2, nom:'Dupont', prenom:'Jean', specialite:'Coach professionnel', telephone:'0600000002', tarif:90, disponible:true },
      { id:3, nom:'Laurent', prenom:'Marie', specialite:'Psychiatre', telephone:'0600000003', tarif:120, disponible:false },
    ];
  }
  private getDemoDisponibilites(): Disponibilite[] {
    return [
      { id:1, specialisteId:1, date:this.getFutureDateISOString(3), heureDebut:'09:00', heureFin:'09:50', reservee:false },
      { id:2, specialisteId:1, date:this.getFutureDateISOString(5), heureDebut:'14:00', heureFin:'14:50', reservee:false },
      { id:3, specialisteId:1, date:this.getFutureDateISOString(7), heureDebut:'11:00', heureFin:'11:50', reservee:false },
      { id:4, specialisteId:1, date:this.getFutureDateISOString(10), heureDebut:'16:00', heureFin:'16:50', reservee:false },
    ];
  }

  private initParticles(): void {
    const canvas = this.particleCanvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 40; i++) this.particles.push({ x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3, r:Math.random()*2+1, opacity:Math.random()*0.4+0.1 });
    this.animateParticles();
  }
  private animateParticles(): void {
    const canvas = this.particleCanvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      this.ctx.fillStyle = `rgba(37,99,235,${p.opacity})`; this.ctx.fill();
    }
    this.animId = requestAnimationFrame(() => this.animateParticles());
  }
}