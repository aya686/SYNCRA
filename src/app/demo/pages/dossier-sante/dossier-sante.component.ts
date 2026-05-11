import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef,
  AfterViewInit, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// ── Interfaces ────────────────────────────────────────────────────────
interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
  telephone: string;
  adresseCabinet: string;
}

interface Consultation {
  id: number;
  date: string;
  heure: string;
  motif: string;
  medecin?: Medecin;
}

interface Antecedent {
  id: number;
  type: string;
  description: string;
}

interface DocumentMedical {
  id: number;
  nom: string;
  type: string;
  url: string;
}

interface DossierSante {
  id: number;
  utilisateurId: number;
  groupeSanguin: string;
  genre: string;
  dateCreation: string;
  antecedents: Antecedent[];
  consultations: Consultation[];
  documentsMedicaux: DocumentMedical[];
}

@Component({
  selector: 'app-dossier-sante',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dossier-sante.component.html',
  styleUrls: ['./dossier-sante.component.scss']
})
export class DossierSanteComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('particleCanvas') particleCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorGlow') cursorGlowRef!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  // ── State ──────────────────────────────────────────────────────────
  loading = true;
  navScrolled = false;
  dossier: DossierSante | null = null;
  userId = 1; // À remplacer par l'auth service

  // UI toggles
  editingInfo = false;
  showAddAntecedent = false;
  showAllConsultations = false;
  isDragging = false;
  uploadProgress: number | null = null;

  // Forms
  editForm = { groupeSanguin: '', genre: '' };
  newAntecedent = { type: 'ANXIETE', description: '' };

  // AI Feature
  aiAnalyse = '';
  aiLoading = false;

  // Static data
  groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  userInitials = 'ME';

  // Canvas
  private ctx!: CanvasRenderingContext2D;
  private particles: any[] = [];
  private animId!: number;
  private mouse = { x: 0, y: 0 };

  private readonly API = 'http://localhost:8082/api';

  // ── ✦ GROQ API CONFIG ─────────────────────────────────────────────
  // ⚠️ IMPORTANT : remplace YOUR_NEW_GROQ_KEY_HERE par ta nouvelle clé
  // Ne jamais commit cette clé dans Git — utilise un fichier environment.ts
  private readonly GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly GROQ_KEY = ''; // ← colle ta nouvelle clé ici
