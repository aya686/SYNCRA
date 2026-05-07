import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MLService } from '../../core/services/ml.service';

@Component({
  selector: 'app-ml-dashboard',
  templateUrl: './ml-dashboard.component.html',
  styleUrls: ['./ml-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MlDashboardComponent implements OnInit {
  // Stats
  mlStats: any = null;
  loadingStats = false;

  // Delivery Prediction
  deliveryForm = {
    city: 'Tunis',
    transporteur: 'Aramex',
    dateExpedition: ''
  };
  deliveryResult: any = null;
  loadingDelivery = false;

  // Recommendations
  userId = 1;
  recommendationsResult: any = null;
  loadingRecommendations = false;

  similarProductId = 1;
  similarProductsResult: any = null;
  loadingSimilarProducts = false;

  // Demand Forecast
  forecastProductId = 1;
  forecastDays = 14;
  forecastResult: any = null;
  loadingForecast = false;

  stockRisksResult: any = null;
  loadingStockRisks = false;

  // Admin
  retrainResult: any = null;
  loadingRetrain = false;

  // Alerts
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' = 'info';

  constructor(private mlService: MLService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  // ==================== STATS ====================
  loadStats() {
    this.loadingStats = true;
    this.mlService.getMLStats().subscribe({
      next: (data) => {
        this.mlStats = data;
        this.loadingStats = false;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.showAlert('Erreur lors du chargement des statistiques', 'error');
        this.loadingStats = false;
      }
    });
  }

  // ==================== DELIVERY PREDICTION ====================
  predictDelivery() {
    this.loadingDelivery = true;
    const date = this.deliveryForm.dateExpedition || undefined;
    this.mlService.predictDelivery(
      this.deliveryForm.city,
      this.deliveryForm.transporteur,
      date
    ).subscribe({
      next: (data) => {
        this.deliveryResult = data;
        this.loadingDelivery = false;
        this.showAlert('Prédiction de livraison effectuée avec succès!', 'success');
      },
      error: (err) => {
        console.error('Error predicting delivery:', err);
        this.showAlert('Erreur lors de la prédiction', 'error');
        this.loadingDelivery = false;
      }
    });
  }

  predictWinterDelivery() {
    this.deliveryForm.dateExpedition = '2026-01-15T10:00:00';
    this.predictDelivery();
  }

  predictSummerDelivery() {
    this.deliveryForm.dateExpedition = '2026-07-20T10:00:00';
    this.predictDelivery();
  }

  // ==================== RECOMMENDATIONS ====================
  getRecommendations() {
    this.loadingRecommendations = true;
    this.mlService.getRecommendationsForUser(this.userId).subscribe({
      next: (data) => {
        this.recommendationsResult = data;
        this.loadingRecommendations = false;
        this.showAlert(`${data.count} recommandations trouvées!`, 'success');
      },
      error: (err) => {
        console.error('Error getting recommendations:', err);
        this.showAlert('Erreur lors de la récupération des recommandations', 'error');
        this.loadingRecommendations = false;
      }
    });
  }

  getSimilarProducts() {
    this.loadingSimilarProducts = true;
    this.mlService.getSimilarProducts(this.similarProductId).subscribe({
      next: (data) => {
        this.similarProductsResult = data;
        this.loadingSimilarProducts = false;
        this.showAlert(`${data.similarProducts?.length || 0} produits similaires trouvés!`, 'success');
      },
      error: (err) => {
        console.error('Error getting similar products:', err);
        this.showAlert('Erreur lors de la récupération des produits similaires', 'error');
        this.loadingSimilarProducts = false;
      }
    });
  }

  // ==================== DEMAND FORECAST ====================
  getDemandForecast() {
    this.loadingForecast = true;
    this.mlService.getDemandForecast(this.forecastProductId, this.forecastDays).subscribe({
      next: (data) => {
        this.forecastResult = data;
        this.loadingForecast = false;
        this.showAlert(`Prévisions générées pour ${data.productName || 'Produit ' + this.forecastProductId}`, 'success');
      },
      error: (err) => {
        console.error('Error getting forecast:', err);
        this.showAlert('Erreur lors de la récupération des prévisions', 'error');
        this.loadingForecast = false;
      }
    });
  }

  getStockRisks() {
    this.loadingStockRisks = true;
    this.mlService.getAllStockRisks().subscribe({
      next: (data) => {
        this.stockRisksResult = data;
        this.loadingStockRisks = false;
        this.showAlert(`${data.risks?.length || 0} risques de stock analysés`, 'success');
      },
      error: (err) => {
        console.error('Error getting stock risks:', err);
        this.showAlert('Erreur lors de l\'analyse des risques', 'error');
        this.loadingStockRisks = false;
      }
    });
  }

  // ==================== ADMIN ====================
  retrainModels() {
    this.loadingRetrain = true;
    this.mlService.retrainModels().subscribe({
      next: (data) => {
        this.retrainResult = data;
        this.loadingRetrain = false;
        this.showAlert('Entraînement des modèles lancé avec succès!', 'success');
        // Reload stats after a delay
        setTimeout(() => this.loadStats(), 2000);
      },
      error: (err) => {
        console.error('Error retraining models:', err);
        this.showAlert('Erreur lors de l\'entraînement', 'error');
        this.loadingRetrain = false;
      }
    });
  }

  // ==================== UTILS ====================
  showAlert(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }

  getRiskLevelClass(level: string): string {
    switch (level?.toUpperCase()) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'danger';
      case 'CRITICAL': return 'danger';
      default: return 'info';
    }
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.9) return '#52c41a';
    if (confidence >= 0.7) return '#faad14';
    return '#f5222d';
  }
}
