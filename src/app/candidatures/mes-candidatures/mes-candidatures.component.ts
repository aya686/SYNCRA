import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Candidature, StatutCandidature } from '../../models/candidature.model';
import { CandidatureService } from '../../services/candidature.service';
import { Chart, ChartConfiguration, ChartType, ChartData } from 'chart.js/auto';

@Component({
  selector: 'app-mes-candidatures',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mes-candidatures.component.html',
  styleUrls: ['./mes-candidatures.component.scss']
})
export class MesCandidaturesComponent implements OnInit, AfterViewInit {
  candidatures: Candidature[] = [];
  loading = false;
  error = '';
  filterStatut: StatutCandidature | null = null;
  candidatId = 1; // TODO: Récupérer depuis auth
  
  showCharts = false;
  chartType: 'histogram' | 'pie' = 'histogram';
  histogramChart: Chart | null = null;
  pieChart: Chart | null = null;
  
  stats = {
    enAttente: 0,
    enRevision: 0,
    shortlist: 0,
    acceptee: 0,
    refusee: 0
  };

  @ViewChild('histogramCanvas') histogramCanvas!: ElementRef;
  @ViewChild('pieCanvas') pieCanvas!: ElementRef;

  constructor(private candidatureService: CandidatureService) {}

  ngOnInit(): void {
    this.loadMesCandidatures();
  }

  ngAfterViewInit(): void {
    if (this.showCharts) {
      this.renderCharts();
    }
  }

  loadMesCandidatures(): void {
    this.loading = true;
    this.candidatureService.getMesCandidatures(this.candidatId).subscribe({
      next: (data) => {
        this.candidatures = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement candidatures:', err);
        this.error = 'Erreur lors du chargement de vos candidatures';
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.enAttente = this.candidatures.filter(c => c.statut === StatutCandidature.EN_ATTENTE).length;
    this.stats.enRevision = this.candidatures.filter(c => c.statut === StatutCandidature.EN_REVISION).length;
    this.stats.shortlist = this.candidatures.filter(c => c.statut === StatutCandidature.SHORTLIST).length;
    this.stats.acceptee = this.candidatures.filter(c => c.statut === StatutCandidature.ACCEPTEE).length;
    this.stats.refusee = this.candidatures.filter(c => c.statut === StatutCandidature.REFUSEE).length;
  }

  toggleCharts(): void {
    this.showCharts = !this.showCharts;
    if (this.showCharts) {
      setTimeout(() => this.renderCharts(), 0);
    } else {
      this.destroyCharts();
    }
  }

  setChartType(type: 'histogram' | 'pie'): void {
    this.chartType = type;
    if (this.showCharts) {
      this.renderCharts();
    }
  }

  renderCharts(): void {
    this.destroyCharts();
    
    const data = [this.stats.enAttente, this.stats.enRevision, this.stats.shortlist, this.stats.acceptee, this.stats.refusee];
    const labels = ['En attente', 'En révision', 'Shortlist', 'Acceptée', 'Refusée'];
    const backgroundColors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

    if (this.chartType === 'histogram' && this.histogramCanvas) {
      const ctx = this.histogramCanvas.nativeElement.getContext('2d');
      this.histogramChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Nombre de candidatures',
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'État des candidatures'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    } else if (this.chartType === 'pie' && this.pieCanvas) {
      const ctx = this.pieCanvas.nativeElement.getContext('2d');
      this.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            },
            title: {
              display: true,
              text: 'État des candidatures'
            }
          }
        }
      });
    }
  }

  destroyCharts(): void {
    if (this.histogramChart) {
      this.histogramChart.destroy();
      this.histogramChart = null;
    }
    if (this.pieChart) {
      this.pieChart.destroy();
      this.pieChart = null;
    }
  }

  applyFilter(): void {
    if (this.filterStatut) {
      this.candidatures = this.candidatures.filter(c => c.statut === this.filterStatut);
    } else {
      this.loadMesCandidatures();
    }
  }

  resetFilter(): void {
    this.filterStatut = null;
    this.loadMesCandidatures();
  }

  voirDetail(candidatureId: number | undefined): void {
    if (candidatureId) {
      // Navigation vers le détail
      console.log('Voir détail candidature:', candidatureId);
    }
  }

  getStatutLabel(statut: StatutCandidature): string {
    return this.candidatureService.getStatutLabel(statut);
  }

  getStatutBadgeClass(statut: StatutCandidature): string {
    return this.candidatureService.getStatutBadgeClass(statut);
  }
}
