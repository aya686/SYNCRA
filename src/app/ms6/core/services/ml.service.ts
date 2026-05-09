import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MLService {
  private apiUrl = 'http://localhost:8086/ms6/api/ml';

  constructor(private http: HttpClient) {}

  // ==================== STATS ====================
  getMLStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  // ==================== DELIVERY PREDICTION ====================
  predictDelivery(city: string, transporteur: string, dateExpedition?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/delivery/predict`, {
      city,
      transporteur,
      dateExpedition
    });
  }

  getDeliveryStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/delivery/stats`);
  }

  // ==================== RECOMMENDATIONS ====================
  getRecommendationsForUser(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/recommendations/user/${userId}`);
  }

  getSimilarProducts(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/recommendations/similar/${productId}`);
  }

  getCartRecommendations(productIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/recommendations/cart`, {
      productIds
    });
  }

  getRecommendationsByProductName(productName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/recommendations/by-product-name/${encodeURIComponent(productName)}`);
  }

  getPopularProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recommendations/popular`);
  }

  // ==================== DEMAND FORECAST ====================
  getDemandForecast(productId: number, days: number = 14): Observable<any> {
    return this.http.get(`${this.apiUrl}/demand/forecast/${productId}?days=${days}`);
  }

  getAllStockRisks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/demand/stock-risks`);
  }

  getOptimalStock(productId: number, leadTimeDays: number = 7, safetyStockPercent: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/demand/optimal-stock/${productId}?leadTimeDays=${leadTimeDays}&safetyStockPercent=${safetyStockPercent}`);
  }

  getTopPredictedProducts(limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/demand/top-predicted?limit=${limit}`);
  }

  // ==================== ADMIN ====================
  retrainModels(): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/retrain`, {});
  }
}
