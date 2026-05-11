import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface ProgrammeBienEtre {
  id: number; utilisateurId: number; nom: string; objectif: string;
  dureeSemaines: number; progression: number; actif: boolean;
}
interface ExerciceAvecStatut {
  id: number; nom: string; dureeMinutes: number; frequence: string;
  instructions: string; ressourceBienetreId?: number; effectue?: boolean;
}
interface ArticleSante {
  id: number; auteur: string; contenu: string; datePublication: string;
  tags: string; ressourceBienetreId?: number;
}
interface CoachIA {
  scoreBienetre: number; tendance: 'progression' | 'stagnation' | 'regression';
  messageCoach: string; conseilsJour: string[]; focusDuJour: string;
}
interface NotifToast {
  id: number; message: string; type: 'success' | 'warning' | 'danger'; visible: boolean;
}

@Component({
  selector: 'app-programme',
  imports: [CommonModule, RouterModule, DatePipe, SlicePipe],
  templateUrl: './programme.component.html',
  styleUrls: ['./programme.component.scss']
})
export class ProgrammeComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('particleCanvas') particleCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorGlow') cursorGlowRef!: ElementRef<HTMLDivElement>;

  loading = true;
  navScrolled = false;
  userId = 1;

  programme: ProgrammeBienEtre | null = null;
  exercices: ExerciceAvecStatut[] = [];
  articles: ArticleSante[] = [];

  coachIA: CoachIA | null = null;
  coachLoading = false;

  toasts: NotifToast[] = [];
  toastCounter = 0;

  private animId!: number;
  private particles: any[] = [];
  private ctx!: CanvasRenderingContext2D;

  private readonly API = 'http://localhost:8082/api';
  private readonly GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly GROQ_KEY = '';
  private readonly GROQ_MODEL = 'llama-3.3-70b-versatile';

  get exercicesEffectues() { return this.exercices.filter(e => e.effectue).length; }
  get totalExercices() { return this.exercices.length; }

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadAll(); }
  ngAfterViewInit(): void { this.initParticles(); }
  ngOnDestroy(): void { cancelAnimationFrame(this.animId); }

  @HostListener('window:scroll')
  onScroll(): void { this.navScrolled = window.scrollY > 20; }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (this.cursorGlowRef?.nativeElement) {
      this.cursorGlowRef.nativeElement.style.left = e.clientX + 'px';
      this.cursorGlowRef.nativeElement.style.top = e.clientY + 'px';
    }
  }

  loadAll(): void {
    this.loading = true;
    this.http.get<ProgrammeBienEtre[]>(`${this.API}/programmes-prevention/utilisateur/${this.userId}`)
      .subscribe({
        next: (progs) => {
          this.programme = progs.find(p => p.actif) || progs[0] || null;
          if (this.programme) this.loadExercicesEtArticles(this.programme.id);
          else this.loading = false;
        },
        error: () => {
          this.programme = this.getDemoProgramme();
          this.exercices = this.getDemoExercices();
          this.articles = this.getDemoArticles();
          this.loading = false;
          this.loadCoachIA();
        }
      });
  }

  loadExercicesEtArticles(programmeId: number): void {
    this.http.get<ExerciceAvecStatut[]>(`${this.API}/exercices/programme/${programmeId}`)
      .subscribe({
        next: (ex) => { this.exercices = ex.map(e => ({ ...e, effectue: false })); },
        error: () => { this.exercices = this.getDemoExercices(); }
      });
    this.http.get<ArticleSante[]>(`${this.API}/articles-sante/programme/${programmeId}`)
      .subscribe({
        next: (arts) => { this.articles = arts; this.loading = false; this.loadCoachIA(); },
        error: () => { this.articles = this.getDemoArticles(); this.loading = false; this.loadCoachIA(); }
      });
  }

  // ── ✦ FEATURE IA : COACH BIEN-ÊTRE ────────────────────
  // Analyse la progression du programme et génère des conseils personnalisés
  loadCoachIA(): void {
    if (!this.programme) return;
    this.coachLoading = true;

    const today = this.getTodayISO();
    const pct = this.programme.progression || 0;
    const effectues = this.exercicesEffectues;
    const total = this.totalExercices;
    const exercicesNoms = this.exercices.slice(0, 5).map(e => e.nom).join(', ');

    const prompt = `Tu es un coach bien-être bienveillant spécialisé en prévention du burnout.
Aujourd'hui : ${today}
Analyse ce programme bien-être et génère une évaluation JSON UNIQUEMENT (sans backticks, sans texte autour) :
Données :
- Nom du programme : ${this.programme.nom}
- Objectif : ${this.programme.objectif}
- Progression : ${pct}%
- Exercices effectués aujourd'hui : ${effectues}/${total}
- Exercices disponibles : ${exercicesNoms}
- Durée programme : ${this.programme.dureeSemaines} semaines

Réponds UNIQUEMENT avec ce JSON valide :
{
  "scoreBienetre": <entier 0-100 basé sur progression et régularité>,
  "tendance": "<progression|stagnation|regression>",
  "messageCoach": "<message bienveillant et motivant, 2 phrases max en français>",
  "conseilsJour": ["<conseil 1 court>", "<conseil 2 court>", "<conseil 3 court>"],
  "focusDuJour": "<nom exact d'un des exercices à prioriser aujourd'hui>"
}`;

    this.callGroq(prompt).then(text => {
      try {
        this.coachIA = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch {
        this.coachIA = this.getFallbackCoach();
      }
      this.coachLoading = false;
    }).catch(() => {
      this.coachIA = this.getFallbackCoach();
      this.coachLoading = false;
    });
  }

  regenererProgramme(): void {
    this.showToast('Régénération du programme...', 'warning');
    this.loadCoachIA();
  }

  // ── MARQUER EXERCICE ──────────────────────────────────
  marquerExercice(ex: ExerciceAvecStatut): void {
    if (ex.effectue) return;
    ex.effectue = true;
    const total = this.totalExercices;
    if (total > 0 && this.programme) {
      this.programme.progression = Math.round((this.exercicesEffectues / total) * 100);
    }
    this.showToast(`✓ "${ex.nom}" marqué comme effectué !`, 'success');
    // Recalcul coach si tous les exercices du jour sont faits
    if (this.exercicesEffectues === this.totalExercices) {
      setTimeout(() => this.loadCoachIA(), 500);
    }
  }

  creerProgrammeDemo(): void {
    this.programme = this.getDemoProgramme();
    this.exercices = this.getDemoExercices();
    this.articles = this.getDemoArticles();
    this.loadCoachIA();
  }

  // ── HELPERS ───────────────────────────────────────────
  getScoreColor(score: number): string { return score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'; }
  getScoreLabel(score: number): string { return score >= 70 ? 'Excellent' : score >= 40 ? 'À améliorer' : 'Critique'; }

  getExerciceIcon(nom: string): string {
    const n = (nom || '').toLowerCase();
    if (n.includes('respir') || n.includes('respiration')) return '🫁';
    if (n.includes('méditat') || n.includes('meditat')) return '🧘';
    if (n.includes('march') || n.includes('sport') || n.includes('exerc')) return '🏃';
    if (n.includes('sommeil') || n.includes('repos')) return '😴';
    if (n.includes('lecture') || n.includes('journal')) return '📖';
    if (n.includes('social') || n.includes('ami')) return '🤝';
    if (n.includes('yoga')) return '🧘';
    if (n.includes('stretch') || n.includes('étirement')) return '🤸';
    return '💪';
  }

  getExerciceColor(nom: string, alpha: number): string {
    const colors = ['10,110,189','0,194,212','0,212,168','139,92,246','245,158,11','239,68,68'];
    const idx = (nom || '').length % colors.length;
    return `rgba(${colors[idx]},${alpha})`;
  }

  private getFallbackCoach(): CoachIA {
    const pct = this.programme?.progression || 0;
    return {
      scoreBienetre: Math.min(100, pct + 15),
      tendance: pct > 50 ? 'progression' : pct > 20 ? 'stagnation' : 'regression',
      messageCoach: `Vous avancez bien avec ${pct}% de progression ! La régularité est la clé du bien-être durable.`,
      conseilsJour: ['Commencez par 5 minutes de respiration profonde', 'Hydratez-vous régulièrement', 'Accordez-vous une pause de 15 min cet après-midi'],
      focusDuJour: this.exercices[0]?.nom || 'Méditation'
    };
  }

  private getTodayISO(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  private async callGroq(prompt: string): Promise<string> {
    const r = await fetch(this.GROQ_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.GROQ_KEY}` },
      body: JSON.stringify({
        model: this.GROQ_MODEL, max_tokens: 400, temperature: 0.2,
        messages: [
          { role: 'system', content: 'Tu es un coach bien-être. Réponds UNIQUEMENT en JSON valide sans aucun texte autour.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    const data = await r.json();
    return data?.choices?.[0]?.message?.content || '';
  }

  showToast(message: string, type: NotifToast['type'] = 'success'): void {
    const id = ++this.toastCounter;
    this.toasts.push({ id, message, type, visible: true });
    setTimeout(() => {
      const t = this.toasts.find(t => t.id === id);
      if (t) { t.visible = false; setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 400); }
    }, 3500);
  }
  dismissToast(id: number): void {
    const t = this.toasts.find(t => t.id === id);
    if (t) { t.visible = false; setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 400); }
  }

  // ── DEMO DATA ─────────────────────────────────────────
  private getDemoProgramme(): ProgrammeBienEtre {
    return { id:1, utilisateurId:1, nom:'Programme Anti-Burnout Intensif', objectif:'Réduire le stress chronique et améliorer la résilience émotionnelle au travail', dureeSemaines:8, progression:35, actif:true };
  }
  private getDemoExercices(): ExerciceAvecStatut[] {
    return [
      { id:1, nom:'Respiration 4-7-8', dureeMinutes:10, frequence:'2x par jour', instructions:'Inspirez 4 secondes, retenez 7 secondes, expirez 8 secondes. Répétez 4 cycles matin et soir pour activer le système parasympathique.', effectue:false },
      { id:2, nom:'Méditation Pleine Conscience', dureeMinutes:15, frequence:'Chaque matin', instructions:'Asseyez-vous confortablement, fermez les yeux. Concentrez-vous sur votre respiration pendant 15 minutes. Si votre esprit s\'égare, ramenez doucement l\'attention sur le souffle.', effectue:false },
      { id:3, nom:'Marche Consciente', dureeMinutes:30, frequence:'3x par semaine', instructions:'Marchez en plein air 30 minutes sans téléphone. Observez votre environnement, les sons, les sensations. Cette pratique réduit le cortisol de 20% en moyenne.', effectue:false },
      { id:4, nom:'Journal des Émotions', dureeMinutes:10, frequence:'Chaque soir', instructions:'Notez 3 émotions ressenties dans la journée, leur déclencheur et une action positive pour demain. Cet exercice renforce la conscience émotionnelle.', effectue:false },
      { id:5, nom:'Étirements Anti-Tension', dureeMinutes:20, frequence:'Après le travail', instructions:'Séance de stretching ciblant le dos, les épaules et le cou. Ces zones accumulent les tensions du stress. 5 positions maintenues 45 secondes chacune.', effectue:false },
      { id:6, nom:'Hygiene Numérique', dureeMinutes:0, frequence:'Chaque soir', instructions:'Éteignez tous les écrans 1h avant de dormir. Activez le mode Ne Pas Déranger. La lumière bleue perturbe la mélatonine et aggrave l\'anxiété.', effectue:false },
    ];
  }
  private getDemoArticles(): ArticleSante[] {
    return [
      { id:1, auteur:'Dr. Sophie Martin', contenu:'Le burnout n\'apparaît pas du jour au lendemain. Il résulte d\'une accumulation progressive de stress non géré. Les premiers signes incluent la fatigue chronique, le cynisme et une baisse d\'efficacité. Reconnaître ces signaux précocement est crucial pour prévenir l\'épuisement total.', datePublication:'2025-03-15', tags:'burnout,prévention', ressourceBienetreId:1 },
      { id:2, auteur:'Institut de Psychologie du Travail', contenu:'La respiration diaphragmatique active directement le nerf vague et réduit la réponse au stress en moins de 90 secondes. Cette technique simple peut être pratiquée n\'importe où et constitue l\'un des outils les plus puissants de régulation émotionnelle disponibles.', datePublication:'2025-02-28', tags:'respiration,stress', ressourceBienetreId:2 },
      { id:3, auteur:'Dr. Jean Dupont', contenu:'Le sommeil est le pilier fondamental de la récupération psychologique. Pendant les phases de sommeil profond, le cerveau élimine les toxines accumulées et consolide les apprentissages émotionnels. 7 à 9 heures restent la recommandation universelle pour maintenir un équilibre mental optimal.', datePublication:'2025-01-20', tags:'sommeil,récupération', ressourceBienetreId:3 },
    ];
  }

  // ── PARTICLES ─────────────────────────────────────────
  private initParticles(): void {
    const canvas = this.particleCanvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 40; i++) this.particles.push({ x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3, r:Math.random()*2+1, o:Math.random()*0.4+0.1 });
    const draw = () => {
      this.ctx.clearRect(0,0,canvas.width,canvas.height);
      for(const p of this.particles){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;this.ctx.beginPath();this.ctx.arc(p.x,p.y,p.r,0,Math.PI*2);this.ctx.fillStyle=`rgba(10,110,189,${p.o})`;this.ctx.fill();}
      this.animId = requestAnimationFrame(draw);
    };
    draw();
  }
}