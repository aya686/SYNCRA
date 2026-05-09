// src/app/services/machine.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  subCategory?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMachineRequest {
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
  imageUrls: string[];
  supplierId: number;
  supplierName: string;
  isInApp: boolean;
  subCategory?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private apiUrl = 'http://localhost:8083/api/machines';

  constructor(private http: HttpClient) {}

  // Retourne TOUTES les machines (admin) ou filtrées par visibilité côté front
  getAllMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.apiUrl);
  }

  // Retourne uniquement les machines approuvées (endpoint public)
  getPublicMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(`${this.apiUrl}/public`);
  }

  getMachineById(id: number): Observable<Machine> {
    return this.http.get<Machine>(`${this.apiUrl}/${id}`);
  }

  getMachinesBySupplier(supplierId: number): Observable<Machine[]> {
    return this.http.get<Machine[]>(`${this.apiUrl}/supplier/${supplierId}`);
  }

  searchMachines(params: {
    keyword?: string;
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Observable<Machine[]> {
    let httpParams = new HttpParams();
    if (params.keyword)  httpParams = httpParams.set('keyword', params.keyword);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.location) httpParams = httpParams.set('location', params.location);
    if (params.minPrice != null) httpParams = httpParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice != null) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    return this.http.get<Machine[]>(`${this.apiUrl}/search`, { params: httpParams });
  }

  createMachine(machine: CreateMachineRequest): Observable<Machine> {
    return this.http.post<Machine>(this.apiUrl, machine);
  }

  updateMachine(id: number, machine: Partial<CreateMachineRequest>): Observable<Machine> {
    return this.http.put<Machine>(`${this.apiUrl}/${id}`, machine);
  }

  deleteMachine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}