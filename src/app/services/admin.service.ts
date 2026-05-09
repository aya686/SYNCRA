// src/app/services/admin.service.ts
// ✅ BUG 3 CORRIGÉ : ajout de getAllOrders(), updateOrderStatus(), deleteOrder()
//    qui étaient absents → le dashboard admin ne chargeait aucune commande

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order } from './order.service';

export interface Machine {
  id: number;
  name: string;
  description: string;
  category: string;
  type: string;
  availability: string;
  transactionType: string;
  price: number;
  priceUnit: string;
  location: string;
  contactInfo: string;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  imageUrls: string[];
  supplierId: number;
  supplierName: string;
  supplierCompanyName?: string;
  isInApp: boolean;
validationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_REJECTED';
  rejectionReason?: string;
  rejectedAt?: Date;
  approvedAt?: Date;
  validatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceEntity {
  id: number;
  name: string;
  description: string;
  category: string;
  serviceType: string;
  basePrice: number;
  priceUnit: string;
  location: string;
  contactInfo: string;
  availability: string;
  rating: number;
  reviewCount: number;
  imageUrls: string[];
  providerId: number;
  providerName: string;
  providerCompanyName?: string;
  isInApp: boolean;
  validationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_REJECTED';
  rejectionReason?: string;
  rejectedAt?: Date;
  approvedAt?: Date;
  validatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  requesterId: number;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  targetProviderId: number;
  isExternalProvider: boolean;
  externalProviderName?: string;
  externalProviderPhone?: string;
  externalProviderCompany?: string;
  requestType: string;
  machineServiceId?: number;
  machineServiceName?: string;
  quantity?: number;
  material?: string;
  deadline?: string;
  status: string;
  responseMessage?: string;
  proposedPrice?: number;
  estimatedDelivery?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
}

export interface DashboardStats {
  totalMachines: number;
  pendingMachines: number;
  approvedMachines: number;
  rejectedMachines: number;
  totalServices: number;
  pendingServices: number;
  approvedServices: number;
  rejectedServices: number;
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  // ✅ Ajout des stats commandes
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:8083/api';

  constructor(private http: HttpClient) {}

  // ========== DASHBOARD ==========
  getDashboardStats(): Observable<DashboardStats> {
    return new Observable(observer => {
      Promise.all([
        this.getAllMachines().toPromise(),
        this.getAllServices().toPromise(),
        this.getAllRequests().toPromise(),
        this.getAllOrders().toPromise()      // ✅ Ajout des commandes dans les stats
      ]).then(([machines, services, requests, orders]) => {
        const m = machines || [];
        const s = services || [];
        const r = requests || [];
        const o = orders   || [];
        observer.next({
          totalMachines:    m.length,
          pendingMachines:  m.filter(x => x.validationStatus === 'PENDING').length,
          approvedMachines: m.filter(x => x.validationStatus === 'APPROVED').length,
          rejectedMachines: m.filter(x => x.validationStatus === 'REJECTED').length,
          totalServices:    s.length,
          pendingServices:  s.filter(x => x.validationStatus === 'PENDING').length,
          approvedServices: s.filter(x => x.validationStatus === 'APPROVED').length,
          rejectedServices: s.filter(x => x.validationStatus === 'REJECTED').length,
          totalRequests:    r.length,
          pendingRequests:  r.filter(x => x.status === 'PENDING').length,
          acceptedRequests: r.filter(x => x.status === 'ACCEPTED').length,
          totalOrders:      o.length,
          pendingOrders:    o.filter(x => x.status === 'PENDING').length,
          confirmedOrders:  o.filter(x => x.status === 'CONFIRMED').length,
          deliveredOrders:  o.filter(x => x.status === 'DELIVERED').length
        });
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }

  // ========== MACHINES ==========
  getAllMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(`${this.apiUrl}/machines`).pipe(
      map(machines => machines.map(m => ({
        ...m,
        validationStatus: (m.validationStatus as 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_REJECTED') || 'PENDING'
      })))
    );
  }

  approveMachine(id: number): Observable<Machine> {
    return this.http.patch<Machine>(`${this.apiUrl}/machines/${id}/approve`, {});
  }

  rejectMachine(id: number, reason: string): Observable<Machine> {
    return this.http.patch<Machine>(`${this.apiUrl}/machines/${id}/reject`, { reason });
  }

  deleteMachine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/machines/${id}`);
  }

  // ========== SERVICES ==========
  getAllServices(): Observable<ServiceEntity[]> {
    return this.http.get<ServiceEntity[]>(`${this.apiUrl}/services`).pipe(
      map(services => services.map(s => ({
        ...s,
        validationStatus: (s.validationStatus as 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_REJECTED') || 'PENDING'
      })))
    );
  }

  approveService(id: number): Observable<ServiceEntity> {
    return this.http.patch<ServiceEntity>(`${this.apiUrl}/services/${id}/approve`, {});
  }

  rejectService(id: number, reason: string): Observable<ServiceEntity> {
    return this.http.patch<ServiceEntity>(`${this.apiUrl}/services/${id}/reject`, { reason });
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/services/${id}`);
  }

  createService(service: Partial<ServiceEntity>): Observable<ServiceEntity> {
    return this.http.post<ServiceEntity>(`${this.apiUrl}/services`, {
      ...service,
      validationStatus: 'APPROVED'
    });
  }

  updateService(id: number, service: Partial<ServiceEntity>): Observable<ServiceEntity> {
    return this.http.put<ServiceEntity>(`${this.apiUrl}/services/${id}`, service);
  }

  // ========== REQUESTS ==========
  getAllRequests(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/requests`);
  }

  updateRequestStatus(id: number, status: string, responseMessage?: string): Observable<ServiceRequest> {
    let url = `${this.apiUrl}/requests/${id}/status?status=${status}`;
    if (responseMessage) url += `&responseMessage=${encodeURIComponent(responseMessage)}`;
    return this.http.patch<ServiceRequest>(url, null);
  }

  deleteRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/requests/${id}`);
  }

  // ========== ORDERS (COMMANDES) ==========
  // ✅ Ces méthodes étaient TOTALEMENT ABSENTES → dashboard admin ne chargeait rien

  /** Toutes les commandes (admin) */
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }

  /** Changer le statut d'une commande (admin) */
  updateOrderStatus(id: number, status: string, adminNote?: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${id}/status`, { status, adminNote });
  }

  /** Supprimer une commande */
  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/orders/${id}`);
  }

  /** Détail d'une commande */
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }
}