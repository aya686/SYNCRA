import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Promotion, PromotionRequest } from '../models/promotion.model';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getActivePromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/promotions`);
  }

  getAllPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/promotions/all`);
  }

  createPromotion(request: PromotionRequest): Observable<Promotion> {
    return this.http.post<Promotion>(`${this.apiUrl}/promotions`, request);
  }

  updatePromotion(id: number, request: PromotionRequest): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.apiUrl}/promotions/${id}`, request);
  }

  deletePromotion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/promotions/${id}`);
  }

  applyPromotionToProduit(promotionId: number, produitId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/promotions/${promotionId}/apply/${produitId}`, {});
  }
}
