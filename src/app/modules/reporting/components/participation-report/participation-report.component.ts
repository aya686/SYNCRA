import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
    selector: 'app-participation-report',
    templateUrl: './participation-report.component.html',
    styleUrls: ['./participation-report.component.css'],
    standalone: false
})
export class ParticipationReportComponent implements OnInit {
  stats: any = {
    totalInscrits: 0,
    confirmedInscrits: 0,
    pendingInscrits: 0,
    tauxConfirmation: 0,
    repartitionStatut: {},
    evolution: [],
    parType: {}
  };
  selectedPeriod: string = 'mois';
  loading = false;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadEvolution();
    this.loadStatsByType();
  }

  loadStats(): void {
    this.loading = true;
    this.http.get('http://localhost:8089/event_db/api/stats/participation').subscribe({
      next: (data: any) => {
        console.log('Stats reçues:', data);
        this.stats = { ...this.stats, ...data };
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.notificationService.error('Impossible de charger les statistiques');
        this.loading = false;
      }
    });
  }

  loadEvolution(): void {
    this.http.get(`http://localhost:8089/event_db/api/stats/evolution?period=${this.selectedPeriod}`).subscribe({
      next: (data: any) => {
        console.log('Évolution reçue:', data);
        this.stats.evolutionHebdomadaire = data.evolution;
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  loadStatsByType(): void {
    this.http.get('http://localhost:8089/event_db/api/stats/by-type').subscribe({
      next: (data: any) => {
        console.log('Stats par type:', data);
        this.stats.parType = data;
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    this.loadEvolution();
  }

  getParTypeEntries(): {key: string, value: number}[] {
    if (!this.stats.parType) return [];
    return Object.entries(this.stats.parType).map(([key, value]) => ({
      key: key,
      value: value as number
    }));
  }

  getProgressColor(rate: number): string {
    if (rate >= 75) return '#27ae60';
    if (rate >= 50) return '#f39c12';
    return '#e74c3c';
  }
}