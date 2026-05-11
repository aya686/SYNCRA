import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Candidature } from '../../models/candidature.model';
import { CandidatureService } from '../../services/candidature.service';
import { OffreService } from '../../services/offre.service';
import { AiCvService } from '../../services/ai-cv.service';

@Component({
  selector: 'app-postuler',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './postuler.component.html',
  styleUrls: ['./postuler.component.scss']
})
export class PostulerComponent implements OnInit {
  offreId: number | null = null;
  offre: any = null;
  candidature: Candidature = {
    lettreMotivation: '',
    portfolioUrl: '',
    tarifPropose: 0,
    candidatId: 1, // TODO: Récupérer depuis auth
    statut: 'EN_ATTENTE' as any
  };
  loading = false;
  error = '';
  success = false;
  
  // CV upload
  cvFile: File | null = null;
  cvFileName: string = '';
  isDragging = false;

  // AI Analysis
  aiAnalysisLoading = false;
  cvResume: string = '';
  aiScore: number = 0;
  aiReport: string = '';
  cvContent: string = ''; // Content of the CV file

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private candidatureService: CandidatureService,
    private offreService: OffreService,
    public aiCvService: AiCvService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.offreId = Number(this.route.snapshot.paramMap.get('offreId'));
    if (this.offreId) {
      this.loadOffre();
    }
  }

  loadOffre(): void {
    this.offreService.getOffreById(this.offreId!).subscribe({
      next: (data) => {
        setTimeout(() => {
          this.offre = data;
          // Suggérer tarif basé sur le budget de l'offre
          if (data.budgetMin) {
            this.candidature.tarifPropose = data.budgetMin;
          }
        });
      },
      error: (err) => {
        console.error('Erreur chargement offre:', err);
        this.error = 'Erreur lors du chargement de l\'offre';
      }
    });
  }

  // CV file handling
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  handleFile(file: File): void {
    // Validate file type (PDF, DOC, DOCX, TXT)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      this.error = 'Seuls les fichiers PDF, DOC, DOCX et TXT sont acceptés';
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.error = 'La taille du fichier ne doit pas dépasser 5MB';
      return;
    }

    this.cvFile = file;
    this.cvFileName = file.name;
    this.candidature.cv = file.name;
    this.error = '';

    // For text files, read content; for binary files, use filename only
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.cvContent = e.target.result;
        this.analyzeCV();
      };
      reader.onerror = () => {
        console.error('Erreur lecture fichier CV');
        this.error = 'Erreur lors de la lecture du fichier CV';
      };
      reader.readAsText(file);
    } else {
      // For binary files (PDF, DOC, DOCX), use filename only
      this.cvContent = file.name;
      this.analyzeCV();
    }
  }

  analyzeCV(): void {
    if (!this.offre || !this.cvContent) return;

    this.aiAnalysisLoading = true;
    this.aiCvService.analyzeCV(
      this.cvContent,
      this.offre.titre,
      this.offre.description,
      this.offre.budgetMin
    ).subscribe({
      next: (result) => {
        setTimeout(() => {
          this.cvResume = result.cvResume;
          this.aiScore = result.score;
          this.aiReport = result.report;
          
          // Store in candidature
          this.candidature.cvResume = result.cvResume;
          this.candidature.aiReport = result.report;
          this.candidature.scoreIa = result.score;
          
          this.aiAnalysisLoading = false;
        });
      },
      error: (err) => {
        console.error('Erreur analyse IA:', err);
        this.aiAnalysisLoading = false;
        this.error = 'Erreur lors de l\'analyse IA du CV';
      }
    });
  }

  removeCV(): void {
    this.cvFile = null;
    this.cvFileName = '';
    this.candidature.cv = undefined;
    
    // Clear AI analysis results
    this.cvResume = '';
    this.aiScore = 0;
    this.aiReport = '';
    this.candidature.cvResume = undefined;
    this.candidature.aiReport = undefined;
    this.candidature.scoreIa = undefined;
  }

  onSubmit(): void {
    if (!this.offreId) return;

    this.loading = true;
    this.error = '';

    // Include only basic IA fields (backend has many optional IA fields)
    const candidatureToSubmit = {
      lettreMotivation: this.candidature.lettreMotivation,
      portfolioUrl: this.candidature.portfolioUrl,
      tarifPropose: this.candidature.tarifPropose,
      candidatId: this.candidature.candidatId,
      statut: this.candidature.statut,
      cv: this.candidature.cv,
      cvResume: this.candidature.cvResume,
      aiReport: this.candidature.aiReport,
      scoreIa: this.candidature.scoreIa,
      // Other AI fields are null/undefined
      niveauCompatibilite: null,
      resumeIa: null,
      pointsFortsIa: null,
      pointsFaiblesIa: null,
      motsClesDetectes: null,
      recommandationIa: null,
      tonLettre: null,
      analyseLettre: null,
      scoreLettre: null,
      scorePortfolio: null,
      scoreTarif: null,
      fraudeDetectee: null,
      detailFraude: null,
      dateAnalyseIa: null
    };

    console.log('Données envoyées au backend:', candidatureToSubmit);

    this.candidatureService.soumettreCandidature(this.offreId, candidatureToSubmit).subscribe({
      next: (response) => {
        this.loading = false;
        // Rediriger immédiatement vers mes candidatures
        this.router.navigate(['/candidatures/mes-candidatures']);
      },
      error: (err) => {
        console.error('Erreur soumission candidature:', err);
        // Display backend error message if available
        if (err.status === 500 && err.error) {
          this.error = err.error.message || err.error || 'Erreur lors de la soumission de votre candidature';
        } else {
          this.error = err.error?.message || 'Erreur lors de la soumission de votre candidature';
        }
        this.loading = false;
      }
    });
  }

  annuler(): void {
    this.router.navigate(['/offres/detail', this.offreId]);
  }
}
