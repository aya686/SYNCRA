// src/app/services/order.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  id: number;
  machineId: number;
  machineName: string;
  machineImageUrl?: string;
  unitPrice: number;
  priceUnit: string;
  quantity: number;
  totalPrice: number;
  supplierId: number;
  supplierName: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  items: OrderItem[];
  deliveryAddress: string;
  deliveryCity: string;
  deliveryZipCode: string;
  deliveryPhone: string;
  deliveryType?: string;
  deliveryCost: number;
  subtotal: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  deliveredAt?: Date;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:8083/api/orders';

  constructor(private http: HttpClient) {}

  // ─── ADMIN ───────────────────────────────────────────────────
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getByStatus(status: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
  }

  updateStatus(id: number, status: string, adminNote?: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status, adminNote });
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ─── UTILISATEUR ─────────────────────────────────────────────
  getMyOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  // ─── HELPERS ─────────────────────────────────────────────────
  getStatusLabel(status: string): string {
    switch(status) {
      case 'PENDING':     return 'En attente';
      case 'CONFIRMED':   return 'Confirmée';
      case 'IN_DELIVERY': return 'En livraison';
      case 'DELIVERED':   return 'Livrée';
      case 'CANCELLED':   return 'Annulée';
      case 'REFUNDED':    return 'Remboursée';
      default: return status;
    }
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'PENDING':     return 'warning';
      case 'CONFIRMED':   return 'info';
      case 'IN_DELIVERY': return 'primary';
      case 'DELIVERED':   return 'success';
      case 'CANCELLED':   return 'danger';
      case 'REFUNDED':    return 'secondary';
      default: return 'secondary';
    }
  }
}