private readonly GROQ_MODEL = 'llama-3.3-70b-versatile'; // ← modèle actif 2025

  constructor(private http: HttpClient) {}

  // ── Lifecycle ──────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadDossier();
  }

  ngAfterViewInit(): void {
    this.initParticles();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.navScrolled = window.scrollY > 20;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    this.mouse = { x: e.clientX, y: e.clientY };
    if (this.cursorGlowRef?.nativeElement) {
      this.cursorGlowRef.nativeElement.style.left = e.clientX + 'px';
      this.cursorGlowRef.nativeElement.style.top = e.clientY + 'px';
    }
  }

  // ── Data Loading ───────────────────────────────────────────────────
  loadDossier(): void {
    this.loading = true;
    this.http.get<DossierSante>(`${this.API}/dossier-sante/utilisateur/${this.userId}`)
      .subscribe({
        next: (data) => {
          this.dossier = data;
          this.editForm = { groupeSanguin: data.groupeSanguin, genre: data.genre };
          this.loading = false;
          this.loadAiAnalyse();
        },
        error: () => {
          // Données de démo si API non dispo
          this.dossier = this.getDemoData();
          this.loading = false;
          this.loadAiAnalyse();
        }
      });
  }

  // ── ✦ FEATURE IA — Analyse du dossier via GROQ (Llama 3) ──────────
  // Remplace Claude par Groq : même résultat, 100% gratuit
  loadAiAnalyse(): void {
    if (!this.dossier) return;
    this.aiLoading = true;
    this.aiAnalyse = '';

    const prompt = this.buildAiPrompt();

    const body = {
      model: this.GROQ_MODEL,
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant médical bienveillant pour une application de santé au travail. Réponds toujours en français, de manière concise et encourageante.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    fetch(this.GROQ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.GROQ_KEY}`
      },
      body: JSON.stringify(body)
    })
    .then(r => r.json())
    .then(data => {
      // Format réponse Groq (compatible OpenAI) : data.choices[0].message.content
      const text = data?.choices?.[0]?.message?.content || '';
      this.aiAnalyse = text;
      this.aiLoading = false;
    })
    .catch(() => {
      // Fallback analyse statique si API non dispo
      this.aiAnalyse = this.getFallbackAnalyse();
      this.aiLoading = false;
    });
  }

  private buildAiPrompt(): string {
    const d = this.dossier!;
    const antecedentsStr = d.antecedents.map(a => `${a.type}: ${a.description}`).join(', ') || 'aucun';
    const nbConsultations = d.consultations.length;
    const derniereConsultation = d.consultations[0]?.date
      ? new Date(d.consultations[0].date).toLocaleDateString('fr-FR')
      : 'jamais';

    return `Analyse ce dossier de santé de manière concise (2-3 phrases max) et donne une observation utile et encourageante :

Groupe sanguin : ${d.groupeSanguin}
Genre : ${d.genre}
Antécédents : ${antecedentsStr}
Nombre de consultations : ${nbConsultations}
Dernière consultation : ${derniereConsultation}
Documents médicaux : ${d.documentsMedicaux.length} fichiers

Génère une analyse bienveillante qui mentionne les points de vigilance et encourage le suivi médical régulier.
Reste très concis, en français, sans titre ni liste.`;
  }

  private getFallbackAnalyse(): string {
    const d = this.dossier!;
    const hasStress = d.antecedents.some(a =>
      ['STRESS', 'BURN_OUT', 'ANXIETE'].includes(a.type?.toUpperCase() || '')
    );

    if (hasStress) {
      return `Votre dossier indique des antécédents liés au stress et à l'anxiété — un suivi régulier avec votre spécialiste est recommandé. ${d.consultations.length > 0 ? 'Vos consultations passées montrent un bon engagement envers votre santé.' : 'N\'oubliez pas de planifier votre prochaine consultation.'} Continuez à prendre soin de vous.`;
    }
    return `Votre dossier de santé est bien structuré avec ${d.consultations.length} consultation(s) enregistrée(s). Maintenir un suivi médical régulier est essentiel pour prévenir le burn-out et préserver votre bien-être au travail.`;
  }

  // ── Edit Info ──────────────────────────────────────────────────────
  toggleEditInfo(): void {
    this.editingInfo = !this.editingInfo;
    if (this.editingInfo && this.dossier) {
      this.editForm = { groupeSanguin: this.dossier.groupeSanguin, genre: this.dossier.genre };
    }
  }

  saveInfo(): void {
    if (!this.dossier) return;
    this.http.put<DossierSante>(`${this.API}/dossier-sante/${this.dossier.id}`, {
      ...this.dossier,
      groupeSanguin: this.editForm.groupeSanguin,
      genre: this.editForm.genre
    }).subscribe({
      next: (updated) => {
        this.dossier = updated;
        this.editingInfo = false;
      },
      error: () => {
        this.dossier!.groupeSanguin = this.editForm.groupeSanguin;
        this.dossier!.genre = this.editForm.genre;
        this.editingInfo = false;
      }
    });
  }

  // ── Antécédents ────────────────────────────────────────────────────
  addAntecedent(): void {
    if (!this.newAntecedent.description.trim() || !this.dossier) return;

    this.http.post<Antecedent>(`${this.API}/antecedents/dossier/${this.dossier.id}`, this.newAntecedent)
      .subscribe({
        next: (ant) => {
          this.dossier!.antecedents.push(ant);
          this.newAntecedent = { type: 'ANXIETE', description: '' };
          this.showAddAntecedent = false;
        },
        error: () => {
          this.dossier!.antecedents.push({ id: Date.now(), ...this.newAntecedent });
          this.newAntecedent = { type: 'ANXIETE', description: '' };
          this.showAddAntecedent = false;
        }
      });
  }

  deleteAntecedent(id: number): void {
    this.http.delete(`${this.API}/antecedents/${id}`).subscribe({
      next: () => {
        this.dossier!.antecedents = this.dossier!.antecedents.filter(a => a.id !== id);
      },
      error: () => {
        this.dossier!.antecedents = this.dossier!.antecedents.filter(a => a.id !== id);
      }
    });
  }

  // ── Documents Upload ───────────────────────────────────────────────
  triggerUpload(): void {
    this.fileInputRef?.nativeElement?.click();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.uploadFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.uploadFile(input.files[0]);
  }

  uploadFile(file: File): void {
    if (!this.dossier) return;
    if (file.size > 10 * 1024 * 1024) { alert('Fichier trop volumineux (max 10MB)'); return; }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('dossierId', String(this.dossier.id));
    formData.append('nom', file.name);
    formData.append('type', this.getDocumentType(file.name));

    this.uploadProgress = 0;

    const interval = setInterval(() => {
      if (this.uploadProgress! < 90) this.uploadProgress! += 10;
    }, 100);

    this.http.post<DocumentMedical>(`${this.API}/documents/upload`, formData)
      .subscribe({
        next: (doc) => {
          clearInterval(interval);
          this.uploadProgress = 100;
          setTimeout(() => {
            this.dossier!.documentsMedicaux.push(doc);
            this.uploadProgress = null;
          }, 500);
        },
        error: () => {
          clearInterval(interval);
          this.uploadProgress = 100;
          setTimeout(() => {
            this.dossier!.documentsMedicaux.push({
              id: Date.now(),
              nom: file.name,
              type: this.getDocumentType(file.name),
              url: URL.createObjectURL(file)
            });
            this.uploadProgress = null;
          }, 500);
        }
      });
  }

  deleteDocument(id: number): void {
    this.http.delete(`${this.API}/documents/${id}`).subscribe({
      next: () => { this.dossier!.documentsMedicaux = this.dossier!.documentsMedicaux.filter(d => d.id !== id); },
      error: () => { this.dossier!.documentsMedicaux = this.dossier!.documentsMedicaux.filter(d => d.id !== id); }
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────
  getAntecedentClass(type: string): string {
    const map: Record<string, string> = {
      'ANXIETE': 'ant-anxiete',
      'DEPRESSION': 'ant-depression',
      'STRESS': 'ant-stress',
      'TROUBLE_SOMMEIL': 'ant-sommeil',
      'BURN_OUT': 'ant-burnout'
    };
    return map[type?.toUpperCase()] || 'ant-stress';
  }

  formatAntecedentType(type: string): string {
    const map: Record<string, string> = {
      'ANXIETE': 'Anxiété', 'DEPRESSION': 'Dépression',
      'STRESS': 'Stress', 'TROUBLE_SOMMEIL': 'Sommeil', 'BURN_OUT': 'Burn-out'
    };
    return map[type?.toUpperCase()] || type;
  }

  getMedecinInitials(medecin: Medecin): string {
    return `${medecin.prenom?.[0] || ''}${medecin.nom?.[0] || ''}`.toUpperCase();
  }

  getDocIcon(type: string): string {
    const map: Record<string, string> = { 'ORDONNANCE': '📋', 'RADIO': '🩻', 'ANALYSE': '🔬' };
    return map[type?.toUpperCase()] || '📄';
  }

  getDocTypeClass(type: string): string {
    const map: Record<string, string> = {
      'ORDONNANCE': 'doc-pdf', 'RADIO': 'doc-image', 'ANALYSE': 'doc-doc'
    };
    return map[type?.toUpperCase()] || 'doc-default';
  }

  private getDocumentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'ORDONNANCE';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'RADIO';
    return 'ANALYSE';
  }

  // ── Demo Data (fallback si API down) ──────────────────────────────
  private getDemoData(): DossierSante {
    return {
      id: 1, utilisateurId: 1,
      groupeSanguin: 'A+', genre: 'Masculin',
      dateCreation: '2024-01-15',
      antecedents: [
        { id: 1, type: 'STRESS', description: 'Stress chronique lié au travail - diagnostiqué en 2023' },
        { id: 2, type: 'TROUBLE_SOMMEIL', description: 'Insomnies légères — traitement en cours' }
      ],
      consultations: [
        { id: 1, date: '2025-03-10', heure: '14:30', motif: 'Bilan bien-être annuel et suivi stress',
          medecin: { id: 1, nom: 'Martin', prenom: 'Sophie', specialite: 'Psychologue du travail', telephone: '0600000001', adresseCabinet: 'Paris' } },
        { id: 2, date: '2025-01-20', heure: '10:00', motif: 'Consultation de suivi — troubles du sommeil',
          medecin: { id: 2, nom: 'Dupont', prenom: 'Jean', specialite: 'Médecin généraliste', telephone: '0600000002', adresseCabinet: 'Lyon' } }
      ],
      documentsMedicaux: [
        { id: 1, nom: 'Ordonnance-2025-03.pdf', type: 'ORDONNANCE', url: '#' },
        { id: 2, nom: 'Analyse-sang-jan2025.pdf', type: 'ANALYSE', url: '#' }
      ]
    };
  }

  // ── Particle Canvas ────────────────────────────────────────────────
  private initParticles(): void {
    const canvas = this.particleCanvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.1
      });
    }
    this.animateParticles();
  }

  private animateParticles(): void {
    const canvas = this.particleCanvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(37, 99, 235, ${p.opacity})`;
      this.ctx.fill();
    }

    this.animId = requestAnimationFrame(() => this.animateParticles());
  }
}