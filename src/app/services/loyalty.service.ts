// src/app/services/loyalty.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

// ─── INTERFACES ──────────────────────────────────────────────

export interface LoyaltyTransaction {
  id: number;
  type: string;
  pointsDelta: number;
  balanceAfter: number;
  description: string;
  createdAt: Date;
}

export interface LoyaltyAccount {
  userId: number;
  userName: string;
  points: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  nextTier: string;
  pointsToNextTier: number;
  progressPercent: number;
  freeDeliveryAvailable: boolean;
  premiumAccessAvailable: boolean;
  discountPercent: number;
  history: LoyaltyTransaction[];
}

export interface TopItem {
  id: number;
  resourceType: 'MACHINE' | 'SERVICE';
  name: string;
  category?: string;
  imageUrl?: string;
  price: number;
  priceUnit?: string;
  rating: number;
  reviewCount: number;
  location?: string;
  supplierName?: string;
  availability: string;
  totalSold: number;
  totalRevenue: number;
  rank: number;
  rankLabel: string;
}

// ─── SERVICE ─────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private apiUrl = 'http://localhost:8083/api/loyalty';

  // BehaviorSubject exposé pour que la navbar/bell réagisse en temps réel
  private account$ = new BehaviorSubject<LoyaltyAccount | null>(null);
  account = this.account$.asObservable();

  constructor(private http: HttpClient) {}

  // ─── COMPTE ────────────────────────────────────────────────

  getAccount(userId: number): Observable<LoyaltyAccount> {
    return this.http.get<LoyaltyAccount>(`${this.apiUrl}/account/${userId}`).pipe(
      tap(acc => this.account$.next(acc))
    );
  }

  initAccount(userId: number, userName: string): Observable<LoyaltyAccount> {
    return this.http.post<LoyaltyAccount>(
      `${this.apiUrl}/account/${userId}/init`,
      { userName }
    ).pipe(tap(acc => this.account$.next(acc)));
  }

  // ─── UTILISATION DES POINTS ─────────────────────────────────

  redeemDiscount(userId: number, points: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/account/${userId}/redeem/discount`, { points });
  }

  redeemFreeDelivery(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/account/${userId}/redeem/delivery`, {});
  }

  redeemPremium(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/account/${userId}/redeem/premium`, {});
  }

  // ─── CLASSEMENTS ───────────────────────────────────────────

  getTopMachines(limit = 10, category?: string): Observable<TopItem[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (category) params = params.set('category', category);
    return this.http.get<TopItem[]>(`${this.apiUrl}/top/machines`, { params });
  }

  getTopServices(limit = 10, category?: string): Observable<TopItem[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (category) params = params.set('category', category);
    return this.http.get<TopItem[]>(`${this.apiUrl}/top/services`, { params });
  }

  // ─── HELPERS UI ────────────────────────────────────────────

  getTierColor(tier: string): string {
    switch(tier) {
      case 'PLATINUM': return '#e2e8f0';
      case 'GOLD':     return '#fbbf24';
      case 'SILVER':   return '#94a3b8';
      case 'BRONZE':   return '#d97706';
      default: return '#d97706';
    }
  }

  getTierGradient(tier: string): string {
    switch(tier) {
      case 'PLATINUM': return 'linear-gradient(135deg, #667eea, #764ba2)';
      case 'GOLD':     return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'SILVER':   return 'linear-gradient(135deg, #94a3b8, #64748b)';
      case 'BRONZE':   return 'linear-gradient(135deg, #d97706, #92400e)';
      default:         return 'linear-gradient(135deg, #d97706, #92400e)';
    }
  }

  getTierEmoji(tier: string): string {
    switch(tier) {
      case 'PLATINUM': return '💎';
      case 'GOLD':     return '🥇';
      case 'SILVER':   return '🥈';
      case 'BRONZE':   return '🥉';
      default: return '⭐';
    }
  }

  getTxIcon(type: string): string {
    switch(type) {
      case 'EARN_ORDER':       return 'bi-cart-check-fill';
      case 'EARN_FIRST_ORDER': return 'bi-gift-fill';
      case 'REDEEM_DISCOUNT':  return 'bi-percent';
      case 'REDEEM_DELIVERY':  return 'bi-truck';
      case 'REDEEM_PREMIUM':   return 'bi-star-fill';
      case 'EXPIRE':           return 'bi-clock-history';
      default:                 return 'bi-lightning-fill';
    }
  }

  getTxColor(delta: number): string {
    return delta > 0 ? '#10b981' : '#ef4444';
  }

  getRankMedal(rank: number): string {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  }

  formatRevenue(n: number): string {
    return new Intl.NumberFormat('fr-TN').format(Math.round(n));
  }
}