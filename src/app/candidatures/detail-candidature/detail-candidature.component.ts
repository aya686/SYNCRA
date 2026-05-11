import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Candidature, StatutCandidature } from '../../models/candidature.model';
import { CandidatureService } from '../../services/candidature.service';
import { EvaluationService } from '../../services/evaluation.service';

@Component({
  selector: 'app-detail-candidature',
  imports: [CommonModule, RouterModule],
  templateUrl: './detail-candidature.component.html',
  styleUrls: ['./detail-candidature.component.scss']
})
export class DetailCandidatureComponent implements OnInit {
  candidatureId: number | null = null;
  candidature: Candidature | null = null;
  evaluation: any = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private candidatureService: CandidatureService,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit(): void {
    this.candidatureId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.candidatureId) {
      this.loadCandidature();
      this.loadEvaluation();
    }
  }

  loadCandidature(): void {
    this.loading = true;
    this.candidatureService.getCandidatureById(this.candidatureId!).subscribe({
      next: (data) => {
        this.candidature = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement candidature:', err);
        this.error = 'Erreur lors du chargement de la candidature';
        this.loading = false;
      }
    });
  }

  loadEvaluation(): void {
    if (!this.candidatureId) return;
    
    this.evaluationService.getEvaluationByCandidature(this.candidatureId).subscribe({
      next: (data) => {
        this.evaluation = data;
      },
      error: () => {
        // Pas d'évaluation, ce n'est pas une erreur
        this.evaluation = null;
      }
    });
  }

  retour(): void {
    this.router.navigate(['/candidatures/mes-candidatures']);
  }

  getStatutLabel(statut: StatutCandidature): string {
    return this.candidatureService.getStatutLabel(statut);
  }

  getStatutBadgeClass(statut: StatutCandidature): string {
    return this.candidatureService.getStatutBadgeClass(statut);
  }
}
