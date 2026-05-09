import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';

@Component({
    selector: 'app-heatmap',
    templateUrl: './heatmap.component.html',
    styleUrls: ['./heatmap.component.css'],
    standalone: false
})
export class HeatmapComponent implements OnInit, AfterViewInit {
  loading = true;
  selectedPeriod: string = 'week';
  heatmapData: any = {};
  hours = ['8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h'];
  days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  peakHour = '';
  peakDay = '';
  lowHour = '';
  lowDay = '';
  peakValue = 0;
  
  private chart: any;
  @ViewChild('heatmapCanvas') heatmapCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadHeatmapData();
  }

  ngAfterViewInit(): void {
    // Attendre que le DOM soit prêt
  }

  loadHeatmapData(): void {
    this.loading = true;
    this.http.get('http://localhost:8089/event_db/api/stats/heatmap').subscribe({
  next: (data: any) => {
  this.processHeatmapData(data);
  this.loading = false;
  this.cdr.detectChanges();
  setTimeout(() => this.createHeatmap(), 100);
},
error: (err) => {
  console.error('Erreur:', err);
  this.generateMockData();
  this.loading = false;
  this.cdr.detectChanges();
  setTimeout(() => this.createHeatmap(), 100);
}
    });
  }

  generateMockData(): void {
    const matrix: { [key: string]: { [key: string]: number } } = {};
    this.days.forEach(day => { 
      matrix[day] = {}; 
      this.hours.forEach(hour => { 
        matrix[day][hour] = Math.floor(Math.random() * 100);
      });
    });
    this.heatmapData = matrix;
  }

  processHeatmapData(data: any[]): void {
    const matrix: { [key: string]: { [key: string]: number } } = {};
    
    // Initialiser la matrice
    this.days.forEach(day => { 
      matrix[day] = {}; 
      this.hours.forEach(hour => { 
        matrix[day][hour] = 0; 
      });
    });
    
    let maxValue = 0;
    let maxDay = '';
    let maxHour = '';
    let minValue = Infinity;
    let minDay = '';
    let minHour = '';
    
    if (data && data.length > 0) {
      data.forEach(item => {
        const dayIndex = item.day;
        const hour = `${item.hour}h`;
        const value = item.count;
        
        if (dayIndex >= 1 && dayIndex <= 7) {
          const day = this.days[dayIndex - 1];
          if (matrix[day] && matrix[day][hour] !== undefined) {
            matrix[day][hour] = value;
            
            if (value > maxValue) {
              maxValue = value;
              maxDay = day;
              maxHour = hour;
            }
            if (value < minValue && value > 0) {
              minValue = value;
              minDay = day;
              minHour = hour;
            }
          }
        }
      });
    }
    
    this.heatmapData = matrix;
    this.peakHour = maxHour;
    this.peakDay = maxDay;
    this.peakValue = maxValue;
    this.lowHour = minHour;
    this.lowDay = minDay;
    
    console.log('Matrice heatmap:', this.heatmapData);
  }

  getColor(value: number): string {
  if (value >= 20) return '#e74c3c';      // 20+ participants - Rouge
  if (value >= 15) return '#f39c12';      // 15-20 participants - Orange
  if (value >= 10) return '#f1c40f';      // 10-15 participants - Jaune
  if (value >= 5) return '#2ecc71';       // 5-10 participants - Vert
  return '#3498db';                        // 0-5 participants - Bleu
}

  getValue(day: string, hour: string): number {
    return this.heatmapData[day]?.[hour] || 0;
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadHeatmapData();
  }

  createHeatmap(): void {
  const canvas = this.heatmapCanvas?.nativeElement;
if (!canvas) {
  console.error('Canvas non trouvé');
  return;
}
    
    // Détruire le graphique existant
    if (this.chart) {
      this.chart.destroy();
    }
    
    // Préparer les données pour Chart.js
    const datasets = this.days.map((day, dayIndex) => ({
      label: day,
      data: this.hours.map(hour => this.getValue(day, hour)),
      backgroundColor: (context: any) => {
        const value = context.raw;
        return this.getColor(value);
      },
      borderRadius: 4,
      barPercentage: 0.9,
      categoryPercentage: 0.9
    }));
    
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.hours,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label} : ${context.raw} participants`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Heures', color: '#666' },
            grid: { display: false }
          },
          y: {
            title: { display: true, text: 'Nombre de participants', color: '#666' },
            beginAtZero: true,
            grid: { color: '#eee' }
          }
        }
      }
    });
    
    console.log('Heatmap créé avec succès');
  }
}