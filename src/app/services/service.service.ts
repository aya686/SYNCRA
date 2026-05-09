// src/app/services/service.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  isInApp: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // ✅ AJOUTER CES PROPRIÉTÉS POUR LA VALIDATION
  validationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_REJECTED';
  rejectionReason?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  validatedBy?: number;
  subCategory?: string;
  businessType?: string;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  category: string;
  serviceType: string;
  availability: string;
  basePrice: number;
  priceUnit: string;
  location: string;
  contactInfo: string;
  imageUrls: string[];
  providerId: number;
  providerName: string;
  isInApp: boolean;
  subCategory?: string;
  businessType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = 'http://localhost:8083/api/services';

  constructor(private http: HttpClient) {}

  getAllServices(): Observable<ServiceEntity[]> {
    return this.http.get<ServiceEntity[]>(this.apiUrl);
  }

  getServiceById(id: number): Observable<ServiceEntity> {
    return this.http.get<ServiceEntity>(`${this.apiUrl}/${id}`);
  }

  createService(service: CreateServiceRequest): Observable<ServiceEntity> {
    return this.http.post<ServiceEntity>(this.apiUrl, service);
  }

  updateService(id: number, service: CreateServiceRequest): Observable<ServiceEntity> {
    return this.http.put<ServiceEntity>(`${this.apiUrl}/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getServicesByProvider(providerId: number): Observable<ServiceEntity[]> {
    return this.http.get<ServiceEntity[]>(`${this.apiUrl}/provider/${providerId}`);
  }

  getServicesByCategory(category: string): Observable<ServiceEntity[]> {
    return this.http.get<ServiceEntity[]>(`${this.apiUrl}/category/${category}`);
  }

  getAvailableServices(): Observable<ServiceEntity[]> {
    return this.http.get<ServiceEntity[]>(`${this.apiUrl}/available`);
  }

  getServicesByType(serviceType: string): Observable<ServiceEntity[]> {
    return this.http.get<ServiceEntity[]>(`${this.apiUrl}/type/${serviceType}`);
  }

  searchServices(filters: any): Observable<ServiceEntity[]> {
    let params = new HttpParams();
    
    if (filters.category) params = params.set('category', filters.category);
    if (filters.serviceType) params = params.set('serviceType', filters.serviceType);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.searchTerm) params = params.set('searchTerm', filters.searchTerm);
    if (filters.minPrice) params = params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice);
    
    return this.http.get<ServiceEntity[]>(`${this.apiUrl}/search`, { params });
  }
}