import { Component, OnInit } from '@angular/core';
import { ReportingService } from '../../services/reporting.service';

interface EvaluationStats {
  noteMoyenne: number;
  totalEvaluations: number;
  satisfactionGlobale: number;
  recommandation: number;
  repartitionNotes: Record<string, number>;
  competencesLesPlusAcquises: {
    competence: string;
    pourcentage: number;
  }[];
}

@Component({
  selector: 'app-evaluation-report',
  templateUrl: './evaluation-report.component.html',
  styleUrls: ['./evaluation-report.component.css']
})
export class EvaluationReportComponent implements OnInit {

  stats!: EvaluationStats;

  repartitionList: { key: string; value: number }[] = [];

  constructor(private reportingService: ReportingService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.reportingService.getEvaluationStats().subscribe(stats => {
      this.stats = stats;

      this.repartitionList = Object.entries(this.stats.repartitionNotes).map(
        ([key, value]) => ({ key, value })
      );
    });
  }

  getPercentage(value: number): number {
    return (value / (this.stats?.totalEvaluations || 1)) * 100;
  }

  getNoteColor(range: string): string {
    const max = parseInt(range.split('-')[1]);

    if (max >= 16) return '#27ae60';
    if (max >= 12) return '#f39c12';
    return '#e74c3c';
  }

  getSkillColor(percent: number): string {
    if (percent >= 80) return '#27ae60';
    if (percent >= 50) return '#f39c12';
    return '#e74c3c';
  }

  getStars(note: number): string {
    const fullStars = Math.floor(note / 4);
    const hasHalfStar = note % 4 >= 2;

    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '½';
    stars += '☆'.repeat(5 - Math.ceil(note / 4));

    return stars;
  }
}