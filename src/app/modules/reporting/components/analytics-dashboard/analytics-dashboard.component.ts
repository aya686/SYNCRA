import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit, AfterViewInit {
  stats = {
    totalInscrits: 0,
    totalEvents: 0,
    totalFormations: 0,
    tauxParticipation: 0
  };
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createCharts();
    }, 500);
  }

  loadStats(): void {
    this.http.get('http://localhost:8089/event_db/api/stats/global').subscribe({
      next: (data: any) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  createCharts(): void {
    this.createEvolutionChart();
    this.createTypeChart();
    this.createTrendChart();
  }

  createEvolutionChart(): void {
    this.http.get('http://localhost:8089/event_db/api/stats/evolution').subscribe({
      next: (data: any) => {
        const ctx = document.getElementById('evolutionChart') as HTMLCanvasElement;
        if (!ctx) return;

        new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.map((d: any) => d.month),
            datasets: [{
              label: 'Inscriptions',
              data: data.map((d: any) => d.inscriptions),
              borderColor: '#5E35B1',
              backgroundColor: 'rgba(94, 53, 177, 0.1)',
              tension: 0.4,
              fill: true
            }, {
              label: 'Participants',
              data: data.map((d: any) => d.participants),
              borderColor: '#1E88E5',
              backgroundColor: 'rgba(30, 136, 229, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } }
          }
        });
      },
      error: (err) => console.error('Erreur:', err)
    });
  }

  createTypeChart(): void {
    this.http.get('http://localhost:8089/event_db/api/stats/by-type').subscribe({
      next: (data: any) => {
        const ctx = document.getElementById('typeChart') as HTMLCanvasElement;
        if (!ctx) return;

        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(data),
            datasets: [{
              data: Object.values(data),
              backgroundColor: ['#5E35B1', '#1E88E5', '#FFBE00', '#10B981', '#F59E0B'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
          }
        });
      },
      error: (err) => console.error('Erreur:', err)
    });
  }

  createTrendChart(): void {
    this.http.get('http://localhost:8089/event_db/api/stats/by-weekday').subscribe({
      next: (data: any) => {
        const ctx = document.getElementById('trendChart') as HTMLCanvasElement;
        if (!ctx) return;

        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(data),
            datasets: [{
              label: 'Participants',
              data: Object.values(data),
              backgroundColor: '#5E35B1',
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } }
          }
        });
      },
      error: (err) => console.error('Erreur:', err)
    });
  }
}