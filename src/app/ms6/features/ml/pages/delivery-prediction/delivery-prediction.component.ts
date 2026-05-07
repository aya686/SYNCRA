import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MLService } from '../../../../core/services/ml.service';

@Component({
  selector: 'app-delivery-prediction',
  templateUrl: './delivery-prediction.component.html',
  styleUrls: ['./delivery-prediction.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DeliveryPredictionComponent {
  deliveryForm = {
    city: 'Tunis',
    transporteur: 'Aramex',
    dateExpedition: ''
  };
  
  deliveryResult: any = null;
  loading = false;
  error = '';

  stats: any = null;
  loadingStats = false;

  transporteurs = ['Aramex', 'DHL', 'FedEx'];

  constructor(private mlService: MLService) {
    this.loadStats();
  }

  loadStats() {
    this.loadingStats = true;
    this.mlService.getMLStats().subscribe({
      next: (data) => {
        this.stats = data.deliveryPrediction;
        this.loadingStats = false;
      },
      error: () => {
        this.loadingStats = false;
      }
    });
  }

  predict() {
    this.loading = true;
    this.error = '';
    
    this.mlService.predictDelivery(
      this.deliveryForm.city,
      this.deliveryForm.transporteur,
      this.deliveryForm.dateExpedition || undefined
    ).subscribe({
      next: (data) => {
        this.deliveryResult = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la prédiction';
        this.loading = false;
      }
    });
  }

  testWinter() {
    this.deliveryForm.dateExpedition = '2026-01-15T10:00';
    this.predict();
  }

  testSummer() {
    this.deliveryForm.dateExpedition = '2026-07-20T10:00';
    this.predict();
  }

  getRiskClass(level: string): string {
    switch (level?.toUpperCase()) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'danger';
      default: return 'info';
    }
  }
}
