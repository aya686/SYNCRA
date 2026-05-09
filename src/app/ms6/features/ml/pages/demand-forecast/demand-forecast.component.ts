import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MLService } from '../../../../core/services/ml.service';

@Component({
  selector: 'app-demand-forecast',
  templateUrl: './demand-forecast.component.html',
  styleUrls: ['./demand-forecast.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DecimalPipe]
})
export class DemandForecastComponent {
  productId = 1;
  days = 14;
  
  forecast: any = null;
  stockRisks: any = null;
  loadingForecast = false;
  loadingRisks = false;
  error = '';

  stats: any = null;

  constructor(private mlService: MLService) {
    this.loadStats();
  }

  loadStats() {
    this.mlService.getMLStats().subscribe({
      next: (data) => {
        this.stats = data.demandForecasting;
      }
    });
  }

  getForecast() {
    this.loadingForecast = true;
    this.error = '';
    
    this.mlService.getDemandForecast(this.productId, this.days).subscribe({
      next: (data) => {
        console.log('Forecast data received:', data);
        
        // Nettoyer les données NaN
        if (data && data.forecasts) {
          data.forecasts = data.forecasts.map((f: any) => ({
            ...f,
            predictedValue: isNaN(f.predictedValue) ? 0 : f.predictedValue,
            lowerBound: isNaN(f.lowerBound) ? 0 : f.lowerBound,
            upperBound: isNaN(f.upperBound) ? 0 : f.upperBound,
            confidence: isNaN(f.confidence) ? 0.5 : f.confidence
          }));
        }
        
        this.forecast = data;
        this.loadingForecast = false;
      },
      error: (err) => {
        console.error('Forecast error:', err);
        this.error = 'Erreur lors de la génération des prévisions';
        this.loadingForecast = false;
      }
    });
  }

  getStockRisks() {
    this.loadingRisks = true;
    this.error = '';
    
    this.mlService.getAllStockRisks().subscribe({
      next: (data) => {
        this.stockRisks = data;
        this.loadingRisks = false;
      },
      error: () => {
        this.error = 'Erreur lors de l\'analyse des risques';
        this.loadingRisks = false;
      }
    });
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.9) return '#22c55e';
    if (confidence >= 0.7) return '#f59e0b';
    return '#ef4444';
  }
}
