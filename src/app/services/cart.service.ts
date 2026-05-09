// src/app/services/cart.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartItem {
  id: number;
  itemType: 'MACHINE' | 'SERVICE';
  itemId: number;
  itemName: string;
  itemImageUrl: string;
  unitPrice: number;
  priceUnit: string;
  quantity: number;
  totalPrice: number;
  supplierProviderId: number;
  supplierProviderName: string;
  addedAt: Date;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  deliveryAddress: string;
  deliveryCity: string;
  deliveryZipCode: string;
  deliveryPhone: string;
  deliveryCost: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryInfo {
  address: string;
  city: string;
  zipCode: string;
  phone: string;
}

export interface AddToCartRequest {
  itemType: string;  // "MACHINE" ou "SERVICE"
  itemId: number;
  quantity: number;
}

/** ✅ NOUVEAU : Résultat de la validation d'un code promo */
export interface PromoValidation {
  valid: boolean;
  code?: string;
  type?: 'FREE_DELIVERY' | 'DISCOUNT' | 'PREMIUM';
  discountPercent?: number;
  expiresAt?: string;
  message: string;
}

/** ✅ NOUVEAU : Résultat du checkout (JSON retourné par le backend) */
export interface CheckoutResult {
  success: boolean;
  message: string;
  orderNumber?: string;
  pointsEarned?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8083/api/cart';

  constructor(private http: HttpClient) {}

  // Récupérer le panier d'un utilisateur
  getCart(userId: number): Observable<Cart> {
    console.log(`GET ${this.apiUrl}/${userId}`);
    return this.http.get<Cart>(`${this.apiUrl}/${userId}`);
  }

  // Ajouter un article au panier
  addToCart(userId: number, item: AddToCartRequest): Observable<Cart> {
    console.log(`POST ${this.apiUrl}/${userId}/add`, item);
    return this.http.post<Cart>(`${this.apiUrl}/${userId}/add`, item);
  }

  // Supprimer un article du panier
  removeFromCart(userId: number, cartItemId: number): Observable<Cart> {
    console.log(`DELETE ${this.apiUrl}/${userId}/remove/${cartItemId}`);
    return this.http.delete<Cart>(`${this.apiUrl}/${userId}/remove/${cartItemId}`);
  }

  // Modifier la quantité
  updateQuantity(userId: number, cartItemId: number, quantity: number): Observable<Cart> {
    console.log(`PUT ${this.apiUrl}/${userId}/update/${cartItemId}`, { quantity });
    return this.http.put<Cart>(`${this.apiUrl}/${userId}/update/${cartItemId}`, { quantity });
  }

  // Vider le panier
  clearCart(userId: number): Observable<void> {
    console.log(`DELETE ${this.apiUrl}/${userId}/clear`);
    return this.http.delete<void>(`${this.apiUrl}/${userId}/clear`);
  }

  // Mettre à jour les informations de livraison
  updateDeliveryInfo(userId: number, deliveryInfo: DeliveryInfo): Observable<Cart> {
    console.log(`PUT ${this.apiUrl}/${userId}/delivery`, deliveryInfo);
    return this.http.put<Cart>(`${this.apiUrl}/${userId}/delivery`, deliveryInfo);
  }

  // Calculer les frais de livraison
  calculateDeliveryCost(userId: number): Observable<number> {
    console.log(`POST ${this.apiUrl}/${userId}/delivery-cost`);
    return this.http.post<number>(`${this.apiUrl}/${userId}/delivery-cost`, {});
  }

  /**
   * ✅ NOUVEAU : Valide un code promo (sans checkout)
   * Appelé par le bouton "Vérifier" dans le panier.
   */
  applyPromoCode(userId: number, code: string): Observable<PromoValidation> {
    console.log(`POST ${this.apiUrl}/${userId}/apply-promo`, { code });
    return this.http.post<PromoValidation>(
      `${this.apiUrl}/${userId}/apply-promo`,
      { code: code.toUpperCase().trim() }
    );
  }

  /**
   * ✅ BUG CORRIGÉ + AMÉLIORÉ :
   * - Retourne maintenant Observable<CheckoutResult> (JSON valide)
   * - Accepte un code promo optionnel
   * - Le backend retourne { success, message, orderNumber, pointsEarned }
   *   → HttpClient parse correctement → plus d'erreur "[object Object]"
   */
  checkout(userId: number, promoCode?: string): Observable<CheckoutResult> {
    const body: any = {};
    if (promoCode && promoCode.trim()) {
      body.promoCode = promoCode.trim().toUpperCase();
    }
    console.log(`POST ${this.apiUrl}/${userId}/checkout`, body);
    return this.http.post<CheckoutResult>(`${this.apiUrl}/${userId}/checkout`, body);
  }
}